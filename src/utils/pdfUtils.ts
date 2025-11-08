// Lightweight PDF invoice generator using jsPDF. Draws text and lines directly (no DOM capture).
// If jsPDF is not installed yet, run: npm i jspdf

// Currency formatting utility for GNF
const formatCurrency = (amount: number, decimals: number = 0): string => {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  return `GNF ${formatted}`
}

async function loadLogoAsImageData(): Promise<string | null> {
  try {
    const logoModule = await import('../assets/BonecoleLogoImg.png?url');
    const logoUrl = logoModule.default;
    
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    
    return new Promise((resolve) => {
      if (typeof document === 'undefined') {
        resolve(null);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading logo:', error);
    return null;
  }
}

export interface InvoiceItem {
  description: string;
  qty: number;
  unitPrice: number;
}

export interface GenerateInvoiceParams {
  schoolName: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  orderId?: string;
}

export async function generateInvoicePdf(params: GenerateInvoiceParams): Promise<void> {
  const { schoolName, invoiceNumber, invoiceDate, dueDate, items, subtotal, orderId } = params;

  // @ts-ignore - allow dynamic import without type declarations
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pagePadding = 40;
  const rightX = 555; // approx right margin
  let y = pagePadding;

  // Load and add logo
  const logoData = await loadLogoAsImageData();
  if (logoData) {
    try {
      const logoWidth = 80; // Width in points
      const logoHeight = (logoWidth * 0.3); // Adjust height proportionally
      doc.addImage(logoData, 'PNG', rightX - logoWidth, pagePadding, logoWidth, logoHeight);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }

  // Header
  y += logoData ? 50 : 0; // Adjust y position if logo was added
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(schoolName || 'School', pagePadding, y);

  y += 36;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('INVOICE', pagePadding, y);

  // Invoice meta
  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);

  const formatDate = (d: Date) => d.toLocaleDateString();
  const logoOffset = logoData ? 50 : 0;
  const rightText = [
    `Invoice #: ${invoiceNumber}`,
    `Invoice date: ${formatDate(invoiceDate)}`,
    `Due date: ${formatDate(dueDate)}`,
    ...(orderId ? [`Order ID: ${orderId}`] : []),
  ];
  rightText.forEach((line, idx) => {
    doc.text(line, rightX, pagePadding + logoOffset + 36 + idx * 16, { align: 'right' });
  });

  // Table header
  y += 22;
  doc.setLineWidth(0.6);
  doc.line(pagePadding, y, rightX, y);
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.text('QTY', pagePadding, y);
  doc.text('Description', pagePadding + 60, y);
  doc.text('Unit Price', rightX - 140, y, { align: 'left' });
  doc.text('Amount', rightX, y, { align: 'right' });

  // Rows
  doc.setFont('helvetica', 'normal');
  y += 12;
  items.forEach((item) => {
    y += 22;
    doc.text(item.qty.toFixed(2), pagePadding, y);
    doc.text(item.description, pagePadding + 60, y);
    doc.text(item.unitPrice.toFixed(2), rightX - 140, y, { align: 'left' });
    doc.text((item.qty * item.unitPrice).toFixed(2), rightX, y, { align: 'right' });
  });

  // Subtotal
  y += 24;
  doc.line(pagePadding, y, rightX, y);
  y += 22;
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal', rightX - 140, y, { align: 'left' });
  doc.text(subtotal.toFixed(2), rightX, y, { align: 'right' });

  // Footer note
  y += 40;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Thank you for your business.', pagePadding, y);

  // Save
  const filenameSafe = invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${filenameSafe}.pdf`);
}

// Payment invoice with custom columns (Date, Total, Paid, Left, Method, Status, Invoice)
export interface PaymentInvoiceRow {
  date: string; // ISO or display string
  totalAmount: number;
  amountPaid: number;
  amountLeftToPay: number;
  method: string; // e.g., "Orange Money"
  status: string; // e.g., "Paid"
  invoice: string; // order id
  txnid?: string; // optional transaction id
}

export async function generatePaymentInvoicePdf(args: {
  schoolName: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date; // kept in signature for compatibility, but no longer rendered
  row: PaymentInvoiceRow;
}): Promise<void> {
  // @ts-ignore - allow dynamic import without type declarations
  const { default: jsPDF } = await import('jspdf');
  // Use landscape to provide more horizontal space
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });

  const pagePadding = 40;
  const pageWidth = (doc as any).internal.pageSize.getWidth();
  const rightX = pageWidth - pagePadding;
  let y = pagePadding;

  const logoData = await loadLogoAsImageData();
  let logoHeight = 0;
  if (logoData) {
    try {
      const logoWidth = 120;
      logoHeight = logoWidth * 0.3;
      doc.addImage(logoData, 'PNG', pagePadding, pagePadding, logoWidth, logoHeight);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }

  y = pagePadding + logoHeight + 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('À :', pagePadding, y);
  
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(args.schoolName || 'School', pagePadding + 10, y);

  y += 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('De :', pagePadding, y);
  
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Bonecole', pagePadding + 10, y);

  const formatDate = (d: Date) => d.toLocaleDateString();
  const invoiceY = pagePadding + logoHeight + 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Facture # : ${args.invoiceNumber}`, rightX, invoiceY, { align: 'right' });
  doc.text(`Date de facture : ${formatDate(args.invoiceDate)}`, rightX, invoiceY + 14, { align: 'right' });

  const tableTopY = pagePadding + logoHeight + 100;
  const rowHeight = 24;
  const headerHeight = 28;
  
  const col = {
    date: pagePadding + 12,
    method: pagePadding + 140,
    status: pagePadding + 260,
    txnid: pagePadding + 360,
    invoice: pagePadding + 480,
    amount: rightX - 12,
  } as const;

  const headerY = tableTopY + 10;
  
  doc.setFillColor(240, 240, 245);
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.rect(pagePadding, headerY, rightX - pagePadding, headerHeight, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  
  doc.text('Date', col.date, headerY + 18);
  doc.text('Méthode', col.method, headerY + 18);
  doc.text('Statut', col.status, headerY + 18);
  doc.text('ID de transaction', col.txnid, headerY + 18);
  doc.text('ID de commande', col.invoice, headerY + 18);
  doc.text('Montant', col.amount, headerY + 18, { align: 'right' });

  const dataRowY = headerY + headerHeight;
  
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(230, 230, 230);
  doc.rect(pagePadding, dataRowY, rightX - pagePadding, rowHeight, 'FD');

  const row = args.row;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const dateDisplay = new Date(row.date).toLocaleDateString();
  doc.text(dateDisplay, col.date, dataRowY + 16);
  const methodLabel = row.method === 'Orange Money' ? 'Orange Money' : row.method;
  doc.text(methodLabel, col.method, dataRowY + 16);
  doc.text(row.status, col.status, dataRowY + 16);
  doc.text(row.txnid || '-', col.txnid, dataRowY + 16);
  const invoiceText = row.invoice && row.invoice.length > 20 ? `${row.invoice.slice(0, 20)}…` : row.invoice;
  doc.text(invoiceText || '-', col.invoice, dataRowY + 16);
  doc.text(formatCurrency(args.row.amountPaid, 2), col.amount, dataRowY + 16, { align: 'right' });

  const tableBottomY = dataRowY + rowHeight;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(pagePadding, tableBottomY, rightX, tableBottomY);
  
  y = tableBottomY;

  const summaryY = y + 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Résumé des totaux', rightX - 50, summaryY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Total : ${formatCurrency(args.row.totalAmount, 2)}`, rightX, summaryY + 18, { align: 'right' });
  doc.text(`Payé : ${formatCurrency(args.row.amountPaid, 2)}`, rightX, summaryY + 32, { align: 'right' });
  // doc.text(`Reste : ${formatCurrency(args.row.amountLeftToPay, 2)}`, rightX, summaryY + 46, { align: 'right' });

  y += 32;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Merci pour la confidence.', pagePadding, y);

  const filenameSafe = (args.invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${filenameSafe}.pdf`);
}


