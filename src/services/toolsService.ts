import QRCode from 'qrcode';
import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  clientName: string;
  items: InvoiceItem[];
  discount?: number;
  deliveryFee?: number;
  cautionFee?: number;
}

export const createInvoice = (data: InvoiceData) => {
  const { clientName, items, discount = 0, deliveryFee = 0, cautionFee = 0 } = data;
  
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const vat = subtotal * 0.075; // 7.5% VAT
  const total = subtotal + vat - discount + deliveryFee + cautionFee;

  return {
    clientName,
    items,
    subtotal,
    vat,
    discount,
    deliveryFee,
    cautionFee,
    total
  };
};

export interface NewInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ExtraCharge {
  label: string;
  amount: number;
}

export interface NewInvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  items: NewInvoiceItem[];
  notes?: string;
  logoUrl?: string;
  accentColor?: string;
  taxEnabled?: boolean;
  taxLabel?: string;
  taxType?: 'percentage' | 'fixed';
  taxValue?: number;
  discountEnabled?: boolean;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  extraCharges?: ExtraCharge[];
}

export const generateInvoice = async (data: NewInvoiceData) => {
  const itemsWithTotal = data.items.map(item => ({
    ...item,
    lineTotal: item.quantity * item.unitPrice
  }));

  const subtotal = itemsWithTotal.reduce((sum, item) => sum + item.lineTotal, 0);
  
  const extraCharges = data.extraCharges || [];
  const extraChargesTotal = extraCharges.reduce((sum, charge) => sum + charge.amount, 0);
  
  const taxableBase = subtotal + extraChargesTotal;
  
  let taxAmount = 0;
  if (data.taxEnabled && data.taxValue !== undefined) {
    if (data.taxType === 'percentage') {
      taxAmount = taxableBase * (data.taxValue / 100);
    } else if (data.taxType === 'fixed') {
      taxAmount = data.taxValue;
    }
  }
  
  let discountAmount = 0;
  if (data.discountEnabled && data.discountValue !== undefined) {
    if (data.discountType === 'percentage') {
      discountAmount = taxableBase * (data.discountValue / 100);
    } else if (data.discountType === 'fixed') {
      discountAmount = data.discountValue;
    }
  }
  
  let total = subtotal + extraChargesTotal + taxAmount - discountAmount;
  if (total < 0) total = 0;

  const result = {
    ...data,
    items: itemsWithTotal,
    subtotal,
    extraCharges,
    extraChargesTotal,
    taxAmount,
    discountAmount,
    total
  };

  // Generate PDF
  const doc = new PDFDocument({ margin: 50 });
  const fileName = `invoice-${data.invoiceNumber}.pdf`;
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  const filePath = path.join(tempDir, fileName);
  
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  const accentColor = data.accentColor || '#059669';

  // Logo
  if (data.logoUrl) {
    try {
      const logoPath = path.join(process.cwd(), data.logoUrl);
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 100 });
      }
    } catch (e) {
      console.error('Failed to load logo:', e);
    }
  }

  // Header
  doc.fillColor(accentColor).fontSize(20).text('INVOICE', { align: 'right' });
  doc.fillColor('#475569').fontSize(10).text(`Invoice Number: ${data.invoiceNumber}`, { align: 'right' });
  doc.text(`Issue Date: ${data.issueDate}`, { align: 'right' });
  doc.text(`Due Date: ${data.dueDate}`, { align: 'right' });
  doc.moveDown();

  // Business Details
  doc.fillColor('#0f172a').fontSize(14).text(data.businessName);
  doc.fillColor('#475569').fontSize(10);
  if (data.businessEmail) doc.text(data.businessEmail);
  if (data.businessPhone) doc.text(data.businessPhone);
  if (data.businessAddress) doc.text(data.businessAddress);
  doc.moveDown();

  // Client Details
  doc.fillColor(accentColor).fontSize(12).text('Bill To:');
  doc.fillColor('#475569').fontSize(10).text(data.clientName);
  if (data.clientEmail) doc.text(data.clientEmail);
  if (data.clientPhone) doc.text(data.clientPhone);
  if (data.clientAddress) doc.text(data.clientAddress);
  doc.moveDown(2);

  // Table Header
  const tableTop = doc.y;
  doc.font('Helvetica-Bold');
  doc.fillColor(accentColor);
  doc.text('Description', 50, tableTop);
  doc.text('Quantity', 280, tableTop, { width: 90, align: 'right' });
  doc.text('Unit Price', 370, tableTop, { width: 90, align: 'right' });
  doc.text('Line Total', 460, tableTop, { width: 90, align: 'right' });
  
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor(accentColor).stroke();
  doc.font('Helvetica');
  doc.fillColor('#475569');

  // Table Rows
  let y = tableTop + 25;
  itemsWithTotal.forEach(item => {
    doc.text(item.description, 50, y);
    doc.text(item.quantity.toString(), 280, y, { width: 90, align: 'right' });
    doc.text(`N${item.unitPrice.toLocaleString()}`, 370, y, { width: 90, align: 'right' });
    doc.text(`N${item.lineTotal.toLocaleString()}`, 460, y, { width: 90, align: 'right' });
    y += 20;
  });

  doc.moveTo(50, y).lineTo(550, y).strokeColor('#cbd5e1').stroke();
  y += 15;

  // Totals
  doc.font('Helvetica-Bold');
  doc.text('Subtotal:', 370, y, { width: 90, align: 'right' });
  doc.text(`N${subtotal.toLocaleString()}`, 460, y, { width: 90, align: 'right' });
  y += 20;

  if (extraCharges.length > 0) {
    extraCharges.forEach(charge => {
      doc.font('Helvetica');
      doc.text(`${charge.label}:`, 370, y, { width: 90, align: 'right' });
      doc.text(`N${charge.amount.toLocaleString()}`, 460, y, { width: 90, align: 'right' });
      y += 20;
    });
  }

  if (data.taxEnabled && taxAmount > 0) {
    doc.font('Helvetica');
    doc.text(`${data.taxLabel || 'Tax'}:`, 370, y, { width: 90, align: 'right' });
    doc.text(`N${taxAmount.toLocaleString()}`, 460, y, { width: 90, align: 'right' });
    y += 20;
  }

  if (data.discountEnabled && discountAmount > 0) {
    doc.font('Helvetica');
    doc.text('Discount:', 370, y, { width: 90, align: 'right' });
    doc.text(`-N${discountAmount.toLocaleString()}`, 460, y, { width: 90, align: 'right' });
    y += 20;
  }

  doc.font('Helvetica-Bold');
  doc.text('Total:', 370, y, { width: 90, align: 'right' });
  doc.fillColor(accentColor).text(`N${total.toLocaleString()}`, 460, y, { width: 90, align: 'right' });
  
  // Notes
  if (data.notes) {
    doc.moveDown(3);
    doc.fillColor(accentColor).font('Helvetica-Bold').text('Notes:');
    doc.fillColor('#475569').font('Helvetica').text(data.notes);
  }

  doc.end();

  await new Promise<void>((resolve, reject) => {
    writeStream.on('finish', () => resolve());
    writeStream.on('error', reject);
  });

  return {
    ...result,
    pdfUrl: `/api/tools/invoice-download/${fileName}`
  };
};

