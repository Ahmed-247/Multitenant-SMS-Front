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

// Helper function to load logo as image data for jsPDF
async function loadLogoAsImageData(): Promise<string | null> {
  try {
    // Import the logo - Vite will handle the asset path and return the URL
    const logoModule = await import('../assets/bonecoleLogo.svg?url');
    const logoUrl = logoModule.default;
    
    // Fetch the SVG file
    const response = await fetch(logoUrl);
    let svgText = await response.text();
    
    // Convert white colors to black in the SVG
    // Replace various white color formats with black
    svgText = svgText
      .replace(/fill="white"/gi, 'fill="black"')
      .replace(/fill="#ffffff"/gi, 'fill="#000000"')
      .replace(/fill="#fff"/gi, 'fill="#000"')
      .replace(/fill="rgb\(255,\s*255,\s*255\)"/gi, 'fill="rgb(0, 0, 0)"')
      .replace(/fill="rgba\(255,\s*255,\s*255[^)]*\)"/gi, 'fill="rgba(0, 0, 0, 1)"')
      .replace(/stroke="white"/gi, 'stroke="black"')
      .replace(/stroke="#ffffff"/gi, 'stroke="#000000"')
      .replace(/stroke="#fff"/gi, 'stroke="#000"')
      .replace(/stroke="rgb\(255,\s*255,\s*255\)"/gi, 'stroke="rgb(0, 0, 0)"')
      .replace(/stroke="rgba\(255,\s*255,\s*255[^)]*\)"/gi, 'stroke="rgba(0, 0, 0, 1)"')
      // Also handle style attributes
      .replace(/style="[^"]*fill:\s*white[^"]*"/gi, (match) => match.replace(/fill:\s*white/gi, 'fill: black'))
      .replace(/style="[^"]*fill:\s*#ffffff[^"]*"/gi, (match) => match.replace(/fill:\s*#ffffff/gi, 'fill: #000000'))
      .replace(/style="[^"]*fill:\s*#fff[^"]*"/gi, (match) => match.replace(/fill:\s*#fff/gi, 'fill: #000'))
      .replace(/style="[^"]*stroke:\s*white[^"]*"/gi, (match) => match.replace(/stroke:\s*white/gi, 'stroke: black'))
      .replace(/style="[^"]*stroke:\s*#ffffff[^"]*"/gi, (match) => match.replace(/stroke:\s*#ffffff/gi, 'stroke: #000000'))
      .replace(/style="[^"]*stroke:\s*#fff[^"]*"/gi, (match) => match.replace(/stroke:\s*#fff/gi, 'stroke: #000'))
      // Add default color to SVG if not specified
      .replace(/<svg([^>]*)>/i, '<svg$1 style="color: black;">');
    
    // Create a canvas to render the SVG and convert to PNG
    return new Promise((resolve) => {
      // Check if we're in a browser environment
      if (typeof document === 'undefined') {
        resolve(null);
        return;
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      
      const img = new Image();
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        // Set canvas size (adjust as needed for logo size)
        canvas.width = 120; // Logo width in pixels
        canvas.height = (img.height / img.width) * 120; // Maintain aspect ratio
        
        // Draw the image on canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert white pixels to black using image data manipulation
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // If pixel is white or very light (threshold to catch near-white colors)
          if (r > 240 && g > 240 && b > 240) {
            data[i] = 0;     // Red to black
            data[i + 1] = 0; // Green to black
            data[i + 2] = 0; // Blue to black
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      
      img.src = url;
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
  const rightX = pageWidth - pagePadding; // dynamic right edge
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
  // INVOICE title first
  y += logoData ? 50 : 0; // Adjust y position if logo was added
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
  const logoOffset = logoData ? 50 : 0;
  const metaLines = [
    `Invoice #: ${args.invoiceNumber}`,
    `Invoice date: ${formatDate(args.invoiceDate)}`,
  ];
  metaLines.forEach((line, idx) => {
    doc.text(line, rightX, pagePadding + logoOffset + 36 + idx * 16, { align: 'right' });
  });

  // Right-aligned quick totals summary under meta (for clearer up/down and right/left placement)
  const summaryTopY = pagePadding + logoOffset + 36 + metaLines.length * 16 + 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Totals', rightX, summaryTopY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Total: ${formatCurrency(args.row.totalAmount, 2)}`, rightX, summaryTopY + 14, { align: 'right' });
  doc.text(`Paid: ${formatCurrency(args.row.amountPaid, 2)}`, rightX, summaryTopY + 28, { align: 'right' });
  doc.text(`Left: ${formatCurrency(args.row.amountLeftToPay, 2)}`, rightX, summaryTopY + 42, { align: 'right' });

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
  doc.text('Merci pour la confidence.', pagePadding, y);

  const filenameSafe = (args.invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${filenameSafe}.pdf`);
}


