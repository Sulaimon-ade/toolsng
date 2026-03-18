import { Router } from 'express';
import {
  generateInvoice,
  generateReceipt,
  generateQuotation,
  calculateVat,
  calculateProfitMargin,
  generateQrCode,
  compressImage,
  resizeImage,
  calculatePercentage,
  generateBusinessName,
  currencyConverter,
  loanCalculator,
  investmentCalculator,
  profitMarginCalculator,
  invoiceGenerator,
  invoiceLogoUpload,
  downloadInvoice,
  electricityCostCalculator,
  netSalaryCalculator,
  pensionCalculator,
  mortgageCalculator,
  breakEvenCalculator,
  fuelCostCalculator,
  generatorCostCalculator,
} from '../controllers/toolsController';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.post('/invoice', generateInvoice);
router.post('/receipt', generateReceipt);
router.post('/quotation', generateQuotation);
router.post('/vat', calculateVat);
router.post('/profit', calculateProfitMargin);
router.post('/qrcode', generateQrCode);
router.post('/image-compress', upload.single('image'), compressImage);
router.post('/image-resize', upload.single('image'), resizeImage);
router.post('/percentage', calculatePercentage);
router.post('/business-name', generateBusinessName);
router.post('/currency-converter', currencyConverter);
router.post('/loan-calculator', loanCalculator);
router.post('/investment-calculator', investmentCalculator);
router.post('/profit-margin-calculator', profitMarginCalculator);
router.post('/invoice-generator', invoiceGenerator);
router.post('/invoice-logo-upload', upload.single('logo'), invoiceLogoUpload);
router.get('/invoice-download/:filename', downloadInvoice);
router.post('/electricity-cost-calculator', electricityCostCalculator);
router.post('/net-salary-calculator', netSalaryCalculator);
router.post('/pension-calculator', pensionCalculator);
router.post('/mortgage-calculator', mortgageCalculator);
router.post('/break-even-calculator', breakEvenCalculator);
router.post('/fuel-cost-calculator', fuelCostCalculator);
router.post('/generator-cost-calculator', generatorCostCalculator);

export default router;
