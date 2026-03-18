import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Receipt, Download, Eye, Upload } from 'lucide-react';
import { API_URL } from '../../config/api';

interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'POS/Card', 'Cheque', 'Mobile Money', 'Cryptocurrency', 'Other'];

function fmt(n: number): string {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ReceiptGenerator() {
  const [receiptNumber, setReceiptNumber] = useState(`RCT-${Date.now().toString().slice(-6)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [payerPhone, setPayerPhone] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [items, setItems] = useState<ReceiptItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }
  ]);
  const [vatEnabled, setVatEnabled] = useState(false);
  const [vatRate, setVatRate] = useState(7.5);
  const [notes, setNotes] = useState('');
  const [accentColor, setAccentColor] = useState('#059669');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [subtotal, setSubtotal] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Recalculate totals
  useEffect(() => {
    const newSubtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    setSubtotal(newSubtotal);
    const newVat = vatEnabled ? newSubtotal * (vatRate / 100) : 0;
    setVatAmount(newVat);
    setTotal(newSubtotal + newVat);
  }, [items, vatEnabled, vatRate]);

  const handleItemChange = (id: string, field: keyof ReceiptItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.lineTotal = Number(updated.quantity) * Number(updated.unitPrice);
      }
      return updated;
    }));
  };

  const addItem = () => setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }]);
  const removeItem = (id: string) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)); };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append('logo', e.target.files[0]);
    try {
      const res = await fetch(`${API_URL}/api/tools/invoice-logo-upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        const base = API_URL || '';
        setLogoUrl(data.data.logoUrl.startsWith('http') ? data.data.logoUrl : `${base}/${data.data.logoUrl.replace(/^\//, '')}`);
      }
    } catch (err) { setError('Logo upload failed.'); }
  };

  const validate = () => {
    if (!receiptNumber || !businessName || !payerName || !paymentMethod) {
      setError('Please fill in Receipt Number, Business Name, Payer Name and Payment Method.');
      return false;
    }
    for (const item of items) {
      if (!item.description || item.quantity <= 0) {
        setError('Each item must have a description and quantity greater than 0.');
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleDownload = async () => {
    if (!validate()) return;
    setLoading(true); setError(null);
    try {
      const response = await fetch(`${API_URL}/api/tools/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptNumber, date, businessName, businessEmail, businessPhone, businessAddress,
          payerName, payerEmail, payerPhone, paymentMethod,
          items: items.map(({ description, quantity, unitPrice }) => ({ description, quantity: Number(quantity), unitPrice: Number(unitPrice) })),
          vatEnabled, vatRate: Number(vatRate), notes, accentColor, logoUrl,
          amountPaid: total
        })
      });
      const data = await response.json();
      if (data.success) {
        const base = API_URL || '';
        const url = data.data.pdfUrl.startsWith('http') ? data.data.pdfUrl : `${base}${data.data.pdfUrl}`;
        window.open(url, '_blank');
      } else {
        setError(data.error || 'Failed to generate receipt.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            Receipt Generator
          </h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => validate() && setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors">
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button type="button" onClick={handleDownload} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors disabled:opacity-50">
              <Download className="w-4 h-4" />
              {loading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Branding */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 border-b pb-2">Branding</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Logo</label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative w-20 h-20 border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                    <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    <button type="button" onClick={() => setLogoUrl(null)}
                      className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-500">Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Accent Colour</label>
              <div className="flex items-center gap-3">
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                <span className="text-sm text-slate-600 font-mono">{accentColor}</span>
              </div>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 border-b pb-2">Receipt Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Receipt Number *</label>
                <input type="text" value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method *</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Business + Payer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-3">
            <h3 className="font-medium text-slate-900 border-b pb-2">Your Business *</h3>
            <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Business Name *" />
            <input type="email" value={businessEmail} onChange={e => setBusinessEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Email" />
            <input type="text" value={businessPhone} onChange={e => setBusinessPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Phone" />
            <textarea value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Address" />
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-slate-900 border-b pb-2">Received From *</h3>
            <input type="text" value={payerName} onChange={e => setPayerName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Payer Name *" />
            <input type="email" value={payerEmail} onChange={e => setPayerEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Email" />
            <input type="text" value={payerPhone} onChange={e => setPayerPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Phone" />
          </div>
        </div>

        {/* Items */}
        <div className="mb-8">
          <h3 className="font-medium text-slate-900 border-b pb-2 mb-4">Items</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input type="text" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                  className="flex-grow px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Item description" />
                <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)}
                  className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Qty" />
                <input type="number" min="0" value={item.unitPrice} onChange={e => handleItemChange(item.id, 'unitPrice', e.target.value)}
                  className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Unit Price" />
                <span className="w-32 text-right text-sm font-medium text-slate-700">{fmt(item.lineTotal)}</span>
                <button type="button" onClick={() => removeItem(item.id)} disabled={items.length === 1}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem}
            className="mt-3 flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium text-sm">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {/* Totals + VAT + Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {/* VAT toggle */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-900">VAT</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={vatEnabled} onChange={e => setVatEnabled(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              {vatEnabled && (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-600">Rate:</label>
                  <input type="number" min="0" max="100" step="0.5" value={vatRate} onChange={e => setVatRate(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
                  <span className="text-sm text-slate-500">% (Nigeria standard: 7.5%)</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="e.g. Thank you for your payment." />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium">{fmt(subtotal)}</span>
            </div>
            {vatEnabled && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>VAT ({vatRate}%)</span>
                <span className="font-medium">{fmt(vatAmount)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-900 text-lg">Total Received</span>
              <span className="font-bold text-xl" style={{ color: accentColor }}>{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl">
              <h3 className="text-lg font-semibold text-slate-900">Receipt Preview</h3>
              <div className="flex gap-2">
                <button onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Close</button>
                <button onClick={() => { setShowPreview(false); handleDownload(); }}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium">
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Preview header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  {logoUrl && <img src={logoUrl} alt="Logo" className="max-h-14 mb-3 object-contain" />}
                  <h1 className="text-2xl font-bold" style={{ color: accentColor }}>{businessName || 'Your Business'}</h1>
                  <div className="text-slate-500 text-sm mt-1 space-y-0.5">
                    {businessEmail && <p>{businessEmail}</p>}
                    {businessPhone && <p>{businessPhone}</p>}
                    {businessAddress && <p>{businessAddress}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold uppercase tracking-wider" style={{ color: accentColor }}>Receipt</h2>
                  <div className="text-slate-500 text-sm mt-1 space-y-0.5">
                    <p><span className="font-medium">No:</span> {receiptNumber}</p>
                    <p><span className="font-medium">Date:</span> {date}</p>
                    <p><span className="font-medium">Payment:</span> {paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Received from */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: accentColor }}>Received From</p>
                <p className="font-semibold text-slate-900">{payerName || 'Payer Name'}</p>
                {payerEmail && <p className="text-sm text-slate-500">{payerEmail}</p>}
                {payerPhone && <p className="text-sm text-slate-500">{payerPhone}</p>}
              </div>

              {/* Items table */}
              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="border-b-2 text-left" style={{ borderColor: accentColor, color: accentColor }}>
                    <th className="pb-2 font-bold">Description</th>
                    <th className="pb-2 text-right font-bold">Qty</th>
                    <th className="pb-2 text-right font-bold">Price</th>
                    <th className="pb-2 text-right font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-2 text-slate-800">{item.description || '—'}</td>
                      <td className="py-2 text-right text-slate-600">{item.quantity}</td>
                      <td className="py-2 text-right text-slate-600">{fmt(item.unitPrice)}</td>
                      <td className="py-2 text-right font-medium">{fmt(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-56 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                  {vatEnabled && <div className="flex justify-between text-slate-600"><span>VAT ({vatRate}%)</span><span>{fmt(vatAmount)}</span></div>}
                  <div className="flex justify-between font-bold text-base border-t-2 pt-2" style={{ borderColor: accentColor, color: accentColor }}>
                    <span>Total Paid</span><span>{fmt(total)}</span>
                  </div>
                </div>
              </div>

              {notes && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: accentColor }}>Notes</p>
                  <p className="text-sm text-slate-600">{notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
