import type { VercelRequest, VercelResponse } from '@vercel/node';

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function netSalary(body: any) {
  const { basicSalary, housingAllowance=0, transportAllowance=0, otherAllowances=0, pensionRate=8, nhisRate=5, nhfEnabled=true } = body;
  const gross = basicSalary + housingAllowance + transportAllowance + otherAllowances;
  const pensionBase = basicSalary + housingAllowance + transportAllowance;
  const pension = pensionBase * (pensionRate/100);
  const nhf = nhfEnabled ? basicSalary * 0.025 : 0;
  const nhis = gross * (nhisRate/100);
  const cra = Math.max(200000, gross*0.01) + gross*0.20;
  const taxable = Math.max(0, gross - pension - nhf - nhis - cra);
  const bands = [{l:800000,r:0},{l:2200000,r:0.15},{l:9000000,r:0.18},{l:12000000,r:0.21},{l:null,r:0.24}];
  let rem = taxable, paye = 0;
  for (const b of bands) { if(rem<=0)break; const c=b.l?Math.min(rem,b.l):rem; paye+=c*b.r; rem-=c; }
  const mg=gross/12, mp=paye/12, mPen=pension/12, mNhf=nhf/12, mNhis=nhis/12;
  return { annualGross:gross, monthlyGross:mg, pension, nhf, nhis, cra, taxableIncome:taxable, annualPaye:paye, monthlyPaye:mp, monthlyPension:mPen, monthlyNhf:mNhf, monthlyNhis:mNhis, annualNet:gross-paye-pension-nhf-nhis, monthlyNet:mg-mp-mPen-mNhf-mNhis, effectiveTaxRate:Number((gross>0?(paye/gross)*100:0).toFixed(2)) };
}

function pension(body: any) {
  const { basicSalary, housingAllowance=0, transportAllowance=0, employeeRate=8, employerRate=10, currentRsaBalance=0, yearsToRetirement=30, expectedReturnRate=10 } = body;
  const base = basicSalary+housingAllowance+transportAllowance;
  const me = base*(employeeRate/100)/12, mr = base*(employerRate/100)/12, mt = me+mr;
  const r = expectedReturnRate/100/12, n = yearsToRetirement*12;
  const fvE = currentRsaBalance*Math.pow(1+r,n);
  const fvC = r>0 ? mt*((Math.pow(1+r,n)-1)/r) : mt*n;
  const proj = fvE+fvC;
  return { pensionBase:base, employeeRate, employerRate, monthlyEmployee:me, monthlyEmployer:mr, monthlyTotal:mt, annualTotal:mt*12, yearsToRetirement, projectedBalance:Math.round(proj), totalContributions:Math.round(mt*12*yearsToRetirement+currentRsaBalance), totalGrowth:Math.round(proj-(mt*12*yearsToRetirement+currentRsaBalance)) };
}

function mortgage(body: any) {
  const { propertyPrice, downPayment, annualInterestRate, termYears } = body;
  const loan = propertyPrice - downPayment;
  if(loan<=0) throw new Error('Down payment must be less than property price');
  const r = annualInterestRate/100/12, n = termYears*12;
  const mp = r>0 ? loan*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1) : loan/n;
  const total = mp*n;
  const sched = [];
  let bal = loan;
  for(let yr=1;yr<=Math.min(termYears,5);yr++){
    let yi=0,yp=0;
    for(let m=0;m<12;m++){const i=bal*r;const p=mp-i;yi+=i;yp+=p;bal-=p;}
    sched.push({year:yr,principal:Math.round(yp),interest:Math.round(yi),balance:Math.round(Math.max(0,bal))});
  }
  return { propertyPrice, downPayment, downPaymentPercent:Number(((downPayment/propertyPrice)*100).toFixed(1)), loanAmount:loan, annualInterestRate, termYears, monthlyPayment:Number(mp.toFixed(2)), totalPayment:Number(total.toFixed(2)), totalInterest:Number((total-loan).toFixed(2)), schedule:sched };
}

function breakEven(body: any) {
  const { fixedCosts, sellingPricePerUnit, variableCostPerUnit, targetProfit=0 } = body;
  const cm = sellingPricePerUnit - variableCostPerUnit;
  if(cm<=0) throw new Error('Selling price must exceed variable cost');
  const beu = Math.ceil(fixedCosts/cm), ber = beu*sellingPricePerUnit;
  const uft = targetProfit>0 ? Math.ceil((fixedCosts+targetProfit)/cm) : null;
  const vols = [0.5,1,1.5,2].map(m=>{ const u=Math.round(beu*m),rev=u*sellingPricePerUnit,tc=fixedCosts+u*variableCostPerUnit; return {units:u,revenue:Math.round(rev),totalCost:Math.round(tc),profit:Math.round(rev-tc)}; });
  return { fixedCosts, sellingPricePerUnit, variableCostPerUnit, contributionMargin:cm, contributionMarginRatio:Number((cm/sellingPricePerUnit*100).toFixed(2)), breakEvenUnits:beu, breakEvenRevenue:ber, unitsForTarget:uft, revenueForTarget:uft?uft*sellingPricePerUnit:null, targetProfit, profitAtVolumes:vols };
}

