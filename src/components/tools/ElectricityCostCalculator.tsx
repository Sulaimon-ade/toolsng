import React, { useState, useEffect } from 'react';
import { Zap, Calculator, AlertCircle, Plus, Trash2, Info } from 'lucide-react';

const ELECTRICITY_BANDS: Record<string, number> = {
  "Band A": 225,
  "Band B": 150,
  "Band C": 100,
  "Band D": 70,
  "Band E": 50
};

const APPLIANCE_PRESETS = [
  { name: "1.5 HP Air Conditioner", wattage: 1500 },
  { name: "1 HP Air Conditioner", wattage: 1000 },
  { name: "Standing Fan", wattage: 75 },
  { name: "Ceiling Fan", wattage: 60 },
  { name: "LED TV", wattage: 120 },
  { name: "Fridge", wattage: 150 },
  { name: "Deep Freezer", wattage: 300 },
  { name: "Laptop", wattage: 65 },
  { name: "Desktop Computer", wattage: 250 },
  { name: "Microwave", wattage: 1200 },
  { name: "Electric Iron", wattage: 1000 },
  { name: "Electric Kettle", wattage: 1500 },
  { name: "Washing Machine", wattage: 500 },
  { name: "Blender", wattage: 350 },
  { name: "Light Bulb", wattage: 10 },
  { name: "Water Heater", wattage: 2000 }
];

interface ApplianceRow {
  id: string;
  name: string;
  wattage: string;
  quantity: string;
  hoursPerDay: string;
}

interface ApplianceResult {
  name: string;
  wattage: number;
  quantity: number;
  hoursPerDay: number;
  rowTotalWattage: number;
  rowDailyKwh: number;
  rowDailyCost: number;
}

interface ElectricityResult {
  mode: 'manual' | 'estimate';
  wattage?: number;
  hoursPerDay?: number;
  band?: string;
  electricityRate: number;
  appliances?: ApplianceResult[];
  totalDailyKwh?: number;
  dailyKwh?: number;
  dailyCost: number;
  monthlyCost: number;
  yearlyCost: number;
}

