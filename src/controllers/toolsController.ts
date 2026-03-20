import { Request, Response } from 'express';
import * as toolsService from '../services/toolsService';
import path from 'path';
import fs from 'fs';

// Document service loaded lazily — prevents sharp/pdfkit from loading on every request
const getDoc = () => import('../services/documentService');

// ── Document handlers (lazy loaded) ──────────────────────────────────────────

export const generateInvoice = async (req: Request, res: Response) => {
  try {
    const doc = await getDoc();
    res.json({ success: true, data: doc.createInvoice(req.body) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const invoiceGenerator = async (req: Request, res: Response) => {
  try {
    const { invoiceNumber, issueDate, dueDate, businessName, clientName, items } = req.body;
    if (!invoiceNumber || !issueDate || !dueDate || !businessName || !clientName)
      return res.status(400).json({ success: false, error: 'Missing required invoice fields' });
    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ success: false, error: 'At least one item is required' });
    const doc = await getDoc();
    res.json({ success: true, data: await doc.generateInvoice(req.body) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const invoiceLogoUpload = (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const filename = `logo-${Date.now()}-${req.file.originalname}`;
    fs.writeFileSync(path.join(tempDir, filename), req.file.buffer);
    res.json({ success: true, data: { logoUrl: `temp/${filename}` } });
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
};

export const downloadInvoice = (req: Request, res: Response) => {
  try {
    const filePath = path.join(process.cwd(), 'temp', req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, error: 'File not found' });
    res.download(filePath, req.params.filename);
  } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
};

export const generateReceipt = async (req: Request, res: Response) => {
  try {
    const { receiptNumber, payerName, businessName, paymentMethod } = req.body;
    if (!receiptNumber || !payerName || !businessName || !paymentMethod)
      return res.status(400).json({ success: false, error: 'receiptNumber, payerName, businessName and paymentMethod are required' });
    const doc = await getDoc();
    res.json({ success: true, data: await doc.createReceipt(req.body) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const generateQuotation = async (req: Request, res: Response) => {
  try {
    const doc = await getDoc();
    res.json({ success: true, data: doc.createQuotation(req.body) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const generateQrCode = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) throw new Error('Text or URL is required');
    const doc = await getDoc();
    res.json({ success: true, data: { qrCode: await doc.createQrCode(text) } });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const compressImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) throw new Error('Image file is required');
    const doc = await getDoc();
    res.json({ success: true, data: { imageBase64: await doc.compressImage(req.file.buffer) } });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const resizeImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) throw new Error('Image file is required');
    const { width, height } = req.body;
    if (!width || !height) throw new Error('Width and height are required');
    const doc = await getDoc();
    res.json({ success: true, data: { imageBase64: await doc.resizeImage(req.file.buffer, Number(width), Number(height)) } });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

// ── Pure calculator handlers ──────────────────────────────────────────────────

export const calculateVat = (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    if (amount === undefined) throw new Error('Amount is required');
    res.json({ success: true, data: toolsService.calcVat(Number(amount)) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const calculateProfitMargin = (req: Request, res: Response) => {
  try {
    const { costPrice, sellingPrice } = req.body;
    if (costPrice === undefined || sellingPrice === undefined) throw new Error('costPrice and sellingPrice are required');
    res.json({ success: true, data: toolsService.calcProfitMargin(Number(costPrice), Number(sellingPrice)) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const calculatePercentage = (req: Request, res: Response) => {
  try {
    const { percentage, value } = req.body;
    if (percentage === undefined || value === undefined) throw new Error('percentage and value are required');
    res.json({ success: true, data: toolsService.calcPercentage(Number(percentage), Number(value)) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const generateBusinessName = (req: Request, res: Response) => {
  try {
    const { keywords } = req.body;
    if (!keywords || !Array.isArray(keywords)) throw new Error('Keywords array is required');
    res.json({ success: true, data: { suggestions: toolsService.generateBizName(keywords) } });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const currencyConverter = async (req: Request, res: Response) => {
  try {
    const { amountUSD, fromCurrency = 'USD' } = req.body;
    if (!amountUSD || Number(amountUSD) <= 0) throw new Error('Amount must be greater than 0');
    res.json({ success: true, data: await toolsService.convertUsdToNgn(Number(amountUSD), fromCurrency) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const loanCalculator = (req: Request, res: Response) => {
  try {
    const { loanAmount, interestRate, loanTermMonths } = req.body;
    if (!loanAmount || !interestRate || !loanTermMonths) return res.status(400).json({ success: false, error: 'loanAmount, interestRate and loanTermMonths are required' });
    res.json({ success: true, data: toolsService.calculateLoanRepayment(Number(loanAmount), Number(interestRate), Number(loanTermMonths)) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const investmentCalculator = (req: Request, res: Response) => {
  try {
    const { principal, annualRate, years, compoundFrequency } = req.body;
    if (!principal || !annualRate || !years || !compoundFrequency) return res.status(400).json({ success: false, error: 'principal, annualRate, years and compoundFrequency are required' });
    res.json({ success: true, data: toolsService.calculateInvestmentGrowth(Number(principal), Number(annualRate), Number(years), Number(compoundFrequency)) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const profitMarginCalculator = (req: Request, res: Response) => {
  try {
    const { costPrice, sellingPrice, quantity } = req.body;
    if (!costPrice || !sellingPrice || !quantity) return res.status(400).json({ success: false, error: 'costPrice, sellingPrice and quantity are required' });
    res.json({ success: true, data: toolsService.calculateProfitMargin(Number(costPrice), Number(sellingPrice), Number(quantity)) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const electricityCostCalculator = (req: Request, res: Response) => {
  try {
    const { mode = 'manual', wattage, hoursPerDay, electricityRate, band, appliances } = req.body;
    if (!electricityRate || Number(electricityRate) <= 0) return res.status(400).json({ success: false, error: 'electricityRate is required' });
    res.json({ success: true, data: toolsService.calculateElectricityCostAdvanced(mode, Number(electricityRate), wattage ? Number(wattage) : undefined, hoursPerDay ? Number(hoursPerDay) : undefined, band, appliances) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const netSalaryCalculator = (req: Request, res: Response) => {
  try {
    const { basicSalary } = req.body;
    if (!basicSalary || Number(basicSalary) <= 0) throw new Error('basicSalary is required and must be > 0');
    res.json({ success: true, data: toolsService.calculateNetSalary({ basicSalary: Number(basicSalary), housingAllowance: Number(req.body.housingAllowance) || 0, transportAllowance: Number(req.body.transportAllowance) || 0, otherAllowances: Number(req.body.otherAllowances) || 0, pensionRate: req.body.pensionRate ? Number(req.body.pensionRate) : undefined, nhfEnabled: req.body.nhfEnabled !== false, nhisRate: req.body.nhisRate ? Number(req.body.nhisRate) : undefined }) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const pensionCalculator = (req: Request, res: Response) => {
  try {
    const { basicSalary } = req.body;
    if (!basicSalary || Number(basicSalary) <= 0) throw new Error('basicSalary is required and must be > 0');
    res.json({ success: true, data: toolsService.calculatePension({ basicSalary: Number(basicSalary), housingAllowance: Number(req.body.housingAllowance) || 0, transportAllowance: Number(req.body.transportAllowance) || 0, employeeRate: req.body.employeeRate ? Number(req.body.employeeRate) : undefined, employerRate: req.body.employerRate ? Number(req.body.employerRate) : undefined, currentRsaBalance: req.body.currentRsaBalance ? Number(req.body.currentRsaBalance) : undefined, yearsToRetirement: req.body.yearsToRetirement ? Number(req.body.yearsToRetirement) : undefined, expectedReturnRate: req.body.expectedReturnRate ? Number(req.body.expectedReturnRate) : undefined }) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const mortgageCalculator = (req: Request, res: Response) => {
  try {
    const { propertyPrice, downPayment, annualInterestRate, termYears } = req.body;
    if (!propertyPrice || !downPayment || !annualInterestRate || !termYears) throw new Error('All fields required');
    res.json({ success: true, data: toolsService.calculateMortgage({ propertyPrice: Number(propertyPrice), downPayment: Number(downPayment), annualInterestRate: Number(annualInterestRate), termYears: Number(termYears) }) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const breakEvenCalculator = (req: Request, res: Response) => {
  try {
    const { fixedCosts, sellingPricePerUnit, variableCostPerUnit } = req.body;
    if (!fixedCosts || !sellingPricePerUnit || !variableCostPerUnit) throw new Error('fixedCosts, sellingPricePerUnit and variableCostPerUnit are required');
    res.json({ success: true, data: toolsService.calculateBreakEven({ fixedCosts: Number(fixedCosts), sellingPricePerUnit: Number(sellingPricePerUnit), variableCostPerUnit: Number(variableCostPerUnit), targetProfit: req.body.targetProfit ? Number(req.body.targetProfit) : undefined }) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const fuelCostCalculator = (req: Request, res: Response) => {
  try {
    const { distanceKm, fuelEfficiencyKmPerLitre, fuelPricePerLitre } = req.body;
    if (!distanceKm || !fuelEfficiencyKmPerLitre || !fuelPricePerLitre) throw new Error('distanceKm, fuelEfficiencyKmPerLitre and fuelPricePerLitre are required');
    res.json({ success: true, data: toolsService.calculateFuelCost({ distanceKm: Number(distanceKm), fuelEfficiencyKmPerLitre: Number(fuelEfficiencyKmPerLitre), fuelPricePerLitre: Number(fuelPricePerLitre), tripsPerMonth: req.body.tripsPerMonth ? Number(req.body.tripsPerMonth) : undefined }) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const generatorCostCalculator = (req: Request, res: Response) => {
  try {
    const { generatorKva, fuelConsumptionPerHour, fuelPricePerLitre, hoursPerDay, gridRatePerKwh, gridHoursPerDay } = req.body;
    if (!generatorKva || !fuelConsumptionPerHour || !fuelPricePerLitre || !hoursPerDay || !gridRatePerKwh || !gridHoursPerDay) throw new Error('All generator fields are required');
    res.json({ success: true, data: toolsService.calculateGeneratorCost({ generatorKva: Number(generatorKva), fuelConsumptionPerHour: Number(fuelConsumptionPerHour), fuelPricePerLitre: Number(fuelPricePerLitre), hoursPerDay: Number(hoursPerDay), gridRatePerKwh: Number(gridRatePerKwh), gridHoursPerDay: Number(gridHoursPerDay), maintenanceCostPerMonth: req.body.maintenanceCostPerMonth ? Number(req.body.maintenanceCostPerMonth) : undefined }) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const rentAffordabilityCalculator = (req: Request, res: Response) => {
  try {
    const { monthlyIncome, otherMonthlyExpenses, affordabilityPercent } = req.body;
    if (!monthlyIncome || Number(monthlyIncome) <= 0) throw new Error('monthlyIncome is required and must be > 0');
    res.json({ success: true, data: toolsService.calculateRentAffordability({
      monthlyIncome: Number(monthlyIncome),
      otherMonthlyExpenses: Number(otherMonthlyExpenses) || 0,
      affordabilityPercent: affordabilityPercent ? Number(affordabilityPercent) : undefined,
    })});
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const roiCalculator = (req: Request, res: Response) => {
  try {
    const { initialInvestment, finalValue, durationMonths } = req.body;
    if (!initialInvestment || !finalValue) throw new Error('initialInvestment and finalValue are required');
    res.json({ success: true, data: toolsService.calculateROI({
      initialInvestment: Number(initialInvestment),
      finalValue: Number(finalValue),
      durationMonths: durationMonths ? Number(durationMonths) : undefined,
    })});
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const payrollCalculator = (req: Request, res: Response) => {
  try {
    const { employees } = req.body;
    if (!employees || !Array.isArray(employees) || employees.length === 0)
      throw new Error('employees array is required');
    res.json({ success: true, data: toolsService.calculatePayroll({ employees }) });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const inflationCalculator = (req: Request, res: Response) => {
  try {
    const { amount, fromYear, toYear } = req.body;
    if (!amount || !fromYear || !toYear) throw new Error('amount, fromYear and toYear are required');
    res.json({ success: true, data: toolsService.calculateInflation({
      amount: Number(amount), fromYear: Number(fromYear), toYear: Number(toYear),
    })});
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const importDutyCalculator = (req: Request, res: Response) => {
  try {
    const { cifValueUSD, exchangeRate, dutyRate, levyRate } = req.body;
    if (!cifValueUSD || !exchangeRate) throw new Error('cifValueUSD and exchangeRate are required');
    res.json({ success: true, data: toolsService.calculateImportDuty({
      cifValueUSD: Number(cifValueUSD), exchangeRate: Number(exchangeRate),
      dutyRate: Number(dutyRate) || 0, levyRate: Number(levyRate) || 0,
    })});
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};