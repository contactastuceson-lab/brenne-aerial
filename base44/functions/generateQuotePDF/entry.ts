import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

const COMPANY_NAME = 'Brenne Aerial';
const COMPANY_EMAIL = 'contact@brenneaerial.fr';
const COMPANY_PHONE = '+33 (0)6 XX XX XX XX';
const COMPANY_ADDRESS = 'Brenne, Indre, France';
const COMPANY_WEB = 'brenneaerial.fr';
const COMPANY_SIRET = 'SIRET : En cours';

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

// Color palette
const C = {
  navy:    [6, 14, 30],
  blue:    [30, 90, 150],
  accent:  [56, 170, 220],
  accentL: [100, 190, 235],
  white:   [255, 255, 255],
  light:   [230, 240, 250],
  gray:    [140, 155, 170],
  dark:    [30, 45, 65],
  mid:     [80, 100, 125],
  row1:    [245, 249, 253],
  row2:    [235, 243, 251],
};

function rgb(arr) { return { r: arr[0], g: arr[1], b: arr[2] }; }
function setFill(doc, arr) { doc.setFillColor(arr[0], arr[1], arr[2]); }
function setStroke(doc, arr) { doc.setDrawColor(arr[0], arr[1], arr[2]); }
function setColor(doc, arr) { doc.setTextColor(arr[0], arr[1], arr[2]); }

// Normalize accented French characters for jsPDF Helvetica compatibility
function clean(str) {
  if (!str) return '';
  return String(str)
    .replace(/[àâä]/g, 'a').replace(/[ÀÂÄÄ]/g, 'A')
    .replace(/[éèêë]/g, 'e').replace(/[ÉÈÊË]/g, 'E')
    .replace(/[îï]/g, 'i').replace(/[ÎÏ]/g, 'I')
    .replace(/[ôö]/g, 'o').replace(/[ÔÖ]/g, 'O')
    .replace(/[ùûü]/g, 'u').replace(/[ÙÛÜ]/g, 'U')
    .replace(/[ç]/g, 'c').replace(/[Ç]/g, 'C')
    .replace(/[æ]/g, 'ae').replace(/[œ]/g, 'oe')
    .replace(/[«»]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/['']/g, "'");
}

