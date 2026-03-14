import { Router } from 'express';
import { TaxEngine, TaxInput } from '../engine/TaxEngine';
import { upload } from '../middleware/uploadMiddleware';
import { GoogleGenAI, Type } from '@google/genai';

const router = Router();
const engine = new TaxEngine();

router.post('/calculate', (req, res) => {
  try {
    const input: TaxInput = req.body;
    const result = engine.calculate(input);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/bulk', (req, res) => {
  try {
    const employees: any[] = req.body.employees;
    const results = employees.map(emp => {
      const input: TaxInput = {
        basicSalary: Number(emp.basicSalary) || 0,
        housingAllowance: Number(emp.housingAllowance) || 0,
        transportAllowance: Number(emp.transportAllowance) || 0,
        otherAllowances: Number(emp.otherAllowances) || 0,
        annualRentPaid: Number(emp.annualRent) || 0,
        pensionContributionOverride: emp.pension ? Number(emp.pension) : undefined,
        nhfContributionOverride: emp.nhf ? Number(emp.nhf) : undefined,
        nhisContributionOverride: emp.nhis ? Number(emp.nhis) : undefined,
      };
      const taxResult = engine.calculate(input);
      return {
        name: emp.name || 'Unknown',
        ...taxResult
      };
    });
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/extract-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) throw new Error('Document file is required');
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const mimeType = req.file.mimetype;
    const base64Data = req.file.buffer.toString('base64');
    
    const prompt = `Extract salary and income components from this document. 
    If it's a payslip, extract basic salary, housing allowance, transport allowance, other allowances, pension, nhf, health insurance.
    If it's a bank statement, identify recurring income credits that look like salary or business income and sum them up to estimate annual gross income.
    Return the values as numbers (annualized if monthly). If a value is not found, return 0.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        prompt
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentType: { type: Type.STRING, description: 'payslip or bank_statement' },
            basicSalary: { type: Type.NUMBER },
            housingAllowance: { type: Type.NUMBER },
            transportAllowance: { type: Type.NUMBER },
            otherAllowances: { type: Type.NUMBER },
            pension: { type: Type.NUMBER },
            nhf: { type: Type.NUMBER },
            nhis: { type: Type.NUMBER },
            estimatedAnnualIncome: { type: Type.NUMBER, description: 'For bank statements' },
            confidenceScore: { type: Type.NUMBER, description: '0 to 1 confidence score of extraction' }
          }
        }
      }
    });

    const extractedData = JSON.parse(response.text || '{}');
    res.json({ success: true, data: extractedData });
  } catch (error: any) {
    console.error('Extraction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
