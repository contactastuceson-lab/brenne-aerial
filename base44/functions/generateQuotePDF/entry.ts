import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO_URL = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/ff90ec6fd_1775602844308.png';

const SERVICE_LABELS = {
  video_evenement: 'Vidéo événement',
  inspection_toiture: 'Inspection toiture',
  suivi_chantier: 'Suivi chantier',
  captation_particulier: 'Captation particulier',
  captation_entreprise: 'Captation entreprise',
  retour_temps_reel: 'Retour temps réel',
  photogrammetrie_3d: 'Photogrammétrie 3D',
  cartographie_releves: 'Cartographie / Relevés',
  thermographie: 'Thermographie infrarouge',
  surveillance: 'Surveillance / Gardiennage',
  contenu_social: 'Contenu réseaux sociaux',
  reportage: 'Reportage / Documentaire',
  mariage_aero: 'Mariage photo aérienne',
  immobilier_virtuelle: 'Visite immobilière virtuelle',
  agriculture: 'Agriculture / Monitoring',
  autre: 'Autre prestation',
};

const DURATION_LABELS = {
  '1h': '1 heure',
  '2-3h': '2 à 3 heures',
  'demi-journee': 'Demi-journée',
  'journee': 'Journée complète',
  'multi-jours': 'Multi-jours',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quoteId } = await req.json();
    if (!quoteId) {
      return Response.json({ error: 'Quote ID required' }, { status: 400 });
    }

    const quotes = await base44.entities.Quote.filter({ id: quoteId });
    if (!quotes.length) {
      return Response.json({ error: 'Quote not found' }, { status: 404 });
    }
    const q = quotes[0];

    const quoteRef = q.id.slice(-8).toUpperCase();
    const quoteDate = new Date(q.created_date || Date.now()).toLocaleDateString('fr-FR');
    const serviceLabel = SERVICE_LABELS[q.service_type] || q.service_type || 'Prestation drone';
    const durationLabel = DURATION_LABELS[q.duree_estimee] || q.duree_estimee || '';
    const displayPrice = q.prix_final || q.prix_estime;
    const fmtEur = (n) => n ? `${Number(n).toFixed(2)} €` : 'Sur devis';
    const dateStr = q.date_souhaitee ? new Date(q.date_souhaitee).toLocaleDateString('fr-FR') : 'Non définie';

    const prompt = `Tu es un expert en création de documents professionnels. Génère un devis HTML complet, élégant et professionnel pour une entreprise de drone.

DONNÉES DU DEVIS:
- Référence: DEV-${quoteRef}
- Date d'émission: ${quoteDate}
- Client: ${q.client_name || 'N/A'}
- Email client: ${q.client_email || 'N/A'}
- Téléphone: ${q.client_phone || 'N/A'}
- Société: ${q.company || 'Particulier'}
- Service demandé: ${serviceLabel}
- Durée estimée: ${durationLabel || 'Non précisée'}
- Date souhaitée: ${dateStr}
- Horaire: ${q.horaire || 'Non précisé'}
- Lieu: ${q.location || 'Non précisé'}
- Description: ${q.description || 'Aucune description fournie'}
- Prix estimé HT: ${fmtEur(displayPrice)}
- Notes admin: ${q.admin_notes || ''}
- Statut: ${q.status || 'pending'}

ENTREPRISE PRESTATAIRE:
- Nom: Brenne Aerial
- Adresse: Brenne, Indre (36), France
- Email: contact@brenneaerial.fr
- Web: brenneaerial.fr
- SIRET: En cours d'enregistrement
- Spécialité: Opérateur drone professionnel certifié DGAC

INSTRUCTIONS HTML:
- Génère un document HTML COMPLET avec <html>, <head>, <body> et CSS inline très riche
- Format A4 (210mm × 297mm), width: 794px pour l'affichage
- Style: professionnel, moderne, bleu marine (#0a1628) et bleu ciel (#38aadc) comme couleurs principales
- IMPORTANT: Intègre le logo en haut à gauche avec cette URL: ${LOGO_URL} (max-height: 90px)
- Header: logo + nom entreprise + badge "DEVIS PROFESSIONNEL" + référence + date
- Section client et prestataire côte à côte dans des cartes
- Tableau des prestations avec colonnes: Désignation, Quantité, P.U. HT, Total HT
- Bloc totaux (HT, TVA non applicable art.293B CGI, TTC) en bas à droite
- Si des notes admin existent, affiche-les dans un encadré doré/ambre
- Conditions générales en bas: validité 30 jours, frais déplacement >30km en sus, soumis DGAC
- Footer avec infos entreprise et numéro de page
- Utilise des dégradés, ombres, bordures arrondies pour un rendu premium
- Tout le CSS doit être inline dans les balises style="" ou dans un <style> dans le <head>
- Le document doit être prêt à être converti en PDF via html2canvas
- Assure-toi que les accents français s'affichent correctement (UTF-8)
- NE mets PAS de markdown, JUSTE le HTML pur

Génère uniquement le HTML, rien d'autre.`;

    const htmlContent = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
    });

    return Response.json({ html: htmlContent, ref: quoteRef });

  } catch (err) {
    console.error('PDF generation error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});