import { describe, expect, test } from 'vitest';
import { TaxEngine } from './TaxEngine';

describe('TaxEngine', () => {
  const engine = new TaxEngine();

  test('calculates zero tax for low income', () => {
    const result = engine.calculate({ 
      grossIncome: 799000,
      basicSalary: 799000,
      housingAllowance: 0,
      transportAllowance: 0,
      otherAllowances: 0,
      annualRentPaid: 0
    } as any);
    
    expect(result.grossIncome).toBe(799000);
    expect(result.taxableIncome).toBe(0);
    expect(result.annualTax).toBe(0);
    expect(result.monthlyPaye).toBe(0);
    
    // Net income should be Gross - Deductions
    const expectedNet = 799000 - result.deductions.total;
    expect(result.netIncome).toBe(expectedNet);
  });

  test('calculates correct tax for high income', () => {
    const result = engine.calculate({ 
      grossIncome: 5000000,
      basicSalary: 5000000,
      housingAllowance: 0,
      transportAllowance: 0,
      otherAllowances: 0,
      annualRentPaid: 0
    } as any);
    
    expect(result.grossIncome).toBe(5000000);
    expect(result.taxableIncome).toBeGreaterThan(0);
    expect(result.annualTax).toBeGreaterThan(0);
    
    // Net income should be Gross - Deductions - Tax
    const expectedNet = 5000000 - result.deductions.total - result.annualTax;
    expect(result.netIncome).toBe(expectedNet);
  });

  test('handles detailed input correctly', () => {
    const result = engine.calculate({
      grossIncome: 10000000,
      basicSalary: 4000000,
      housingAllowance: 2000000,
      transportAllowance: 1000000,
      otherAllowances: 3000000,
      annualRentPaid: 0
    } as any);

    expect(result.grossIncome).toBe(10000000);
    // Pension is 8% of Basic + Housing + Transport
    const expectedPension = (4000000 + 2000000 + 1000000) * 0.08;
    expect(result.deductions.pension).toBe(expectedPension);
  });

  test('clamps negative taxable income to zero', () => {
    const result = engine.calculate({ 
      grossIncome: 100000,
      basicSalary: 100000,
      housingAllowance: 0,
      transportAllowance: 0,
      otherAllowances: 0,
      annualRentPaid: 0
    } as any);
    
    expect(result.taxableIncome).toBe(0);
    expect(result.annualTax).toBe(0);
  });
});