export default function ElectricityCostCalculator() {
  const [mode, setMode] = useState<'manual' | 'estimate'>('manual');
  
  // Manual Mode State
  const [wattage, setWattage] = useState<string>('');
  const [hoursPerDay, setHoursPerDay] = useState<string>('');
  const [electricityRate, setElectricityRate] = useState<string>('');
  
  // Estimate Mode State
  const [band, setBand] = useState<string>('');
  const [estimateRate, setEstimateRate] = useState<string>('');
  const [appliances, setAppliances] = useState<ApplianceRow[]>([
    { id: '1', name: '', wattage: '', quantity: '1', hoursPerDay: '' }
  ]);

  const [result, setResult] = useState<ElectricityResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (band && ELECTRICITY_BANDS[band]) {
      setEstimateRate(ELECTRICITY_BANDS[band].toString());
    }
  }, [band]);

  const handleAddAppliance = () => {
    setAppliances([...appliances, { id: Date.now().toString(), name: '', wattage: '', quantity: '1', hoursPerDay: '' }]);
  };

  const handleRemoveAppliance = (id: string) => {
    if (appliances.length > 1) {
      setAppliances(appliances.filter(app => app.id !== id));
    }
  };

  const handleApplianceChange = (id: string, field: keyof ApplianceRow, value: string) => {
    setAppliances(appliances.map(app => {
      if (app.id === id) {
        const updatedApp = { ...app, [field]: value };
        if (field === 'name') {
          const preset = APPLIANCE_PRESETS.find(p => p.name === value);
          if (preset) {
            updatedApp.wattage = preset.wattage.toString();
          }
        }
        return updatedApp;
      }
      return app;
    }));
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    let payload: any = { mode };

    if (mode === 'manual') {
      if (!wattage || !hoursPerDay || !electricityRate) {
        setError('Please fill in all fields');
        return;
      }
      if (Number(hoursPerDay) > 24) {
        setError('Hours used per day cannot exceed 24');
        return;
      }
      payload = {
        ...payload,
        wattage: Number(wattage),
        hoursPerDay: Number(hoursPerDay),
        electricityRate: Number(electricityRate),
      };
    } else {
      if (!estimateRate) {
        setError('Please enter an electricity tariff');
        return;
      }
      
      const validAppliances = appliances.filter(app => app.wattage && app.quantity && app.hoursPerDay);
      if (validAppliances.length === 0) {
        setError('Please add at least one valid appliance');
        return;
      }

      for (const app of validAppliances) {
        if (Number(app.hoursPerDay) > 24) {
          setError('Hours used per day cannot exceed 24 for any appliance');
          return;
        }
      }

      payload = {
        ...payload,
        band: band || undefined,
        electricityRate: Number(estimateRate),
        appliances: validAppliances.map(app => ({
          name: app.name || 'Custom Appliance',
          wattage: Number(app.wattage),
          quantity: Number(app.quantity),
          hoursPerDay: Number(app.hoursPerDay)
        }))
      };
    }

    setIsLoading(true);

    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${API_URL}/api/tools/electricity-cost-calculator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to calculate electricity cost');
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Electricity Cost Calculator</h2>
        <p className="text-slate-600">Calculate how much electricity an appliance costs to run daily, monthly, and yearly.</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-slate-200 p-1 rounded-lg inline-flex">
          <button
            onClick={() => { setMode('manual'); setResult(null); setError(''); }}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'manual' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-600 hover:text-slate-800'}`}
          >
            Manual Mode
          </button>
          <button
            onClick={() => { setMode('estimate'); setResult(null); setError(''); }}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'estimate' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-600 hover:text-slate-800'}`}
          >
            Quick Estimate Mode
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleCalculate} className="space-y-6">
            
            {mode === 'manual' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Appliance Power (Watts)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Zap className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      value={wattage}
                      onChange={(e) => setWattage(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="1500 (for AC)"
                      min="1"
                      step="any"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hours Used Per Day
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="6"
                      min="0.1"
                      max="24"
                      step="any"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Electricity Tariff (₦ per kWh)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 font-medium">₦</span>
                    </div>
                    <input
                      type="number"
                      value={electricityRate}
                      onChange={(e) => setElectricityRate(e.target.value)}
                      className="block w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="225"
                      min="1"
                      step="any"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3 mb-6">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Appliance wattages and band tariffs in this tool are estimates.</p>
                    <p>For more accurate results, check your appliance label and your electricity bill or tariff notice.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Electricity Band
                    </label>
                    <select
                      value={band}
                      onChange={(e) => setBand(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select Band (Optional)</option>
                      {Object.keys(ELECTRICITY_BANDS).map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tariff (₦/kWh)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 font-medium">₦</span>
                      </div>
                      <input
                        type="number"
                        value={estimateRate}
                        onChange={(e) => setEstimateRate(e.target.value)}
                        className="block w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="225"
                        min="1"
                        step="any"
                        required
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 italic mt-1">Band prices are editable because actual tariffs may vary.</p>

                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900">Appliances</h3>
                    <button
                      type="button"
                      onClick={handleAddAppliance}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Appliance
                    </button>
                  </div>

                  {appliances.map((app, index) => (
                    <div key={app.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Appliance {index + 1}</span>
                        {appliances.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAppliance(app.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">Select Appliance</label>
                          <select
                            value={app.name}
                            onChange={(e) => handleApplianceChange(app.id, 'name', e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                          >
                            <option value="">Custom Appliance</option>
                            {APPLIANCE_PRESETS.map(preset => (
                              <option key={preset.name} value={preset.name}>{preset.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Wattage (W)</label>
                          <input
                            type="number"
                            value={app.wattage}
                            onChange={(e) => handleApplianceChange(app.id, 'wattage', e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="e.g. 1500"
                            min="1"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            value={app.quantity}
                            onChange={(e) => handleApplianceChange(app.id, 'quantity', e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            min="1"
                            required
                          />
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">Hours Used Per Day</label>
                          <input
                            type="number"
                            value={app.hoursPerDay}
                            onChange={(e) => handleApplianceChange(app.id, 'hoursPerDay', e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="e.g. 6"
                            min="0.1"
                            max="24"
                            step="any"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Calculator className="w-5 h-5" />
              {isLoading ? 'Calculating...' : 'Calculate'}
            </button>
          </form>
        </div>

        <div>
          {result ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-b pb-4">Calculation Results</h3>
              
              <div className="space-y-6 flex-grow">
                {result.mode === 'manual' ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Appliance Power</p>
                      <p className="font-medium text-slate-900">{result.wattage?.toLocaleString()} W</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Hours Used Per Day</p>
                      <p className="font-medium text-slate-900">{result.hoursPerDay}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Electricity Rate</p>
                      <p className="font-medium text-slate-900">₦{result.electricityRate.toLocaleString()} / kWh</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Daily Energy Use</p>
                      <p className="font-medium text-slate-900">{result.dailyKwh?.toLocaleString()} kWh</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                      <div>
                        <p className="text-slate-500 mb-1">Selected Band</p>
                        <p className="font-medium text-slate-900">{result.band || 'Custom'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Electricity Rate</p>
                        <p className="font-medium text-slate-900">₦{result.electricityRate.toLocaleString()} / kWh</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-slate-500 mb-1">Total Daily Energy Use</p>
                        <p className="font-medium text-slate-900">{result.totalDailyKwh?.toLocaleString()} kWh</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-3">Appliance Breakdown</h4>
                      <div className="space-y-3">
                        {result.appliances?.map((app, idx) => (
                          <div key={idx} className="text-sm border-l-2 border-emerald-500 pl-3">
                            <p className="font-medium text-slate-900">{app.name} (x{app.quantity})</p>
                            <div className="flex justify-between text-slate-600 mt-1">
                              <span>{app.wattage}W • {app.hoursPerDay}h/day</span>
                              <span className="font-medium">₦{app.rowDailyCost.toLocaleString()}/day</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 space-y-4 mt-auto">
                  <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Daily Cost</span>
                    <span className="text-xl font-bold text-slate-900">
                      ₦{result.dailyCost.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Monthly Cost</span>
                    <span className="text-xl font-bold text-emerald-600">
                      ₦{result.monthlyCost.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Yearly Cost</span>
                    <span className="text-xl font-bold text-emerald-700">
                      ₦{result.yearlyCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-full flex flex-col items-center justify-center text-center text-slate-500">
              <Zap className="w-12 h-12 mb-4 text-slate-300" />
              <p>Enter your appliance details and electricity rate to see the cost breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