function fuelCost(body: any) {
  const { distanceKm, fuelEfficiencyKmPerLitre, fuelPricePerLitre, tripsPerMonth=1 } = body;
  if(fuelEfficiencyKmPerLitre<=0) throw new Error('Fuel efficiency must be > 0');
  const litres = distanceKm/fuelEfficiencyKmPerLitre, trip = litres*fuelPricePerLitre;
  return { distanceKm, fuelEfficiencyKmPerLitre, fuelPricePerLitre, litresNeeded:Number(litres.toFixed(2)), tripCost:Number(trip.toFixed(2)), tripsPerMonth, monthlyCost:Number((trip*tripsPerMonth).toFixed(2)), yearlyCost:Number((trip*tripsPerMonth*12).toFixed(2)), costPerKm:Number((trip/distanceKm).toFixed(2)) };
}

function generatorCost(body: any) {
  const { generatorKva, fuelConsumptionPerHour, fuelPricePerLitre, hoursPerDay, gridRatePerKwh, gridHoursPerDay, maintenanceCostPerMonth=5000 } = body;
  const df=fuelConsumptionPerHour*hoursPerDay, dfc=df*fuelPricePerLitre, mpd=maintenanceCostPerMonth/30, dc=dfc+mpd;
  const kw=generatorKva*0.8, dkwh=kw*hoursPerDay*0.7, cpk=dkwh>0?dc/dkwh:0;
  const gdc=kw*gridHoursPerDay*gridRatePerKwh, gmc=gdc*30, mc=dc*30;
  return { generatorKva, fuelConsumptionPerHour, fuelPricePerLitre, hoursPerDay, genDailyFuel:Number(df.toFixed(2)), genDailyFuelCost:Number(dfc.toFixed(2)), genDailyCost:Number(dc.toFixed(2)), genMonthlyCost:Number(mc.toFixed(2)), genYearlyCost:Number((dc*365).toFixed(2)), genCostPerKwh:Number(cpk.toFixed(2)), gridMonthlyCost:Number(gmc.toFixed(2)), monthlySavingsIfFullGrid:Number((mc-gmc).toFixed(2)), maintenanceCostPerMonth };
}

function electricityCost(body: any) {
  const { mode='manual', wattage, hoursPerDay, electricityRate, band, appliances } = body;
  if(mode==='manual') {
    const dk=(wattage/1000)*hoursPerDay, dc=dk*electricityRate;
    return { mode:'manual', wattage, hoursPerDay, electricityRate, dailyKwh:Number(dk.toFixed(2)), dailyCost:Number(dc.toFixed(2)), monthlyCost:Number((dc*30).toFixed(2)), yearlyCost:Number((dc*365).toFixed(2)) };
  }
  let tdk=0, tdc=0;
  const apps = appliances.map((a:any)=>{ const rw=a.wattage*a.quantity,dk=(rw/1000)*a.hoursPerDay,dc=dk*electricityRate; tdk+=dk;tdc+=dc; return {...a,rowTotalWattage:rw,rowDailyKwh:Number(dk.toFixed(2)),rowDailyCost:Number(dc.toFixed(2))}; });
  return { mode:'estimate', band, electricityRate, appliances:apps, totalDailyKwh:Number(tdk.toFixed(2)), dailyCost:Number(tdc.toFixed(2)), monthlyCost:Number((tdc*30).toFixed(2)), yearlyCost:Number((tdc*365).toFixed(2)) };
}

const HANDLERS: Record<string, (b: any) => any> = {
  'net-salary-calculator': netSalary,
  'pension-calculator': pension,
  'mortgage-calculator': mortgage,
  'break-even-calculator': breakEven,
  'fuel-cost-calculator': fuelCost,
  'generator-cost-calculator': generatorCost,
  'electricity-cost-calculator': electricityCost,
};

export default function handler(name: string, req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const fn = HANDLERS[name];
    if (!fn) return res.status(404).json({ success: false, error: `Calculator ${name} not found` });
    res.json({ success: true, data: fn(req.body) });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
}
