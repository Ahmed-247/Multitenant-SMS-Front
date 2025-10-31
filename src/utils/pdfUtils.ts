// Lightweight PDF invoice generator using jsPDF. Draws text and lines directly (no DOM capture).
// If jsPDF is not installed yet, run: npm i jspdf

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
  let y = pagePadding;

  // Header
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
  const rightX = 555; // approx right margin

  const formatDate = (d: Date) => d.toLocaleDateString();
  const rightText = [
    `Invoice #: ${invoiceNumber}`,
    `Invoice date: ${formatDate(invoiceDate)}`,
    `Due date: ${formatDate(dueDate)}`,
    ...(orderId ? [`Order ID: ${orderId}`] : []),
  ];
  rightText.forEach((line, idx) => {
    doc.text(line, rightX, pagePadding + 36 + idx * 16, { align: 'right' });
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
  const rightX = pageWidth - pagePadding; // dynamic right edge
  let y = pagePadding;

  // Header
  // INVOICE title first
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('INVOICE', pagePadding, y);

  // School name under title
  y += 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(args.schoolName || 'School', pagePadding, y);

  // Meta
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const formatDate = (d: Date) => d.toLocaleDateString();
  // Removed due date per request
  const metaLines = [
    `Invoice #: ${args.invoiceNumber}`,
    `Invoice date: ${formatDate(args.invoiceDate)}`,
  ];
  metaLines.forEach((line, idx) => {
    doc.text(line, rightX, pagePadding + 36 + idx * 16, { align: 'right' });
  });

  // Right-aligned quick totals summary under meta (for clearer up/down and right/left placement)
  const summaryTopY = pagePadding + 36 + metaLines.length * 16 + 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Totals', rightX, summaryTopY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Total: $${args.row.totalAmount.toFixed(2)}`, rightX, summaryTopY + 14, { align: 'right' });
  doc.text(`Paid: $${args.row.amountPaid.toFixed(2)}`, rightX, summaryTopY + 28, { align: 'right' });
  doc.text(`Left: $${args.row.amountLeftToPay.toFixed(2)}`, rightX, summaryTopY + 42, { align: 'right' });

  // Table header
  y += 24;
  doc.setLineWidth(0.6);
  doc.line(pagePadding, y, rightX, y);
  y += 16;
  doc.setFont('helvetica', 'bold');

  // Column positions - adjusted for removed Total/Paid/Left columns in table row
  const col = {
    date: pagePadding,
    method: rightX - 600,   // Adjusted spacing for remaining columns
    status: rightX - 490,
    txnid: rightX - 320,
    invoice: rightX - 150,
    // Footer totals columns (used at bottom)
    total: rightX - 230,
    paid: rightX - 120,
    left: rightX - 50,
  } as const;

  doc.setFontSize(11);
  doc.text('Date', col.date, y);
  doc.text('Method', col.method, y, { align: 'right' });
  doc.text('Status', col.status, y, { align: 'right' });
  doc.text('Txn ID', col.txnid, y, { align: 'right' });
  doc.text('Invoice', col.invoice, y, { align: 'right' });

  // Row
  doc.setFont('helvetica', 'normal');
  y += 10;
  y += 22;
  const row = args.row;
  const dateDisplay = new Date(row.date).toLocaleDateString();
  doc.setFontSize(11);
  doc.text(dateDisplay, col.date, y);
  // Avoid emoji and long text to prevent cropping
  const methodLabel = row.method === 'Orange Money' ? 'Orange Money' : row.method;
  doc.text(methodLabel, col.method, y, { align: 'right' });
  doc.text(row.status, col.status, y, { align: 'right' });
  doc.text(row.txnid || '', col.txnid, y, { align: 'right' });
  // Truncate invoice if too long
  const invoiceText = row.invoice && row.invoice.length > 25 ? `${row.invoice.slice(0, 25)}…` : row.invoice;
  doc.text(invoiceText, col.invoice, y, { align: 'right' });

  // Footer line and totals (replace Subtotal with three totals at the bottom)
  y += 24;
  doc.line(pagePadding, y, rightX, y);
  y += 22;
  doc.setFont('helvetica', 'bold');
  // Labels
  // doc.text('Total Amount to Pay', col.total, y, { align: 'right' });
  // doc.text('Amount Paid', col.paid, y, { align: 'right' });
  // doc.text('Amount Left to Pay', col.left, y, { align: 'right' });
  // // Values
  // y += 16;
  // doc.setFont('helvetica', 'normal');
  // doc.text(`$${row.totalAmount.toFixed(2)}`, col.total, y, { align: 'right' });
  // doc.text(`$${row.amountPaid.toFixed(2)}`, col.paid, y, { align: 'right' });
  // doc.text(`$${row.amountLeftToPay.toFixed(2)}`, col.left, y, { align: 'right' });

  // Footer note
  y += 40;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Thank you for your business.', pagePadding, y);

  const filenameSafe = (args.invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${filenameSafe}.pdf`);
}