function wrapText(doc, text, x, y, maxWidth, lineHeight = 5) {
  const lines = doc.splitTextToSize(String(text || ''), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

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

    // Fetch quote
    const quotes = await base44.entities.Quote.filter({ id: quoteId });
    if (!quotes.length) {
      return Response.json({ error: 'Quote not found' }, { status: 404 });
    }
    const q = quotes[0];

    // ──────────────────────────────────────────────────────────────
    // PDF Setup
    // ──────────────────────────────────────────────────────────────
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const PW = doc.internal.pageSize.getWidth();   // 210
    const PH = doc.internal.pageSize.getHeight();  // 297
    const ML = 14; // margin left
    const MR = 14; // margin right
    const CW = PW - ML - MR; // content width

    // ──────────────────────────────────────────────────────────────
    // 1. HERO HEADER (full-width dark band)
    // ──────────────────────────────────────────────────────────────
    setFill(doc, C.navy);
    doc.rect(0, 0, PW, 52, 'F');

    // Accent stripe
    setFill(doc, C.accent);
    doc.rect(0, 52, PW, 2, 'F');

    // Drone icon (simplified geometric) at right
    setFill(doc, [20, 50, 90]);
    doc.circle(PW - 28, 26, 18, 'F');
    setFill(doc, C.accent);
    doc.circle(PW - 28, 26, 14, 'F');
    setFill(doc, C.navy);
    doc.circle(PW - 28, 26, 9, 'F');
    // Cross arms
    setFill(doc, C.accentL);
    doc.rect(PW - 42, 24.5, 28, 3, 'F');
    doc.rect(PW - 29.5, 12, 3, 28, 'F');
    // Propellers
    setFill(doc, C.white);
    doc.ellipse(PW - 44, 26, 4, 1.5, 'F');
    doc.ellipse(PW - 12, 26, 4, 1.5, 'F');
    doc.ellipse(PW - 28, 12, 1.5, 4, 'F');
    doc.ellipse(PW - 28, 40, 1.5, 4, 'F');

    // Company name — large
    setColor(doc, C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('BRENNE', ML, 24);

    setColor(doc, C.accent);
    doc.setFontSize(26);
    const brenneWidth = doc.getTextWidth('BRENNE');
    doc.text(' AERIAL', ML + brenneWidth - 1, 24);

    // Tagline
    setColor(doc, C.accentL);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(clean('Operateur drone professionnel certifie'), ML, 32);

    // Doc type pill
    setFill(doc, C.accent);
    doc.roundedRect(ML, 38, 48, 8, 2, 2, 'F');
    setColor(doc, C.navy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('DEVIS PROFESSIONNEL', ML + 3, 43.5);

    // Ref + date — right side of header
    const quoteRef = q.id.slice(-8).toUpperCase();
    const quoteDate = new Date(q.created_date || Date.now()).toLocaleDateString('fr-FR');
    setColor(doc, C.light);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Ref. DEV-${quoteRef}`, PW - MR, 39, { align: 'right' });
    doc.text(`Emis le ${quoteDate}`, PW - MR, 45, { align: 'right' });

    // ──────────────────────────────────────────────────────────────
    // 2. INFO CARDS — Client & Prestataire (side by side)
    // ──────────────────────────────────────────────────────────────
    let y = 62;
    const halfW = (CW - 6) / 2;

    // Client card
    setFill(doc, C.row1);
    setStroke(doc, [200, 215, 235]);
    doc.setLineWidth(0.3);
    doc.roundedRect(ML, y, halfW, 44, 3, 3, 'FD');

    // Client card header
    setFill(doc, C.blue);
    doc.roundedRect(ML, y, halfW, 8, 3, 3, 'F');
    doc.rect(ML, y + 4, halfW, 4, 'F');

    setColor(doc, C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('CLIENT', ML + 4, y + 5.5);

    setColor(doc, C.dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(clean(q.client_name || 'N/A'), ML + 4, y + 16);

    setColor(doc, C.mid);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    let cy = y + 22;
    if (q.company) {
      doc.text(clean(q.company), ML + 4, cy); cy += 5;
    }
    doc.text(q.client_email || 'N/A', ML + 4, cy); cy += 5;
    if (q.client_phone) {
      doc.text(q.client_phone, ML + 4, cy); cy += 5;
    }

    // Prestataire card
    const rx = ML + halfW + 6;
    setFill(doc, C.row1);
    doc.roundedRect(rx, y, halfW, 44, 3, 3, 'FD');

    setFill(doc, C.navy);
    doc.roundedRect(rx, y, halfW, 8, 3, 3, 'F');
    doc.rect(rx, y + 4, halfW, 4, 'F');

    setColor(doc, C.accent);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('PRESTATAIRE', rx + 4, y + 5.5);

    setColor(doc, C.dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(COMPANY_NAME, rx + 4, y + 16);

    setColor(doc, C.mid);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(COMPANY_ADDRESS, rx + 4, y + 22);
    doc.text(COMPANY_EMAIL, rx + 4, y + 27);
    doc.text(COMPANY_PHONE, rx + 4, y + 32);
    doc.text(COMPANY_WEB, rx + 4, y + 37);

    y += 50;

    // ──────────────────────────────────────────────────────────────
    // 3. MISSION DETAILS SECTION
    // ──────────────────────────────────────────────────────────────
    // Section title
    setFill(doc, C.navy);
    doc.rect(ML, y, CW, 8, 'F');
    setFill(doc, C.accent);
    doc.rect(ML, y, 3, 8, 'F');
    setColor(doc, C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('DETAILS DE LA MISSION', ML + 7, y + 5.5);

    y += 12;

    const detailRows = [
      ['Service demande', clean(SERVICE_LABELS[q.service_type] || q.service_type || '-')],
      ['Duree estimee', clean(DURATION_LABELS[q.duree_estimee] || q.duree_estimee || '-')],
      ['Date souhaitee', q.date_souhaitee ? new Date(q.date_souhaitee).toLocaleDateString('fr-FR') : '-'],
      ['Horaire', clean(q.horaire || '-')],
      ['Lieu de la prestation', clean(q.location || '-')],
    ];

    detailRows.forEach(([label, val], i) => {
      setFill(doc, i % 2 === 0 ? C.row1 : C.row2);
      doc.rect(ML, y, CW, 7, 'F');
      setStroke(doc, [210, 225, 240]);
      doc.setLineWidth(0.1);
      doc.rect(ML, y, CW, 7, 'S');

      setColor(doc, C.mid);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(clean(label), ML + 4, y + 4.8);

      setColor(doc, C.dark);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(String(val), CW - 75);
      doc.text(clean(lines[0]), ML + 70, y + 4.8);

      y += 7;
    });

    // Description
    if (q.description) {
      y += 3;
      setFill(doc, C.row1);
      setStroke(doc, [210, 225, 240]);
      doc.setLineWidth(0.3);
      const descLines = doc.splitTextToSize(clean(q.description), CW - 8);
      const descH = Math.max(descLines.length * 5 + 10, 20);
      doc.roundedRect(ML, y, CW, descH, 2, 2, 'FD');

      setFill(doc, C.accent);
      doc.roundedRect(ML, y, 3, descH, 2, 2, 'F');

      setColor(doc, C.mid);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Description du projet', ML + 7, y + 5);

      setColor(doc, C.dark);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(descLines, ML + 7, y + 11);
      y += descH + 6;
    } else {
      y += 4;
    }

    // ──────────────────────────────────────────────────────────────
    // 4. PRICING TABLE
    // ──────────────────────────────────────────────────────────────
    setFill(doc, C.navy);
    doc.rect(ML, y, CW, 8, 'F');
    setFill(doc, C.accent);
    doc.rect(ML, y, 3, 8, 'F');
    setColor(doc, C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('TARIFICATION', ML + 7, y + 5.5);

    y += 10;

    // Table header
    setFill(doc, C.blue);
    doc.rect(ML, y, CW, 7, 'F');
    setColor(doc, C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Designation', ML + 4, y + 5);
    doc.text('Qte', ML + CW - 50, y + 5, { align: 'center' });
    doc.text('P.U. HT', ML + CW - 28, y + 5, { align: 'right' });
    doc.text('Total HT', ML + CW - 2, y + 5, { align: 'right' });
    y += 7;

    let subtotal = 0;
    let rowIdx = 0;

    const addRow = (label, qty, pu, total) => {
      setFill(doc, rowIdx % 2 === 0 ? C.row1 : C.row2);
      doc.rect(ML, y, CW, 7, 'F');
      setStroke(doc, [210, 225, 240]);
      doc.setLineWidth(0.1);
      doc.rect(ML, y, CW, 7, 'S');

      setColor(doc, C.dark);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(clean(label), ML + 4, y + 4.8);
      doc.text(String(qty), ML + CW - 50, y + 4.8, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.text(pu, ML + CW - 28, y + 4.8, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(total, ML + CW - 2, y + 4.8, { align: 'right' });

      y += 7;
      rowIdx++;
    };

    const fmtEur = (n) => `${Number(n).toFixed(2)} €`;

    // Estimate or final price
    const displayPrice = q.prix_final || q.prix_estime;
    if (displayPrice) {
      const serviceLabel = clean(SERVICE_LABELS[q.service_type] || q.service_type || 'Prestation drone');
      const durLabel = clean(DURATION_LABELS[q.duree_estimee] || q.duree_estimee || '');
      addRow(`${serviceLabel}${durLabel ? ' - ' + durLabel : ''}`, '1', fmtEur(displayPrice), fmtEur(displayPrice));
      subtotal = displayPrice;
    } else {
      addRow(clean(SERVICE_LABELS[q.service_type] || 'Prestation drone'), '1', 'Sur devis', 'Sur devis');
    }

    // Total block
    y += 2;
    const totalH = 14;
    setFill(doc, C.navy);
    doc.roundedRect(ML + CW - 70, y, 70, totalH, 2, 2, 'F');

    setColor(doc, C.accentL);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('TOTAL HT', ML + CW - 66, y + 4.5);
    doc.text('TVA (non appl., art. 293B CGI)', ML + CW - 66, y + 8.5);

    setColor(doc, C.accent);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(subtotal ? fmtEur(subtotal) : 'Sur devis', ML + CW - 2, y + 4.5, { align: 'right' });
    doc.text('0,00 €', ML + CW - 2, y + 8.5, { align: 'right' });

    setFill(doc, C.accent);
    doc.roundedRect(ML + CW - 70, y + 10, 70, 7, 2, 2, 'F');
    setColor(doc, C.navy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('TOTAL TTC', ML + CW - 66, y + 15.2);
    doc.text(subtotal ? fmtEur(subtotal) : 'Sur devis', ML + CW - 2, y + 15.2, { align: 'right' });

    y += totalH + 10;

    // ──────────────────────────────────────────────────────────────
    // 5. ADMIN NOTES (if any)
    // ──────────────────────────────────────────────────────────────
    if (q.admin_notes) {
      setFill(doc, [255, 249, 235]);
      setStroke(doc, [230, 200, 100]);
      doc.setLineWidth(0.3);
      const noteLines = doc.splitTextToSize(clean(q.admin_notes), CW - 16);
      const noteH = noteLines.length * 5 + 12;
      doc.roundedRect(ML, y, CW, noteH, 3, 3, 'FD');
      setFill(doc, [220, 170, 0]);
      doc.roundedRect(ML, y, 3, noteH, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      setColor(doc, [120, 90, 0]);
      doc.text('Notes & conditions particulieres', ML + 7, y + 5.5);

      doc.setFont('helvetica', 'normal');
      setColor(doc, [80, 60, 0]);
      doc.text(noteLines, ML + 7, y + 11);
      y += noteH + 6;
    }

    // ──────────────────────────────────────────────────────────────
    // 6. VALIDITY & CONDITIONS
    // ──────────────────────────────────────────────────────────────
    if (y < PH - 55) {
      setFill(doc, [240, 246, 252]);
      setStroke(doc, [200, 220, 240]);
      doc.setLineWidth(0.2);
      doc.roundedRect(ML, y, CW, 22, 3, 3, 'FD');

      setColor(doc, C.blue);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('CONDITIONS GENERALES', ML + 4, y + 5.5);

      setColor(doc, C.mid);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('- Ce devis est valable 30 jours a compter de sa date d\'emission.', ML + 4, y + 10.5);
      doc.text('- Les frais de deplacement (au-dela de 30 km) sont factures en sus selon bareme en vigueur.', ML + 4, y + 15.5);
      doc.text('- Prestation soumise a conditions meteorologiques et reglementation DGAC en vigueur.', ML + 4, y + 20);
      y += 28;
    }

    // ──────────────────────────────────────────────────────────────
    // 7. FOOTER
    // ──────────────────────────────────────────────────────────────
    setFill(doc, C.navy);
    doc.rect(0, PH - 18, PW, 18, 'F');
    setFill(doc, C.accent);
    doc.rect(0, PH - 18, PW, 1.5, 'F');

    setColor(doc, C.accentL);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(COMPANY_NAME, ML, PH - 10.5);

    setColor(doc, C.gray);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`${COMPANY_ADDRESS}  ·  ${COMPANY_EMAIL}  ·  ${COMPANY_WEB}`, ML, PH - 6);

    setColor(doc, C.gray);
    doc.setFontSize(7);
    doc.text(`Ref. DEV-${quoteRef}  -  ${COMPANY_SIRET}`, PW - MR, PH - 6, { align: 'right' });

    // Page number
    setColor(doc, C.accentL);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Page 1 / 1', PW - MR, PH - 10.5, { align: 'right' });

    // ──────────────────────────────────────────────────────────────
    // Output
    // ──────────────────────────────────────────────────────────────
    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="devis-${quoteRef}.pdf"`,
      },
    });
  } catch (err) {
    console.error('PDF error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});