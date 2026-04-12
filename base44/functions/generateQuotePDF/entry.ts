import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

const LOGO_URL = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/6de51adde_1775602844308.png';
const COMPANY_NAME = 'Brenne Aerial';
const COMPANY_EMAIL = 'contact@brenneaerial.fr';
const COMPANY_PHONE = '+33 (0) 6 XX XX XX XX';
const COMPANY_ADDRESS = 'Brenne, Creuse, France';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.role === 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { quoteId } = await req.json();
    if (!quoteId) {
      return Response.json({ error: 'Quote ID required' }, { status: 400 });
    }

    // Fetch quote and services
    const quote = await base44.entities.Quote.filter({ id: quoteId });
    if (!quote.length) {
      return Response.json({ error: 'Quote not found' }, { status: 404 });
    }

    const q = quote[0];
    const services = await base44.entities.Service.list();
    const service = services.find(s => s.name === q.service_type);

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 15;

    // Header
    doc.setFillColor(13, 26, 46);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Company logo/name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(COMPANY_NAME, 15, 25);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(106, 174, 212);
    doc.text('Devis Professionnel', 15, 35);

    // Invoice number and date
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(9);
    doc.text(`Devis #${q.id.slice(0, 8).toUpperCase()}`, pageWidth - 50, 25);
    doc.text(`Date: ${new Date(q.created_date).toLocaleDateString('fr-FR')}`, pageWidth - 50, 35);

    y = 65;

    // Client info section
    doc.setTextColor(58, 106, 122);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('CLIENT', 15, y);

    y += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`${q.client_name}`, 15, y);
    y += 6;
    doc.text(`${q.client_email}`, 15, y);
    y += 6;
    if (q.client_phone) {
      doc.text(`${q.client_phone}`, 15, y);
      y += 6;
    }
    if (q.company) {
      doc.text(`Entreprise: ${q.company}`, 15, y);
      y += 6;
    }

    y += 4;

    // Company info section
    doc.setTextColor(58, 106, 122);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('PRESTATAIRE', pageWidth / 2 + 10, 65);

    y = 73;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(COMPANY_NAME, pageWidth / 2 + 10, y);
    y += 5;
    doc.text(COMPANY_ADDRESS, pageWidth / 2 + 10, y);
    y += 5;
    doc.text(COMPANY_EMAIL, pageWidth / 2 + 10, y);
    y += 5;
    doc.text(COMPANY_PHONE, pageWidth / 2 + 10, y);

    y = 110;

    // Service details
    doc.setTextColor(58, 106, 122);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('DÉTAILS DU DEVIS', 15, y);

    y += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    const details = [
      ['Type de service:', q.service_type],
      ['Date souhaitée:', new Date(q.date_souhaitee).toLocaleDateString('fr-FR')],
      ['Lieu:', q.location || '-'],
      ['Durée estimée:', q.duree_estimee || '-'],
      ['Description:', q.description || '-'],
    ];

    details.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 15, y);
      doc.setFont(undefined, 'normal');
      doc.text(value, 60, y);
      y += 6;
    });

    y += 6;

    // Pricing table
    doc.setFillColor(30, 48, 72);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);

    const tableY = y;
    doc.rect(15, tableY, pageWidth - 30, 8, 'F');
    doc.text('Designation', 20, tableY + 6);
    doc.text('Tarif', pageWidth - 70, tableY + 6);
    doc.text('Montant', pageWidth - 35, tableY + 6);

    y = tableY + 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    let subtotal = 0;

    // Base price
    if (service?.base_price) {
      const amount = service.base_price;
      doc.text('Prix de base', 20, y);
      doc.text(`${amount.toFixed(2)}€`, pageWidth - 70, y);
      doc.text(`${amount.toFixed(2)}€`, pageWidth - 35, y);
      subtotal += amount;
      y += 6;
    }

    // Hourly rate (if applicable)
    if (q.duree_estimee && service?.price_per_hour) {
      const hours = q.duree_estimee === '1h' ? 1 : q.duree_estimee === '2-3h' ? 2.5 : q.duree_estimee === 'demi-journee' ? 4 : q.duree_estimee === 'journee' ? 8 : 0;
      if (hours > 0) {
        const amount = service.price_per_hour * hours;
        doc.text(`Tarif horaire (${hours}h)`, 20, y);
        doc.text(`${service.price_per_hour.toFixed(2)}€/h`, pageWidth - 70, y);
        doc.text(`${amount.toFixed(2)}€`, pageWidth - 35, y);
        subtotal += amount;
        y += 6;
      }
    }

    // Admin notes / custom pricing
    if (q.prix_final && q.prix_final !== subtotal) {
      y += 2;
      doc.setFillColor(240, 248, 255);
      doc.rect(15, y - 2, pageWidth - 30, 6, 'F');
      doc.setTextColor(58, 106, 122);
      doc.setFont(undefined, 'bold');
      doc.text('Prix final proposé', 20, y + 2);
      doc.text(`${q.prix_final.toFixed(2)}€`, pageWidth - 35, y + 2);
      y += 6;
    }

    // Total
    y += 3;
    doc.setFillColor(13, 26, 46);
    doc.rect(15, y, pageWidth - 30, 8, 'F');
    doc.setTextColor(58, 170, 220);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    const total = q.prix_final || subtotal;
    doc.text('TOTAL', 20, y + 6);
    doc.text(`${total.toFixed(2)}€`, pageWidth - 35, y + 6);

    y += 12;

    // Notes
    if (q.admin_notes) {
      doc.setTextColor(58, 106, 122);
      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      doc.text('Notes:', 15, y);
      y += 6;
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      const noteLines = doc.splitTextToSize(q.admin_notes, pageWidth - 30);
      doc.text(noteLines, 15, y);
      y += noteLines.length * 4 + 4;
    }

    // Footer
    doc.setTextColor(106, 174, 212);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Ce devis est valable 30 jours à partir de la date d\'émission.', 15, pageHeight - 15);
    doc.text(`© ${new Date().getFullYear()} ${COMPANY_NAME} - ${COMPANY_EMAIL}`, 15, pageHeight - 10);

    // Return PDF
    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="devis-${q.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});