interface ReceiptData {
  receiptNumber: string;
  payerName: string;
  amount: number;
  paymentMethod: string;
  date?: string;
}

export const createReceipt = (data: ReceiptData) => {
  return {
    ...data,
    date: data.date || new Date().toISOString()
  };
};

interface QuotationData {
  clientName: string;
  items: InvoiceItem[];
  taxRate?: number;
}

export const createQuotation = (data: QuotationData) => {
  const { clientName, items, taxRate = 0 } = data;
  
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  return {
    clientName,
    items,
    subtotal,
    taxRate,
    tax,
    total
  };
};

export const calcVat = (amount: number) => {
  const vatAmount = amount * 0.075;
  return {
    amount,
    vatAmount,
    total: amount + vatAmount
  };
};

export const calcProfitMargin = (costPrice: number, sellingPrice: number) => {
  const profit = sellingPrice - costPrice;
  const profitMargin = (profit / sellingPrice) * 100;
  
  return {
    costPrice,
    sellingPrice,
    profit,
    profitMargin: Number(profitMargin.toFixed(2))
  };
};

export const createQrCode = async (text: string): Promise<string> => {
  return await QRCode.toDataURL(text);
};

export const compressImage = async (buffer: Buffer): Promise<string> => {
  const compressed = await sharp(buffer)
    .jpeg({ quality: 60 })
    .toBuffer();
  return `data:image/jpeg;base64,${compressed.toString('base64')}`;
};

export const resizeImage = async (buffer: Buffer, width: number, height: number): Promise<string> => {
  const resized = await sharp(buffer)
    .resize(width, height)
    .toBuffer();
  return `data:image/jpeg;base64,${resized.toString('base64')}`;
};

export const calcPercentage = (percentage: number, value: number) => {
  const result = (percentage / 100) * value;
  return {
    percentage,
    value,
    result
  };
};

export const generateBizName = (keywords: string[]): string[] => {
  const prefixes = ['Pro', 'Smart', 'Next', 'Global', 'Prime', 'Elite', 'Apex', 'Core'];
  const suffixes = ['Solutions', 'Hub', 'Tech', 'Labs', 'Group', 'Works', 'Co', 'Inc'];
  
  const suggestions: Set<string> = new Set();
  
  keywords.forEach(keyword => {
    const capitalized = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
    
    // Prefix + Keyword
    prefixes.forEach(prefix => suggestions.add(`${prefix} ${capitalized}`));
    // Keyword + Suffix
    suffixes.forEach(suffix => suggestions.add(`${capitalized} ${suffix}`));
    // Keyword + Keyword (if multiple)
    keywords.forEach(other => {
      if (keyword !== other) {
        const otherCap = other.charAt(0).toUpperCase() + other.slice(1).toLowerCase();
        suggestions.add(`${capitalized} ${otherCap}`);
        suggestions.add(`${capitalized}${otherCap}`);
      }
    });
  });

  return Array.from(suggestions).slice(0, 15); // Return up to 15 suggestions
};

