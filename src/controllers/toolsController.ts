import { Request, Response } from 'express';
import * as toolsService from '../services/toolsService';
import * as documentService from '../services/documentService';
import path from 'path';
import fs from 'fs';

export const generateInvoice = (req: Request, res: Response) => {
  try {
    const result = documentService.createInvoice(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const invoiceGenerator = async (req: Request, res: Response) => {
  try {
    const {
      invoiceNumber,
      issueDate,
      dueDate,
      businessName,
      clientName,
      items
    } = req.body;

    if (!invoiceNumber || !issueDate || !dueDate || !businessName || !clientName) {
      return res.status(400).json({ success: false, error: 'Invalid invoice data: missing required fields' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid invoice data: at least one item is required' });
    }

    for (const item of items) {
      if (!item.description || item.quantity === undefined || item.quantity <= 0 || item.unitPrice === undefined || item.unitPrice < 0) {
        return res.status(400).json({ success: false, error: 'Invalid invoice data: invalid item details' });
      }
    }

    const result = await documentService.generateInvoice(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const invoiceLogoUpload = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const filename = `logo-${Date.now()}-${req.file.originalname}`;
    const filePath = path.join(tempDir, filename);
    
    fs.writeFileSync(filePath, req.file.buffer);

    res.json({ success: true, data: { logoUrl: `temp/${filename}` } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const downloadInvoice = (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'temp', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Invoice file not found' });
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Optionally delete the file after download
      // fs.unlinkSync(filePath);
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generateReceipt = async (req: Request, res: Response) => {
  try {
    const { receiptNumber, payerName, businessName, paymentMethod } = req.body;
    if (!receiptNumber || !payerName || !businessName || !paymentMethod) {
      return res.status(400).json({ success: false, error: 'receiptNumber, payerName, businessName and paymentMethod are required' });
    }
    const result = await documentService.createReceipt(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const generateQuotation = (req: Request, res: Response) => {
  try {
    const result = documentService.createQuotation(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const calculateVat = (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    if (amount === undefined) throw new Error('Amount is required');
    const result = toolsService.calcVat(Number(amount));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const calculateProfitMargin = (req: Request, res: Response) => {
  try {
    const { costPrice, sellingPrice } = req.body;
    if (costPrice === undefined || sellingPrice === undefined) {
      throw new Error('costPrice and sellingPrice are required');
    }
    const result = toolsService.calcProfitMargin(Number(costPrice), Number(sellingPrice));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const generateQrCode = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) throw new Error('Text or URL is required');
    const result = await documentService.createQrCode(text);
    res.json({ success: true, data: { qrCode: result } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const compressImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) throw new Error('Image file is required');
    const result = await documentService.compressImage(req.file.buffer);
    res.json({ success: true, data: { imageBase64: result } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const resizeImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) throw new Error('Image file is required');
    const { width, height } = req.body;
    if (!width || !height) throw new Error('Width and height are required');
    const result = await documentService.resizeImage(req.file.buffer, Number(width), Number(height));
    res.json({ success: true, data: { imageBase64: result } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const calculatePercentage = (req: Request, res: Response) => {
  try {
    const { percentage, value } = req.body;
    if (percentage === undefined || value === undefined) {
      throw new Error('percentage and value are required');
    }
    const result = toolsService.calcPercentage(Number(percentage), Number(value));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const generateBusinessName = (req: Request, res: Response) => {
  try {
    const { keywords } = req.body;
    if (!keywords || !Array.isArray(keywords)) {
      throw new Error('Keywords array is required');
    }
    const result = toolsService.generateBizName(keywords);
    res.json({ success: true, data: { suggestions: result } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const currencyConverter = async (req: Request, res: Response) => {
  try {
    const { amountUSD, fromCurrency = 'USD' } = req.body;
    if (amountUSD === undefined || Number(amountUSD) <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    const result = await toolsService.convertUsdToNgn(Number(amountUSD), fromCurrency);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const loanCalculator = (req: Request, res: Response) => {
  try {
    const { loanAmount, interestRate, loanTermMonths } = req.body;
    
    if (
      loanAmount === undefined || Number(loanAmount) <= 0 ||
      interestRate === undefined || Number(interestRate) <= 0 ||
      loanTermMonths === undefined || Number(loanTermMonths) <= 0
    ) {
      return res.status(400).json({ success: false, error: 'Invalid loan parameters' });
    }

    const result = toolsService.calculateLoanRepayment(
      Number(loanAmount),
      Number(interestRate),
      Number(loanTermMonths)
    );
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const investmentCalculator = (req: Request, res: Response) => {
  try {
    const { principal, annualRate, years, compoundFrequency } = req.body;
    
    const validFrequencies = [1, 2, 4, 12, 365];
    
    if (
      principal === undefined || Number(principal) <= 0 ||
      annualRate === undefined || Number(annualRate) <= 0 ||
      years === undefined || Number(years) <= 0 ||
      compoundFrequency === undefined || !validFrequencies.includes(Number(compoundFrequency))
    ) {
      return res.status(400).json({ success: false, error: 'Invalid investment parameters' });
    }

    const result = toolsService.calculateInvestmentGrowth(
      Number(principal),
      Number(annualRate),
      Number(years),
      Number(compoundFrequency)
    );
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const profitMarginCalculator = (req: Request, res: Response) => {
  try {
    const { costPrice, sellingPrice, quantity } = req.body;
    
    if (
      costPrice === undefined || Number(costPrice) <= 0 ||
      sellingPrice === undefined || Number(sellingPrice) <= 0 ||
      quantity === undefined || Number(quantity) <= 0 || !Number.isInteger(Number(quantity))
    ) {
      return res.status(400).json({ success: false, error: 'Invalid profit margin parameters' });
    }

    const result = toolsService.calculateProfitMargin(
      Number(costPrice),
      Number(sellingPrice),
      Number(quantity)
    );
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const electricityCostCalculator = (req: Request, res: Response) => {
  try {
    const { mode = 'manual', wattage, hoursPerDay, electricityRate, band, appliances } = req.body;

    if (electricityRate === undefined || Number(electricityRate) <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid electricity parameters' });
    }

    if (mode === 'manual') {
      if (
        wattage === undefined || Number(wattage) <= 0 ||
        hoursPerDay === undefined || Number(hoursPerDay) <= 0 || Number(hoursPerDay) > 24
      ) {
        return res.status(400).json({ success: false, error: 'Invalid electricity parameters' });
      }
    } else if (mode === 'estimate') {
      if (!appliances || !Array.isArray(appliances) || appliances.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid electricity parameters' });
      }
      
      const validBands = ['Band A', 'Band B', 'Band C', 'Band D', 'Band E'];
      if (band && !validBands.includes(band)) {
        return res.status(400).json({ success: false, error: 'Invalid electricity parameters' });
      }
    } else {
      return res.status(400).json({ success: false, error: 'Invalid electricity parameters' });
    }

    const result = toolsService.calculateElectricityCostAdvanced(
      mode,
      Number(electricityRate),
      wattage ? Number(wattage) : undefined,
      hoursPerDay ? Number(hoursPerDay) : undefined,
      band,
      appliances
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const netSalaryCalculator = (req: Request, res: Response) => {
  try {
    const { basicSalary, housingAllowance, transportAllowance, otherAllowances } = req.body;
    if (!basicSalary || Number(basicSalary) <= 0) throw new Error('basicSalary is required and must be > 0');
    const result = toolsService.calculateNetSalary({
      basicSalary: Number(basicSalary),
      housingAllowance: Number(housingAllowance) || 0,
      transportAllowance: Number(transportAllowance) || 0,
      otherAllowances: Number(otherAllowances) || 0,
      pensionRate: req.body.pensionRate ? Number(req.body.pensionRate) : undefined,
      nhfEnabled: req.body.nhfEnabled !== false,
      nhisRate: req.body.nhisRate ? Number(req.body.nhisRate) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const pensionCalculator = (req: Request, res: Response) => {
  try {
    const { basicSalary } = req.body;
    if (!basicSalary || Number(basicSalary) <= 0) throw new Error('basicSalary is required and must be > 0');
    const result = toolsService.calculatePension({
      basicSalary: Number(basicSalary),
      housingAllowance: Number(req.body.housingAllowance) || 0,
      transportAllowance: Number(req.body.transportAllowance) || 0,
      employeeRate: req.body.employeeRate ? Number(req.body.employeeRate) : undefined,
      employerRate: req.body.employerRate ? Number(req.body.employerRate) : undefined,
      currentRsaBalance: req.body.currentRsaBalance ? Number(req.body.currentRsaBalance) : undefined,
      yearsToRetirement: req.body.yearsToRetirement ? Number(req.body.yearsToRetirement) : undefined,
      expectedReturnRate: req.body.expectedReturnRate ? Number(req.body.expectedReturnRate) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const mortgageCalculator = (req: Request, res: Response) => {
  try {
    const { propertyPrice, downPayment, annualInterestRate, termYears } = req.body;
    if (!propertyPrice || !downPayment || !annualInterestRate || !termYears) throw new Error('propertyPrice, downPayment, annualInterestRate and termYears are required');
    const result = toolsService.calculateMortgage({
      propertyPrice: Number(propertyPrice), downPayment: Number(downPayment),
      annualInterestRate: Number(annualInterestRate), termYears: Number(termYears),
    });
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const breakEvenCalculator = (req: Request, res: Response) => {
  try {
    const { fixedCosts, sellingPricePerUnit, variableCostPerUnit } = req.body;
    if (!fixedCosts || !sellingPricePerUnit || !variableCostPerUnit) throw new Error('fixedCosts, sellingPricePerUnit and variableCostPerUnit are required');
    const result = toolsService.calculateBreakEven({
      fixedCosts: Number(fixedCosts),
      sellingPricePerUnit: Number(sellingPricePerUnit),
      variableCostPerUnit: Number(variableCostPerUnit),
      targetProfit: req.body.targetProfit ? Number(req.body.targetProfit) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const fuelCostCalculator = (req: Request, res: Response) => {
  try {
    const { distanceKm, fuelEfficiencyKmPerLitre, fuelPricePerLitre } = req.body;
    if (!distanceKm || !fuelEfficiencyKmPerLitre || !fuelPricePerLitre) throw new Error('distanceKm, fuelEfficiencyKmPerLitre and fuelPricePerLitre are required');
    const result = toolsService.calculateFuelCost({
      distanceKm: Number(distanceKm),
      fuelEfficiencyKmPerLitre: Number(fuelEfficiencyKmPerLitre),
      fuelPricePerLitre: Number(fuelPricePerLitre),
      tripsPerMonth: req.body.tripsPerMonth ? Number(req.body.tripsPerMonth) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const generatorCostCalculator = (req: Request, res: Response) => {
  try {
    const { generatorKva, fuelConsumptionPerHour, fuelPricePerLitre, hoursPerDay, gridRatePerKwh, gridHoursPerDay } = req.body;
    if (!generatorKva || !fuelConsumptionPerHour || !fuelPricePerLitre || !hoursPerDay || !gridRatePerKwh || !gridHoursPerDay) {
      throw new Error('generatorKva, fuelConsumptionPerHour, fuelPricePerLitre, hoursPerDay, gridRatePerKwh and gridHoursPerDay are required');
    }
    const result = toolsService.calculateGeneratorCost({
      generatorKva: Number(generatorKva), fuelConsumptionPerHour: Number(fuelConsumptionPerHour),
      fuelPricePerLitre: Number(fuelPricePerLitre), hoursPerDay: Number(hoursPerDay),
      gridRatePerKwh: Number(gridRatePerKwh), gridHoursPerDay: Number(gridHoursPerDay),
      maintenanceCostPerMonth: req.body.maintenanceCostPerMonth ? Number(req.body.maintenanceCostPerMonth) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};
