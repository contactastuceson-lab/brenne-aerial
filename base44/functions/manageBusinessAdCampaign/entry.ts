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
      return Response.json({ success: true, data: all || [], quota, credits: Number(user.referral_credits) || 0 });
    }

    // ── CREATE : nouvelle campagne (draft) ──
    // Coût obligatoire en crédits Eza — déduit du solde du business.
    const MIN_BUDGET = 50;
    if (action === 'create') {
      const { title, advertiser_name, image_url, cta_url, cta_label, headline, body: adBody, placement, starts_at, ends_at, budget_credits, daily_budget } = body || {};
      if (!title || !title.trim()) return Response.json({ error: 'Titre requis' }, { status: 400 });
      if (!placement || !PLACEMENTS.includes(placement)) return Response.json({ error: 'Emplacement invalide' }, { status: 400 });

      const budget = Number(budget_credits) || 0;
      if (budget < MIN_BUDGET) {
        return Response.json({ error: `Budget minimum requis : ${MIN_BUDGET} crédits Eza.`, min: MIN_BUDGET }, { status: 400 });
      }

      const daily = Math.max(MIN_DAILY, Number(daily_budget) || 10);
      if (daily > budget) {
        return Response.json({ error: `Le budget journalier (${daily}) ne peut pas dépasser le budget total (${budget}).` }, { status: 400 });
      }

      // Vérifier le solde de crédits de l'utilisateur
      const currentCredits = Number(user.referral_credits) || 0;
      if (currentCredits < budget) {
        return Response.json({ error: `Crédits insuffisants. Vous avez ${currentCredits} crédits, la campagne coûte ${budget}.`, needed: budget, available: currentCredits }, { status: 400 });
      }

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

      // Déduire les crédits du business
      const newCredits = currentCredits - budget;
      await base44.asServiceRole.entities.User.update(user.id, { referral_credits: newCredits });

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
        budget_credits: budget,
        credits_remaining: budget,
        daily_budget: daily,
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
          content: `${user.display_name || user.username} (${user.email}) a soumis la campagne "${title.trim()}" (${placement}) pour ${budget} crédits. À valider dans Admin › Publicité.`,
          sender_name: user.display_name || user.username,
          sender_id: user.id,
        });
      } catch {}

      return Response.json({ success: true, data: campaign, remainingCredits: newCredits, message: `Campagne soumise — ${budget} crédits débités. En attente de validation admin.` });
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
      for (const k of ['title', 'advertiser_name', 'image_url', 'cta_url', 'cta_label', 'headline', 'body', 'placement', 'starts_at', 'ends_at', 'budget_credits', 'daily_budget', 'target_hashtags']) {
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

    // ── RECHARGE : recharger le solde crédits d'une campagne en pause ──
    if (action === 'recharge') {
      const { campaignId, amount } = body || {};
      if (!campaignId) return Response.json({ error: 'campaignId requis' }, { status: 400 });
      const rechargeAmount = Number(amount) || 0;
      if (rechargeAmount < MIN_BUDGET) {
        return Response.json({ error: `Rechargement minimum : ${MIN_BUDGET} crédits.`, min: MIN_BUDGET }, { status: 400 });
      }

      // Vérifier le solde de crédits de l'utilisateur
      const currentCredits = Number(user.referral_credits) || 0;
      if (currentCredits < rechargeAmount) {
        return Response.json({ error: `Crédits insuffisants. Vous avez ${currentCredits} crédits, rechargement demandé : ${rechargeAmount}.`, needed: rechargeAmount, available: currentCredits }, { status: 400 });
      }

      let campaign;
      try { campaign = await base44.asServiceRole.entities.AdCampaign.get(campaignId); } catch {
        return Response.json({ error: 'Campagne introuvable' }, { status: 404 });
      }
      if (campaign.owner_id !== user.id) {
        return Response.json({ error: 'Vous ne pouvez recharger que vos propres campagnes' }, { status: 403 });
      }

      // Déduire les crédits du business et recharger la campagne
      const newCredits = currentCredits - rechargeAmount;
      await base44.asServiceRole.entities.User.update(user.id, { referral_credits: newCredits });

      const newRemaining = (Number(campaign.credits_remaining) || 0) + rechargeAmount;
      // Si la campagne était en pause auto (crédits épuisés), la repasser en active
      const newStatus = campaign.auto_paused_reason || campaign.status === 'paused' ? 'active' : campaign.status;
      const updated = await base44.asServiceRole.entities.AdCampaign.update(campaignId, {
        credits_remaining: newRemaining,
        budget_credits: (Number(campaign.budget_credits) || 0) + rechargeAmount,
        status: newStatus,
        auto_paused_reason: null,
      });

      // Notifier l'admin
      try {
        await base44.asServiceRole.entities.Notification.create({
          user_email: 'contact.astuceson@gmail.com',
          type: 'system',
          title: '🔄 Campagne pub rechargée',
          content: `${user.display_name || user.username} a rechargé la campagne "${campaign.title}" de ${rechargeAmount} crédits. Nouveau solde : ${newRemaining}. Statut : ${newStatus}.`,
          sender_name: user.display_name || user.username,
          sender_id: user.id,
        });
      } catch {}

      return Response.json({ success: true, data: updated, remainingCredits: newCredits, message: `Campagne rechargée de ${rechargeAmount} crédits. ${newStatus === 'active' ? 'Remise en ligne.' : ''}` });
    }

    return Response.json({ error: 'Action non supportée. Utiliser: list, create, update, delete, recharge' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}