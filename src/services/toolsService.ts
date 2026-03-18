// Pure calculator functions — no native binary dependencies
// Document generation (invoice, receipt, PDF, image) is in documentService.ts

export const calcVat = (amount: number) => {
  const vatAmount = amount * 0.075;
  return { amount, vatAmount, total: amount + vatAmount };
};

export const calcProfitMargin = (costPrice: number, sellingPrice: number) => {
  const profit = sellingPrice - costPrice;
  const profitMargin = (profit / sellingPrice) * 100;
  return { costPrice, sellingPrice, profit, profitMargin: Number(profitMargin.toFixed(2)) };
};

export const calcPercentage = (percentage: number, value: number) => {
  const result = (percentage / 100) * value;
  return { percentage, value, result };
};

export const generateBizName = (keywords: string[]): string[] => {
  const prefixes = ['Pro', 'Smart', 'Next', 'Global', 'Prime', 'Elite', 'Apex', 'Core'];
  const suffixes = ['Solutions', 'Hub', 'Tech', 'Labs', 'Group', 'Works', 'Co', 'Inc'];
  const suggestions: Set<string> = new Set();
  keywords.forEach(keyword => {
    const cap = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
    prefixes.forEach(p => suggestions.add(`${p} ${cap}`));
    suffixes.forEach(s => suggestions.add(`${cap} ${s}`));
    keywords.forEach(other => {
      if (keyword !== other) {
        const o = other.charAt(0).toUpperCase() + other.slice(1).toLowerCase();
        suggestions.add(`${cap} ${o}`);
        suggestions.add(`${cap}${o}`);
      }
    });
  });
  return Array.from(suggestions).slice(0, 15);
};

export const convertUsdToNgn = async (amountUSD: number, fromCurrency: string = 'USD') => {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    if (!response.ok) throw new Error('Failed to fetch exchange rate');
    const data = await response.json();
    const exchangeRate = data.rates.NGN;
    if (!exchangeRate) throw new Error('NGN rate not found');
    const amountNGN = amountUSD * exchangeRate;
    return { amountUSD, exchangeRate, amountNGN };
  } catch {
    throw new Error('Unable to fetch exchange rate. Please try again.');
  }
};

