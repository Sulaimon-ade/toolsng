import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Download, Eye, Upload } from 'lucide-react';
import { API_URL } from '../../config/api';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface ExtraCharge {
  id: string;
  label: string;
  amount: number;
}

export default function InvoiceGenerator() {
  const [invoiceNumber, setInvoiceNumber] = useState('INV-1001');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }
  ]);
  
  const [notes, setNotes] = useState('');
  
  // New fields
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [accentColor, setAccentColor] = useState('#059669');
  
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxLabel, setTaxLabel] = useState('VAT');
  const [taxType, setTaxType] = useState<'percentage' | 'fixed'>('percentage');
  const [taxValue, setTaxValue] = useState(0);
  
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  
  const [extraCharges, setExtraCharges] = useState<ExtraCharge[]>([]);
  
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [extraChargesTotal, setExtraChargesTotal] = useState(0);
  const [total, setTotal] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Calculate totals whenever items or other values change
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    setSubtotal(newSubtotal);
    
    const newExtraChargesTotal = extraCharges.reduce((sum, charge) => sum + charge.amount, 0);
    setExtraChargesTotal(newExtraChargesTotal);
    
    const taxableBase = newSubtotal + newExtraChargesTotal;

    // Discount applied FIRST, then tax on the reduced amount (correct Nigerian invoice practice)
    let newDiscountAmount = 0;
    if (discountEnabled) {
      if (discountType === 'percentage') {
        newDiscountAmount = taxableBase * (discountValue / 100);
      } else {
        newDiscountAmount = discountValue;
      }
    }
    setDiscountAmount(newDiscountAmount);

    const amountAfterDiscount = taxableBase - newDiscountAmount;

    let newTaxAmount = 0;
    if (taxEnabled) {
      if (taxType === 'percentage') {
        newTaxAmount = amountAfterDiscount * (taxValue / 100);
      } else {
        newTaxAmount = taxValue;
      }
    }
    setTaxAmount(newTaxAmount);

    let newTotal = amountAfterDiscount + newTaxAmount;
    if (newTotal < 0) newTotal = 0;
    setTotal(newTotal);
  }, [items, taxEnabled, taxType, taxValue, discountEnabled, discountType, discountValue, extraCharges]);

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.lineTotal = Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };
  
  const handleExtraChargeChange = (id: string, field: keyof ExtraCharge, value: string | number) => {
    setExtraCharges(extraCharges.map(charge => {
      if (charge.id === id) {
        return { ...charge, [field]: value };
      }
      return charge;
    }));
  };

  const addExtraCharge = () => {
    setExtraCharges([
      ...extraCharges,
      { id: Date.now().toString(), label: '', amount: 0 }
    ]);
  };

  const removeExtraCharge = (id: string) => {
    setExtraCharges(extraCharges.filter(charge => charge.id !== id));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      const formData = new FormData();
      formData.append('logo', file);
      
      try {
        const response = await fetch(`${API_URL}/api/tools/invoice-logo-upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          const baseUrl = API_URL || '';
          const fullLogoUrl = data.data.logoUrl.startsWith('http') ? data.data.logoUrl : `${baseUrl}/${data.data.logoUrl.replace(/^\//, '')}`;
          setLogoUrl(fullLogoUrl);
        } else {
          setError(data.error || 'Failed to upload logo');
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred during logo upload.');
      }
    }
  };

  const validateForm = () => {
    if (!invoiceNumber || !issueDate || !dueDate || !businessName || !clientName) {
      setError('Please fill in all required fields (Invoice Number, Dates, Business Name, Client Name)');
      return false;
    }
    
    if (items.length === 0) {
      setError('Please add at least one item');
      return false;
    }
    
    for (const item of items) {
      if (!item.description || item.quantity <= 0 || item.unitPrice < 0) {
        setError('Please ensure all items have a description, quantity > 0, and unit price >= 0');
        return false;
      }
    }
    
    for (const charge of extraCharges) {
      if (!charge.label || charge.amount < 0) {
        setError('Please ensure all extra charges have a label and amount >= 0');
        return false;
      }
    }
    
    setError(null);
    return true;
  };

  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleGeneratePDF = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/tools/invoice-generator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber,
          issueDate,
          dueDate,
          businessName,
          businessEmail,
          businessPhone,
          businessAddress,
          clientName,
          clientEmail,
          clientPhone,
          clientAddress,
          items: items.map(({ description, quantity, unitPrice }) => ({
            description,
            quantity: Number(quantity),
            unitPrice: Number(unitPrice)
          })),
          notes,
          logoUrl,
          accentColor,
          taxEnabled,
          taxLabel,
          taxType,
          taxValue: Number(taxValue),
          discountEnabled,
          discountType,
          discountValue: Number(discountValue),
          extraCharges: extraCharges.map(({ label, amount }) => ({
            label,
            amount: Number(amount)
          }))
        })
      });
      
      const data = await response.json();
      if (data.success) {
        const baseUrl = API_URL || '';
        const fullPdfUrl = data.data.pdfUrl.startsWith('http') ? data.data.pdfUrl : `${baseUrl}/${data.data.pdfUrl.replace(/^\//, '')}`;
        setPdfUrl(fullPdfUrl);
        // Trigger download
        window.open(fullPdfUrl, '_blank');
      } else {
        setError(data.error || 'Failed to generate invoice');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during generation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Invoice Generator
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePreview}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              type="button"
              onClick={handleGeneratePDF}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {loading ? 'Generating...' : 'Generate PDF'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Branding</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Logo</label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative w-20 h-20 border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                    <img src={logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => { setLogoUrl(null); setLogoFile(null); }}
                      className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-500 font-medium">Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                )}
                <div className="text-xs text-slate-500">
                  <p>Recommended: Square or landscape image.</p>
                  <p>Max size: 5MB.</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-sm text-slate-600 font-mono">{accentColor}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Invoice Details</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Number *</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="INV-1001"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date *</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Your Business Details</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Name *</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Your Company Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="contact@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="+234 800 000 0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <textarea
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="123 Business St, City"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Client Details</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Client Name or Company"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="client@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="+234 800 000 0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <textarea
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="456 Client Ave, City"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium text-slate-900 border-b pb-2 mb-4">Items</h3>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex-grow w-full md:w-auto">
                  <label className="block text-xs font-medium text-slate-500 mb-1 md:hidden">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Item description"
                  />
                </div>
                <div className="w-full md:w-24">
                  <label className="block text-xs font-medium text-slate-500 mb-1 md:hidden">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Qty"
                  />
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-xs font-medium text-slate-500 mb-1 md:hidden">Unit Price (₦)</label>
                  <input
                    type="number"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Price"
                  />
                </div>
                <div className="w-full md:w-32 text-right font-medium text-slate-700 pt-2 md:pt-0">
                  <span className="md:hidden text-xs text-slate-500 mr-2">Total:</span>
                  ₦{item.lineTotal.toLocaleString()}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addItem}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-900">Tax</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={taxEnabled} onChange={(e) => setTaxEnabled(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              {taxEnabled && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Label</label>
                    <input type="text" value={taxLabel} onChange={(e) => setTaxLabel(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="VAT" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                    <select value={taxType} onChange={(e) => setTaxType(e.target.value as 'percentage' | 'fixed')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                      <option value="percentage">%</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Value</label>
                    <input type="number" min="0" value={taxValue} onChange={(e) => setTaxValue(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-900">Discount</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={discountEnabled} onChange={(e) => setDiscountEnabled(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              {discountEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                    <select value={discountType} onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                      <option value="percentage">%</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Value</label>
                    <input type="number" min="0" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-900">Extra Charges</h4>
                <button type="button" onClick={addExtraCharge} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="space-y-3">
                {extraCharges.map((charge) => (
                  <div key={charge.id} className="flex gap-3 items-center">
                    <input type="text" value={charge.label} onChange={(e) => handleExtraChargeChange(charge.id, 'label', e.target.value)} placeholder="e.g. Delivery Fee" className="flex-grow px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
                    <input type="number" min="0" value={charge.amount} onChange={(e) => handleExtraChargeChange(charge.id, 'amount', Number(e.target.value))} placeholder="Amount" className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
                    <button type="button" onClick={() => removeExtraCharge(charge.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {extraCharges.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No extra charges added.</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-6"
              placeholder="Thank you for your business."
              rows={4}
            />
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                </div>
                {extraCharges.length > 0 && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Extra Charges:</span>
                    <span className="font-medium">₦{extraChargesTotal.toLocaleString()}</span>
                  </div>
                )}
                {taxEnabled && taxAmount > 0 && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span>{taxLabel || 'Tax'}:</span>
                    <span className="font-medium">₦{taxAmount.toLocaleString()}</span>
                  </div>
                )}
                {discountEnabled && discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-medium">-₦{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-slate-900 font-semibold text-lg">Total:</span>
                  <span className="text-emerald-600 font-bold text-xl" style={{ color: accentColor }}>₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl">
              <h3 className="text-lg font-semibold text-slate-900">Invoice Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    handleGeneratePDF();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-12">
                <div>
                  {logoUrl && (
                    <img src={logoUrl} alt="Company Logo" className="max-h-16 mb-4 object-contain" />
                  )}
                  <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ color: accentColor }}>{businessName || 'Your Business'}</h1>
                  <div className="text-slate-600 text-sm space-y-1">
                    {businessEmail && <p>{businessEmail}</p>}
                    {businessPhone && <p>{businessPhone}</p>}
                    {businessAddress && <p className="whitespace-pre-wrap">{businessAddress}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold mb-2 uppercase tracking-wider" style={{ color: accentColor }}>Invoice</h2>
                  <div className="text-slate-600 text-sm space-y-1">
                    <p><span className="font-medium">Invoice #:</span> {invoiceNumber}</p>
                    <p><span className="font-medium">Date:</span> {issueDate}</p>
                    <p><span className="font-medium">Due Date:</span> {dueDate}</p>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-2" style={{ color: accentColor, borderColor: accentColor }}>Bill To</h3>
                <p className="font-medium text-slate-900 mt-3">{clientName || 'Client Name'}</p>
                <div className="text-slate-600 text-sm space-y-1 mt-1">
                  {clientEmail && <p>{clientEmail}</p>}
                  {clientPhone && <p>{clientPhone}</p>}
                  {clientAddress && <p className="whitespace-pre-wrap">{clientAddress}</p>}
                </div>
              </div>

              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 text-left text-sm font-bold" style={{ borderColor: accentColor, color: accentColor }}>
                    <th className="pb-3">Description</th>
                    <th className="pb-3 text-right">Qty</th>
                    <th className="pb-3 text-right">Unit Price</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-3 text-slate-800">{item.description || '-'}</td>
                      <td className="py-3 text-right text-slate-600">{item.quantity}</td>
                      <td className="py-3 text-right text-slate-600">₦{item.unitPrice.toLocaleString()}</td>
                      <td className="py-3 text-right font-medium text-slate-900">₦{item.lineTotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-12">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  {extraCharges.map((charge) => (
                    <div key={charge.id} className="flex justify-between text-sm text-slate-600">
                      <span>{charge.label}</span>
                      <span>₦{charge.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {taxEnabled && taxAmount > 0 && (
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>{taxLabel || 'Tax'}</span>
                      <span>₦{taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {discountEnabled && discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount</span>
                      <span>-₦{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t-2 pt-3" style={{ borderColor: accentColor }}>
                    <span style={{ color: accentColor }}>Total</span>
                    <span style={{ color: accentColor }}>₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {notes && (
                <div className="border-t pt-6" style={{ borderColor: accentColor }}>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>Notes</h3>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap">{notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