export const convertUsdToNgn = async (amountUSD: number) => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }
    const data = await response.json();
    const exchangeRate = data.rates.NGN;
    if (!exchangeRate) {
      throw new Error('NGN rate not found');
    }
    const amountNGN = amountUSD * exchangeRate;
    return {
      amountUSD,
      exchangeRate,
      amountNGN
    };
  } catch (error) {
    throw new Error('Unable to fetch exchange rate. Please try again.');
  }
};

export const calculateLoanRepayment = (loanAmount: number, interestRate: number, loanTermMonths: number) => {
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) / (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
  const totalRepayment = monthlyPayment * loanTermMonths;
  const totalInterest = totalRepayment - loanAmount;

  return {
    loanAmount,
    interestRate,
    loanTermMonths,
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalInterest),
    totalRepayment: Math.round(totalRepayment)
  };
};

export const calculateInvestmentGrowth = (principal: number, annualRate: number, years: number, compoundFrequency: number) => {
  const r = annualRate / 100;
  const n = compoundFrequency;
  const t = years;
  
  const finalAmount = principal * Math.pow(1 + r / n, n * t);
  const interestEarned = finalAmount - principal;

  return {
    principal,
    annualRate,
    years,
    compoundFrequency,
    finalAmount: Math.round(finalAmount),
    interestEarned: Math.round(interestEarned)
  };
};

export const calculateProfitMargin = (costPrice: number, sellingPrice: number, quantity: number) => {
  const profitPerUnit = sellingPrice - costPrice;
  const totalCost = costPrice * quantity;
  const totalRevenue = sellingPrice * quantity;
  const totalProfit = totalRevenue - totalCost;

  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const markupPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  return {
    costPrice,
    sellingPrice,
    quantity,
    profitPerUnit,
    totalCost,
    totalRevenue,
    totalProfit,
    profitMargin: Number(profitMargin.toFixed(2)),
    markupPercentage: Number(markupPercentage.toFixed(2))
  };
};

export const calculateElectricityCost = (wattage: number, hoursPerDay: number, electricityRate: number) => {
  if (wattage <= 0 || hoursPerDay <= 0 || hoursPerDay > 24 || electricityRate <= 0) {
    throw new Error('Invalid electricity parameters');
  }

  const kilowatts = wattage / 1000;
  const dailyKwh = kilowatts * hoursPerDay;
  const dailyCost = dailyKwh * electricityRate;
  const monthlyCost = dailyCost * 30;
  const yearlyCost = dailyCost * 365;

  return {
    mode: 'manual',
    wattage,
    hoursPerDay,
    electricityRate,
    dailyKwh: Number(dailyKwh.toFixed(2)),
    dailyCost: Number(dailyCost.toFixed(2)),
    monthlyCost: Number(monthlyCost.toFixed(2)),
    yearlyCost: Number(yearlyCost.toFixed(2))
  };
};

export interface ApplianceInput {
  name: string;
  wattage: number;
  quantity: number;
  hoursPerDay: number;
}

export const calculateElectricityCostAdvanced = (
  mode: 'manual' | 'estimate',
  electricityRate: number,
  wattage?: number,
  hoursPerDay?: number,
  band?: string,
  appliances?: ApplianceInput[]
) => {
  if (mode === 'manual') {
    if (wattage === undefined || hoursPerDay === undefined) {
      throw new Error('Invalid electricity parameters');
    }
    return calculateElectricityCost(wattage, hoursPerDay, electricityRate);
  }

  if (mode === 'estimate') {
    if (!appliances || appliances.length === 0 || electricityRate <= 0) {
      throw new Error('Invalid electricity parameters');
    }

    let totalDailyKwh = 0;
    let totalDailyCost = 0;

    const processedAppliances = appliances.map(app => {
      if (app.wattage <= 0 || app.quantity <= 0 || !Number.isInteger(app.quantity) || app.hoursPerDay <= 0 || app.hoursPerDay > 24) {
        throw new Error('Invalid electricity parameters');
      }

      const rowTotalWattage = app.wattage * app.quantity;
      const rowDailyKwh = (rowTotalWattage / 1000) * app.hoursPerDay;
      const rowDailyCost = rowDailyKwh * electricityRate;

      totalDailyKwh += rowDailyKwh;
      totalDailyCost += rowDailyCost;

      return {
        ...app,
        rowTotalWattage,
        rowDailyKwh: Number(rowDailyKwh.toFixed(2)),
        rowDailyCost: Number(rowDailyCost.toFixed(2))
      };
    });

    const monthlyCost = totalDailyCost * 30;
    const yearlyCost = totalDailyCost * 365;

    return {
      mode: 'estimate',
      band,
      electricityRate,
      appliances: processedAppliances,
      totalDailyKwh: Number(totalDailyKwh.toFixed(2)),
      dailyCost: Number(totalDailyCost.toFixed(2)),
      monthlyCost: Number(monthlyCost.toFixed(2)),
      yearlyCost: Number(yearlyCost.toFixed(2))
    };
  }

  throw new Error('Invalid mode');
};
