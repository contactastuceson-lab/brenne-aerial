import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Système de campagnes publicitaires self-service pour les comptes Business.
// Les campagnes créées par les business sont en statut "draft" (en attente de validation admin).
// L'admin active/mets en pause via AdminAds. Le business peut modifier le contenu et supprimer.

const PLACEMENTS = ['feed_banner', 'between_posts', 'sidebar'];

function isPerkActive(perks, key) {
  if (!perks) return false;
  const v = perks[key];
  if (v === true || v === null) return true;
  if (typeof v === 'string') return new Date(v).getTime() > Date.now();
  return false;
}

function hasBusiness(perks = {}) {
  return isPerkActive(perks, 'business_until')
    || isPerkActive(perks, 'enterprise_until')
    || isPerkActive(perks, 'vip_until');
}

function getBusinessQuota(perks = {}) {
  if (isPerkActive(perks, 'enterprise_until') || isPerkActive(perks, 'vip_until')) return Infinity;
  if (isPerkActive(perks, 'business_until')) return 5;
  return 0;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non connecté' }, { status: 401 });

    const perks = user.perks || {};
    if (!hasBusiness(perks)) {
      return Response.json({ error: 'Réservé aux abonnés Business. Passez à Business pour créer des campagnes.' }, { status: 403 });
    }

    let body;
    try { body = await req.json(); } catch { return Response.json({ error: 'Payload invalide' }, { status: 400 }); }
    const { action } = body || {};
    const quota = getBusinessQuota(perks);

    // ── LIST : campagnes du business ──
    if (action === 'list') {
      const all = await base44.asServiceRole.entities.AdCampaign.filter(
        { owner_id: user.id },
        '-created_date',
        100
      );
      return Response.json({ success: true, data: all || [], quota });
    }

    // ── CREATE : nouvelle campagne (draft) ──
    if (action === 'create') {
      const { title, advertiser_name, image_url, cta_url, cta_label, headline, body: adBody, placement, starts_at, ends_at, budget_credits } = body || {};
      if (!title || !title.trim()) return Response.json({ error: 'Titre requis' }, { status: 400 });
      if (!placement || !PLACEMENTS.includes(placement)) return Response.json({ error: 'Emplacement invalide' }, { status: 400 });

      // Vérifier le quota (campagnes non terminées)
      const existing = await base44.asServiceRole.entities.AdCampaign.filter(
        { owner_id: user.id },
        '-created_date',
        100
      );
      const activeDrafts = (existing || []).filter(c => c.status === 'draft' || c.status === 'active' || c.status === 'paused');
      if (activeDrafts.length >= quota) {
        return Response.json({ error: `Quota atteint (${quota} campagnes maximum). Supprimez ou terminez une campagne existante.` }, { status: 400 });
      }

      const campaign = await base44.asServiceRole.entities.AdCampaign.create({
        title: title.trim(),
        advertiser_name: advertiser_name || user.display_name || user.full_name || '',
        image_url: image_url || '',
        cta_url: cta_url || '',
        cta_label: cta_label || 'En savoir plus',
        headline: headline || '',
        body: adBody || '',
        placement,
        status: 'draft',
        starts_at: starts_at || null,
        ends_at: ends_at || null,
        budget_credits: Number(budget_credits) || 0,
        impressions: 0,
        clicks: 0,
        owner_id: user.id,
      });

      // Notifier l'admin d'une nouvelle campagne à valider
      try {
        await base44.asServiceRole.entities.Notification.create({
          user_email: 'contact.astuceson@gmail.com',
          type: 'system',
          title: '📢 Nouvelle campagne pub à valider',
          content: `${user.display_name || user.username} (${user.email}) a soumis la campagne "${title.trim()}" (${placement}). À valider dans Admin › Publicité.`,
          sender_name: user.display_name || user.username,
          sender_id: user.id,
        });
      } catch {}

      return Response.json({ success: true, data: campaign, message: 'Campagne soumise — en attente de validation admin.' });
    }

    // ── UPDATE : modifier le contenu (statut reste draft sauf si admin) ──
    if (action === 'update') {
      const { campaignId, patch } = body || {};
      if (!campaignId) return Response.json({ error: 'campaignId requis' }, { status: 400 });

      let campaign;
      try { campaign = await base44.asServiceRole.entities.AdCampaign.get(campaignId); } catch {
        return Response.json({ error: 'Campagne introuvable' }, { status: 404 });
      }
      if (campaign.owner_id !== user.id) {
        return Response.json({ error: 'Vous ne pouvez modifier que vos propres campagnes' }, { status: 403 });
      }

      // Le business ne peut pas changer le statut — seul l'admin active
      const allowed = {};
      for (const k of ['title', 'advertiser_name', 'image_url', 'cta_url', 'cta_label', 'headline', 'body', 'placement', 'starts_at', 'ends_at', 'budget_credits', 'target_hashtags']) {
        if (k in (patch || {})) allowed[k] = patch[k];
      }
      // Si la campagne était active et le business modifie le contenu → repasser en draft pour re-validation
      if (campaign.status === 'active' && Object.keys(allowed).length > 0) {
        allowed.status = 'draft';
      }

      const updated = await base44.asServiceRole.entities.AdCampaign.update(campaignId, allowed);
      return Response.json({ success: true, data: updated, message: 'Campagne mise à jour. Re-soumise pour validation si elle était en ligne.' });
    }

    // ── DELETE : supprimer sa campagne ──
    if (action === 'delete') {
      const { campaignId } = body || {};
      if (!campaignId) return Response.json({ error: 'campaignId requis' }, { status: 400 });

      let campaign;
      try { campaign = await base44.asServiceRole.entities.AdCampaign.get(campaignId); } catch {
        return Response.json({ error: 'Campagne introuvable' }, { status: 404 });
      }
      if (campaign.owner_id !== user.id) {
        return Response.json({ error: 'Vous ne pouvez supprimer que vos propres campagnes' }, { status: 403 });
      }

      await base44.asServiceRole.entities.AdCampaign.delete(campaignId);
      return Response.json({ success: true, message: 'Campagne supprimée' });
    }

    return Response.json({ error: 'Action non supportée. Utiliser: list, create, update, delete' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}