export const calculateLoanRepayment = (loanAmount: number, interestRate: number, loanTermMonths: number) => {
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) / (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
  const totalRepayment = monthlyPayment * loanTermMonths;
  const totalInterest = totalRepayment - loanAmount;
  return {
    loanAmount, interestRate, loanTermMonths,
    monthlyPayment: Number(monthlyPayment.toFixed(2)),
    totalRepayment: Number(totalRepayment.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
  };
};

export const calculateInvestmentGrowth = (principal: number, annualRate: number, years: number, compoundFrequency: number) => {
  const r = annualRate / 100;
  const n = compoundFrequency;
  const t = years;
  const finalAmount = principal * Math.pow(1 + r / n, n * t);
  const interestEarned = finalAmount - principal;
  return {
    principal, annualRate, years, compoundFrequency,
    finalAmount: Math.round(finalAmount),
    interestEarned: Math.round(interestEarned),
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
    costPrice, sellingPrice, quantity, profitPerUnit, totalCost, totalRevenue, totalProfit,
    profitMargin: Number(profitMargin.toFixed(2)),
    markupPercentage: Number(markupPercentage.toFixed(2)),
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
    mode: 'manual' as const, wattage, hoursPerDay, electricityRate,
    dailyKwh: Number(dailyKwh.toFixed(2)),
    dailyCost: Number(dailyCost.toFixed(2)),
    monthlyCost: Number(monthlyCost.toFixed(2)),
    yearlyCost: Number(yearlyCost.toFixed(2)),
  };
};

export const calculateElectricityCostAdvanced = (
  mode: string, electricityRate: number,
  wattage?: number, hoursPerDay?: number,
  band?: string, appliances?: any[]
) => {
  if (mode === 'manual') {
    if (!wattage || !hoursPerDay) throw new Error('wattage and hoursPerDay required for manual mode');
    return calculateElectricityCost(wattage, hoursPerDay, electricityRate);
  }
  if (mode === 'estimate') {
    if (!appliances?.length) throw new Error('appliances required for estimate mode');
    let totalDailyKwh = 0;
    let totalDailyCost = 0;
    const processedAppliances = appliances.map((app: any) => {
      const rowTotalWattage = app.wattage * app.quantity;
      const rowDailyKwh = (rowTotalWattage / 1000) * app.hoursPerDay;
      const rowDailyCost = rowDailyKwh * electricityRate;
      totalDailyKwh += rowDailyKwh;
      totalDailyCost += rowDailyCost;
      return { name: app.name, wattage: app.wattage, quantity: app.quantity, hoursPerDay: app.hoursPerDay, rowTotalWattage, rowDailyKwh: Number(rowDailyKwh.toFixed(2)), rowDailyCost: Number(rowDailyCost.toFixed(2)) };
    });
    return {
      mode: 'estimate' as const, band, electricityRate,
      appliances: processedAppliances,
      totalDailyKwh: Number(totalDailyKwh.toFixed(2)),
      dailyCost: Number(totalDailyCost.toFixed(2)),
      monthlyCost: Number((totalDailyCost * 30).toFixed(2)),
      yearlyCost: Number((totalDailyCost * 365).toFixed(2)),
    };
  }
  throw new Error('Invalid mode');
};

export const calculateNetSalary = (input: {
  basicSalary: number; housingAllowance: number; transportAllowance: number; otherAllowances: number;
  pensionRate?: number; nhfEnabled?: boolean; nhisRate?: number;
}) => {
  const gross = input.basicSalary + input.housingAllowance + input.transportAllowance + input.otherAllowances;
  const pensionBase = input.basicSalary + input.housingAllowance + input.transportAllowance;
  const pension = pensionBase * ((input.pensionRate ?? 8) / 100);
  const nhf = input.nhfEnabled !== false ? input.basicSalary * 0.025 : 0;
  const nhis = gross * ((input.nhisRate ?? 5) / 100);
  const craBase = Math.max(200000, gross * 0.01);
  const cra = craBase + gross * 0.20;
  const taxableIncome = Math.max(0, gross - pension - nhf - nhis - cra);
  const brackets = [
    { limit: 800000, rate: 0 }, { limit: 2200000, rate: 0.15 },
    { limit: 9000000, rate: 0.18 }, { limit: 12000000, rate: 0.21 }, { limit: null, rate: 0.24 },
  ];
  let remaining = taxableIncome, annualPaye = 0;
  for (const b of brackets) {
    if (remaining <= 0) break;
    const chunk = b.limit ? Math.min(remaining, b.limit) : remaining;
    annualPaye += chunk * b.rate;
    remaining -= chunk;
  }
  const monthlyGross = gross / 12;
  const monthlyPaye = annualPaye / 12;
  const monthlyPension = pension / 12;
  const monthlyNhf = nhf / 12;
  const monthlyNhis = nhis / 12;
  const monthlyNet = monthlyGross - monthlyPaye - monthlyPension - monthlyNhf - monthlyNhis;
  return {
    annualGross: gross, monthlyGross, pension, nhf, nhis, cra, taxableIncome,
    annualPaye, monthlyPaye, monthlyPension, monthlyNhf, monthlyNhis,
    annualNet: gross - annualPaye - pension - nhf - nhis, monthlyNet,
    effectiveTaxRate: Number((gross > 0 ? (annualPaye / gross) * 100 : 0).toFixed(2)),
  };
};

export const calculatePension = (input: {
  basicSalary: number; housingAllowance: number; transportAllowance: number;
  employeeRate?: number; employerRate?: number; currentRsaBalance?: number;
  yearsToRetirement?: number; expectedReturnRate?: number;
}) => {
  const pensionBase = input.basicSalary + input.housingAllowance + input.transportAllowance;
  const employeeRate = input.employeeRate ?? 8;
  const employerRate = input.employerRate ?? 10;
  const monthlyEmployee = pensionBase * (employeeRate / 100) / 12;
  const monthlyEmployer = pensionBase * (employerRate / 100) / 12;
  const monthlyTotal = monthlyEmployee + monthlyEmployer;
  const annualTotal = monthlyTotal * 12;
  const years = input.yearsToRetirement ?? 30;
  const r = (input.expectedReturnRate ?? 10) / 100 / 12;
  const n = years * 12;
  const currentBalance = input.currentRsaBalance ?? 0;
  const fvExisting = currentBalance * Math.pow(1 + r, n);
  const fvContributions = r > 0 ? monthlyTotal * ((Math.pow(1 + r, n) - 1) / r) : monthlyTotal * n;
  const projectedBalance = fvExisting + fvContributions;
  const totalContributions = annualTotal * years + currentBalance;
  return {
    pensionBase, employeeRate, employerRate, monthlyEmployee, monthlyEmployer,
    monthlyTotal, annualTotal, yearsToRetirement: years,
    projectedBalance: Math.round(projectedBalance),
    totalContributions: Math.round(totalContributions),
    totalGrowth: Math.round(projectedBalance - totalContributions),
  };
};

export const calculateMortgage = (input: {
  propertyPrice: number; downPayment: number; annualInterestRate: number; termYears: number;
}) => {
  const loanAmount = input.propertyPrice - input.downPayment;
  if (loanAmount <= 0) throw new Error('Down payment must be less than property price.');
  const monthlyRate = input.annualInterestRate / 100 / 12;
  const n = input.termYears * 12;
  const monthlyPayment = monthlyRate > 0
    ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
    : loanAmount / n;
  const totalPayment = monthlyPayment * n;
  const totalInterest = totalPayment - loanAmount;
  const schedule = [];
  let balance = loanAmount;
  for (let yr = 1; yr <= Math.min(input.termYears, 5); yr++) {
    let yearInterest = 0, yearPrincipal = 0;
    for (let m = 0; m < 12; m++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      yearInterest += interest; yearPrincipal += principal; balance -= principal;
    }
    schedule.push({ year: yr, principal: Math.round(yearPrincipal), interest: Math.round(yearInterest), balance: Math.round(Math.max(0, balance)) });
  }
  return {
    propertyPrice: input.propertyPrice, downPayment: input.downPayment,
    downPaymentPercent: Number(((input.downPayment / input.propertyPrice) * 100).toFixed(1)),
    loanAmount, annualInterestRate: input.annualInterestRate, termYears: input.termYears,
    monthlyPayment: Number(monthlyPayment.toFixed(2)),
    totalPayment: Number(totalPayment.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    schedule,
  };
};

export const calculateBreakEven = (input: {
  fixedCosts: number; sellingPricePerUnit: number; variableCostPerUnit: number; targetProfit?: number;
}) => {
  const contributionMargin = input.sellingPricePerUnit - input.variableCostPerUnit;
  if (contributionMargin <= 0) throw new Error('Selling price must be greater than variable cost per unit.');
  const contributionMarginRatio = (contributionMargin / input.sellingPricePerUnit) * 100;
  const breakEvenUnits = Math.ceil(input.fixedCosts / contributionMargin);
  const breakEvenRevenue = breakEvenUnits * input.sellingPricePerUnit;
  const targetProfit = input.targetProfit ?? 0;
  const unitsForTarget = targetProfit > 0 ? Math.ceil((input.fixedCosts + targetProfit) / contributionMargin) : null;
  const revenueForTarget = unitsForTarget ? unitsForTarget * input.sellingPricePerUnit : null;
  const volumes = [0.5, 1, 1.5, 2].map(mult => {
    const units = Math.round(breakEvenUnits * mult);
    const revenue = units * input.sellingPricePerUnit;
    const totalCost = input.fixedCosts + units * input.variableCostPerUnit;
    return { units, revenue: Math.round(revenue), totalCost: Math.round(totalCost), profit: Math.round(revenue - totalCost) };
  });
  return {
    fixedCosts: input.fixedCosts, sellingPricePerUnit: input.sellingPricePerUnit,
    variableCostPerUnit: input.variableCostPerUnit, contributionMargin,
    contributionMarginRatio: Number(contributionMarginRatio.toFixed(2)),
    breakEvenUnits, breakEvenRevenue, unitsForTarget, revenueForTarget, targetProfit,
    profitAtVolumes: volumes,
  };
};

export const calculateFuelCost = (input: {
  distanceKm: number; fuelEfficiencyKmPerLitre: number; fuelPricePerLitre: number; tripsPerMonth?: number;
}) => {
  if (input.fuelEfficiencyKmPerLitre <= 0) throw new Error('Fuel efficiency must be greater than 0.');
  const litresNeeded = input.distanceKm / input.fuelEfficiencyKmPerLitre;
  const tripCost = litresNeeded * input.fuelPricePerLitre;
  const tripsPerMonth = input.tripsPerMonth ?? 1;
  const monthlyCost = tripCost * tripsPerMonth;
  return {
    distanceKm: input.distanceKm, fuelEfficiencyKmPerLitre: input.fuelEfficiencyKmPerLitre,
    fuelPricePerLitre: input.fuelPricePerLitre,
    litresNeeded: Number(litresNeeded.toFixed(2)),
    tripCost: Number(tripCost.toFixed(2)), tripsPerMonth,
    monthlyCost: Number(monthlyCost.toFixed(2)),
    yearlyCost: Number((monthlyCost * 12).toFixed(2)),
    costPerKm: Number((tripCost / input.distanceKm).toFixed(2)),
  };
};

export const calculateGeneratorCost = (input: {
  generatorKva: number; fuelConsumptionPerHour: number; fuelPricePerLitre: number;
  hoursPerDay: number; gridRatePerKwh: number; gridHoursPerDay: number; maintenanceCostPerMonth?: number;
}) => {
  const genDailyFuel = input.fuelConsumptionPerHour * input.hoursPerDay;
  const genDailyFuelCost = genDailyFuel * input.fuelPricePerLitre;
  const maintenancePerDay = (input.maintenanceCostPerMonth ?? 5000) / 30;
  const genDailyCost = genDailyFuelCost + maintenancePerDay;
  const genKw = input.generatorKva * 0.8;
  const genDailyKwh = genKw * input.hoursPerDay * 0.7;
  const genCostPerKwh = genDailyKwh > 0 ? genDailyCost / genDailyKwh : 0;
  const gridDailyCost = genKw * input.gridHoursPerDay * input.gridRatePerKwh;
  const gridMonthlyCost = gridDailyCost * 30;
  const genMonthlyCost = genDailyCost * 30;
  return {
    generatorKva: input.generatorKva, fuelConsumptionPerHour: input.fuelConsumptionPerHour,
    fuelPricePerLitre: input.fuelPricePerLitre, hoursPerDay: input.hoursPerDay,
    genDailyFuel: Number(genDailyFuel.toFixed(2)),
    genDailyFuelCost: Number(genDailyFuelCost.toFixed(2)),
    genDailyCost: Number(genDailyCost.toFixed(2)),
    genMonthlyCost: Number(genMonthlyCost.toFixed(2)),
    genYearlyCost: Number((genDailyCost * 365).toFixed(2)),
    genCostPerKwh: Number(genCostPerKwh.toFixed(2)),
    gridMonthlyCost: Number(gridMonthlyCost.toFixed(2)),
    monthlySavingsIfFullGrid: Number((genMonthlyCost - gridMonthlyCost).toFixed(2)),
    maintenanceCostPerMonth: input.maintenanceCostPerMonth ?? 5000,
  };
};
