import { describe, expect, test } from 'vitest';
import { calculateCompanyTax } from '../services/companyTaxService';
import { calculateVAT } from '../services/vatService';
import { calculateWHT } from '../services/whtService';
import { estimateSMETax } from '../services/smeTaxService';

describe('Business Tax Engine', () => {
  describe('Company Income Tax (CIT)', () => {
    test('Legacy: Small company (< 25m) pays 0% CIT', () => {
      const result = calculateCompanyTax({ revenue: 20000000, expenses: 10000000, companyType: 'Small', regime: 'legacy' });
      expect(result.profit).toBe(10000000);
      expect(result.citAmount).toBe(0);
      expect(result.educationTax).toBe(0);
      expect(result.totalBusinessTax).toBe(0);
      expect(result.netProfitAfterTax).toBe(10000000);
    });

    test('Legacy: Medium company (25m - 100m) pays 20% CIT and 3% Education Tax', () => {
      const result = calculateCompanyTax({ revenue: 50000000, expenses: 20000000, companyType: 'Medium', regime: 'legacy' });
      expect(result.profit).toBe(30000000);
      expect(result.citAmount).toBe(6000000); // 20% of 30m
      expect(result.educationTax).toBe(900000); // 3% of 30m
      expect(result.totalBusinessTax).toBe(6900000);
      expect(result.netProfitAfterTax).toBe(23100000);
    });

    test('Legacy: Large company (> 100m) pays 30% CIT and 3% Education Tax', () => {
      const result = calculateCompanyTax({ revenue: 150000000, expenses: 50000000, companyType: 'Large', regime: 'legacy' });
      expect(result.profit).toBe(100000000);
      expect(result.citAmount).toBe(30000000); // 30% of 100m
      expect(result.educationTax).toBe(3000000); // 3% of 100m
      expect(result.totalBusinessTax).toBe(33000000);
      expect(result.netProfitAfterTax).toBe(67000000);
    });

    test('2025: Small company (<= 25m) pays 0% CIT', () => {
      const result = calculateCompanyTax({ revenue: 20000000, expenses: 10000000, companyType: 'Small', regime: '2025' });
      expect(result.profit).toBe(10000000);
      expect(result.citAmount).toBe(0);
      expect(result.developmentLevy).toBe(0);
      expect(result.totalBusinessTax).toBe(0);
      expect(result.netProfitAfterTax).toBe(10000000);
    });

    test('2025: Medium company (<= 100m) pays 20% CIT and 4% Development Levy', () => {
      const result = calculateCompanyTax({ revenue: 80000000, expenses: 10000000, companyType: 'Medium', regime: '2025' });
      expect(result.profit).toBe(70000000);
      expect(result.citAmount).toBe(14000000); // 20% of 70m
      expect(result.developmentLevy).toBe(2800000); // 4% of 70m
      expect(result.totalBusinessTax).toBe(16800000);
      expect(result.netProfitAfterTax).toBe(53200000);
    });

    test('2025: Large company (> 100m) pays 30% CIT and 4% Development Levy', () => {
      const result = calculateCompanyTax({ revenue: 150000000, expenses: 50000000, companyType: 'Large', regime: '2025' });
      expect(result.profit).toBe(100000000);
      expect(result.citAmount).toBe(30000000); // 30% of 100m
      expect(result.developmentLevy).toBe(4000000); // 4% of 100m
      expect(result.totalBusinessTax).toBe(34000000);
      expect(result.netProfitAfterTax).toBe(66000000);
    });

    test('Throws error if expenses > revenue', () => {
      expect(() => calculateCompanyTax({ revenue: 10000000, expenses: 20000000, companyType: 'Small' }))
        .toThrow('Expenses cannot exceed revenue');
    });
  });

  describe('Value Added Tax (VAT)', () => {
    test('Legacy: Adds 7.5% VAT to price', () => {
      const result = calculateVAT({ price: 10000, mode: 'add', regime: 'legacy' });
      expect(result.basePrice).toBe(10000);
      expect(result.vatAmount).toBe(750);
      expect(result.totalPrice).toBe(10750);
    });

    test('2025: Adds 7.5% VAT to price', () => {
      const result = calculateVAT({ price: 10000, mode: 'add', regime: '2025' });
      expect(result.basePrice).toBe(10000);
      expect(result.vatAmount).toBe(750);
      expect(result.totalPrice).toBe(10750);
    });

    test('Legacy: Removes 7.5% VAT from price', () => {
      const result = calculateVAT({ price: 10750, mode: 'remove', regime: 'legacy' });
      expect(result.basePrice).toBe(10000);
      expect(result.vatAmount).toBe(750);
      expect(result.totalPrice).toBe(10750);
    });

    test('2025: Removes 7.5% VAT from price', () => {
      const result = calculateVAT({ price: 10750, mode: 'remove', regime: '2025' });
      expect(result.basePrice).toBe(10000);
      expect(result.vatAmount).toBe(750);
      expect(result.totalPrice).toBe(10750);
    });
  });

  describe('Withholding Tax (WHT)', () => {
    test('Legacy: Professional Services (10%)', () => {
      const result = calculateWHT({ paymentAmount: 500000, serviceType: 'Professional Services', regime: 'legacy' });
      expect(result.originalPayment).toBe(500000);
      expect(result.withholdingTax).toBe(50000);
      expect(result.netPayment).toBe(450000);
    });

    test('2025: Professional Services (10%)', () => {
      const result = calculateWHT({ paymentAmount: 500000, serviceType: 'Professional Services', regime: '2025' });
      expect(result.originalPayment).toBe(500000);
      expect(result.withholdingTax).toBe(50000);
      expect(result.netPayment).toBe(450000);
    });

    test('Legacy: Construction (5%)', () => {
      const result = calculateWHT({ paymentAmount: 1000000, serviceType: 'Construction', regime: 'legacy' });
      expect(result.originalPayment).toBe(1000000);
      expect(result.withholdingTax).toBe(50000);
      expect(result.netPayment).toBe(950000);
    });

    test('2025: Management fees (10%)', () => {
      const result = calculateWHT({ paymentAmount: 1000000, serviceType: 'Management fees', regime: '2025' });
      expect(result.originalPayment).toBe(1000000);
      expect(result.withholdingTax).toBe(100000);
      expect(result.netPayment).toBe(900000);
    });
  });

  describe('SME Tax Estimator', () => {
    test('Legacy: Estimates tax for small business', () => {
      const result = estimateSMETax({ revenue: 15000000, expenses: 5000000, businessType: 'Small business', regime: 'legacy' });
      expect(result.profit).toBe(10000000);
      expect(result.estimatedTaxBand).toBe('Small Company (Exempt)');
      expect(result.applicableTaxRate).toBe(0);
      expect(result.estimatedTaxLiability).toBe(0);
    });

    test('Legacy: Estimates tax for medium startup', () => {
      const result = estimateSMETax({ revenue: 50000000, expenses: 20000000, businessType: 'Startup', regime: 'legacy' });
      expect(result.profit).toBe(30000000);
      expect(result.estimatedTaxBand).toBe('Medium Company');
      expect(result.applicableTaxRate).toBe(0.23);
      expect(result.estimatedTaxLiability).toBe(6900000);
    });

    test('2025: Estimates tax for small business', () => {
      const result = estimateSMETax({ revenue: 20000000, expenses: 5000000, businessType: 'Small business', regime: '2025' });
      expect(result.profit).toBe(15000000);
      expect(result.estimatedTaxBand).toBe('Small Company (Exempt)');
      expect(result.applicableTaxRate).toBe(0);
      expect(result.estimatedTaxLiability).toBe(0);
    });
    
    test('2025: Estimates tax for medium business', () => {
      const result = estimateSMETax({ revenue: 80000000, expenses: 5000000, businessType: 'Small business', regime: '2025' });
      expect(result.profit).toBe(75000000);
      expect(result.estimatedTaxBand).toBe('Medium Company');
      expect(result.applicableTaxRate).toBe(0.24);
      expect(result.estimatedTaxLiability).toBe(18000000);
    });

    test('2025: Estimates tax for large startup', () => {
      const result = estimateSMETax({ revenue: 150000000, expenses: 20000000, businessType: 'Startup', regime: '2025' });
      expect(result.profit).toBe(130000000);
      expect(result.estimatedTaxBand).toBe('Large Company');
      expect(result.applicableTaxRate).toBe(0.34);
      expect(result.estimatedTaxLiability).toBe(44200000); // 34% of 130m
    });
  });
});
