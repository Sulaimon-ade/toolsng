import { Router } from 'express';
import { calculateCompanyTax } from '../services/companyTaxService';
import { calculateVAT } from '../services/vatService';
import { calculateWHT } from '../services/whtService';
import { estimateSMETax } from '../services/smeTaxService';

const router = Router();

router.post('/cit', (req, res) => {
  try {
    const result = calculateCompanyTax(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/vat', (req, res) => {
  try {
    const result = calculateVAT(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/wht', (req, res) => {
  try {
    const result = calculateWHT(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/sme', (req, res) => {
  try {
    const result = estimateSMETax(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
