import React, { useState, useEffect } from 'react';
import { useInvoiceContext } from '../context/InvoiceContext';
import { Plus, Trash2, Save, Send, Printer, ExternalLink, ArrowLeft, Clock } from 'lucide-react';
import { Invoice, LineItem, Service, TimesheetEntry } from '../types';
import { generateId, generateInvoiceNumber, formatCurrency } from '../lib/utils';
import InvoiceDocument from './InvoiceDocument';

export default function InvoiceEditor({ invoiceId, onNavigate }: { invoiceId: string | null, onNavigate: (view: any, id?: string) => void }) {
  const { invoices, clients, settings, services, timesheets, addInvoice, updateInvoice } = useInvoiceContext();
  
  const [invoice, setInvoice] = useState<Invoice>(() => {
    if (invoiceId && invoiceId !== 'new') {
      const existing = invoices.find(i => i.id === invoiceId);
      if (existing) return existing;
    }
    return {
      id: generateId(),
      invoiceNumber: generateInvoiceNumber(invoices.length),
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '', // Removing requirement for due date
      servicesSuppliedAt: '',
      clientId: '',
      items: [{ id: generateId(), description: '', quantity: 1, rate: 0 }],
      hasGst: false,
      notes: '',
      paymentTerms: 'Please pay within 14 days of invoice date.',
      status: 'Draft'
    };
  });

  const handleSave = () => {
    // Snapshot the client to preserve data as it was when invoiced
    const clientSnapshot = clients.find(c => c.id === invoice.clientId);
    const invoiceToSave = { ...invoice, clientSnapshot };

    if (invoiceId === 'new' && !invoices.some(i => i.id === invoice.id)) {
      addInvoice(invoiceToSave);
    } else {
      updateInvoice(invoiceToSave);
    }
    onNavigate('invoice-preview', invoice.id);
  };

  const addItem = () => setInvoice(prev => ({ ...prev, items: [...prev.items, { id: generateId(), description: '', quantity: 1, rate: 0 }] }));
  
  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeItem = (id: string) => {
    setInvoice(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  };

  const handleServiceSelect = (itemId: string, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    let totalHours = 0;
    let minDate = '';
    let maxDate = '';

    if (invoice.clientId) {
      const relevantTimesheets = timesheets
        .filter(t => t.clientId === invoice.clientId && t.serviceId === service.id)
        .sort((a, b) => new Date(b.date + 'T00:00:00').getTime() - new Date(a.date + 'T00:00:00').getTime());

      if (relevantTimesheets.length > 0) {
        // Group by the week of the most recent timesheet
        const mostRecentDate = new Date(relevantTimesheets[0].date + 'T00:00:00');
        const dayOfWeek = mostRecentDate.getDay(); // 0 is Sunday
        const diffToMonday = mostRecentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        
        const startOfWeek = new Date(mostRecentDate);
        startOfWeek.setDate(diffToMonday);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        // Safely format as YYYY-MM-DD in local time
        const pad = (n: number) => n.toString().padStart(2, '0');
        const startStr = `${startOfWeek.getFullYear()}-${pad(startOfWeek.getMonth() + 1)}-${pad(startOfWeek.getDate())}`;
        const endStr = `${endOfWeek.getFullYear()}-${pad(endOfWeek.getMonth() + 1)}-${pad(endOfWeek.getDate())}`;

        const weekTimesheets = relevantTimesheets.filter(t => t.date >= startStr && t.date <= endStr);
        
        totalHours = weekTimesheets.reduce((sum, t) => sum + t.hours, 0);
        
        const dates = weekTimesheets.map(t => t.date).sort();
        minDate = dates[0] || startStr;
        maxDate = dates[dates.length - 1] || endStr;
      }
    }

    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === itemId ? {
        ...item,
        description: service.name,
        rate: service.defaultRate,
        quantity: totalHours > 0 ? totalHours : item.quantity,
        startDate: minDate || item.startDate || '',
        endDate: maxDate || item.endDate || ''
      } : item)
    }));
  };

  const currentClient = clients.find(c => c.id === invoice.clientId) || invoice.clientSnapshot;

  // Gather unique descriptions from previous invoices + settings presets for autocomplete
  const suggestedDescriptions = React.useMemo(() => {
    const descriptions = new Set<string>();
    
    if (settings.presetDescriptions) {
      settings.presetDescriptions.forEach(d => {
        if (d.trim()) descriptions.add(d.trim());
      });
    }

    invoices.forEach(inv => {
      inv.items.forEach(item => {
        if (item.description && item.description.trim()) {
          descriptions.add(item.description.trim());
        }
      });
    });

    return Array.from(descriptions).sort();
  }, [settings.presetDescriptions, invoices]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] -m-4 md:-m-8 bg-[#f4f7f9] text-[#333]">
      {/* Top Bar matching theme */}
      <div className="bg-white border-b border-[#e0e6ed] px-6 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="text-gray-500 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-lg text-[#1e293b]">
            {invoiceId === 'new' ? 'New Invoice' : `Edit ${invoice.invoiceNumber}`}
          </h2>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} className="px-4 py-2 rounded-md text-sm font-semibold border border-[#cbd5e1] bg-white hover:bg-gray-50 transition-colors flex items-center">
            <Save className="w-4 h-4 mr-2" /> Save & Preview
          </button>
        </div>
      </div>

      {/* Main split view */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Editor Sidebar */}
        <aside className="w-full md:w-[360px] lg:w-[400px] bg-white border-r border-[#e0e6ed] p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          
          <div>
            <h3 className="text-xs uppercase tracking-wider text-[#64748b] font-bold mb-3">Client Information</h3>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Select Company</label>
              <select 
                value={invoice.clientId} 
                onChange={e => setInvoice(prev => ({ ...prev, clientId: e.target.value }))}
                className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6] bg-white"
              >
                <option value="">-- Select Client --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Service Location (Optional)</label>
              <input 
                type="text" 
                value={invoice.servicesSuppliedAt} 
                onChange={e => setInvoice(prev => ({ ...prev, servicesSuppliedAt: e.target.value }))}
                placeholder="e.g. Convention Center, Sydney"
                className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-wider text-[#64748b] font-bold mb-3">Invoice Settings</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">Invoice Number</label>
                <input 
                  type="text" 
                  value={invoice.invoiceNumber} 
                  onChange={e => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">Date Issued</label>
                <input 
                  type="date" 
                  value={invoice.invoiceDate} 
                  onChange={e => setInvoice(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]"
                />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <input 
                type="checkbox" 
                id="hasGst" 
                checked={invoice.hasGst} 
                onChange={e => setInvoice(prev => ({ ...prev, hasGst: e.target.checked }))}
                className="w-4 h-4 text-[#2563eb] border-[#cbd5e1] rounded focus:ring-[#3b82f633]"
              />
              <label htmlFor="hasGst" className="ml-2 text-sm font-medium text-[#333]">Apply GST (10%)</label>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-3">
              <h3 className="text-xs uppercase tracking-wider text-[#64748b] font-bold">Line Items</h3>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pb-2">
              {invoice.items.map((item, index) => (
                <div key={item.id} className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg relative group">
                  <button 
                    onClick={() => removeItem(item.id)} 
                    className="absolute -top-2 -right-2 bg-white border border-[#fca5a5] text-[#ef4444] rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  
                  {services && services.length > 0 && (
                    <div className="mb-3">
                      <label className="block text-[11px] font-semibold text-[#2563eb] mb-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> Auto-fill from Timesheets
                      </label>
                      <select 
                        onChange={(e) => {
                          if (e.target.value) {
                            handleServiceSelect(item.id, e.target.value);
                            e.target.value = ""; // Reset to allow re-selection
                          }
                        }}
                        className="w-full px-2 py-1.5 border border-[#bfdbfe] bg-[#eff6ff] rounded text-sm text-[#1e40af] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                      >
                        <option value="">Select a service to pull hours & rate...</option>
                        {services.map(s => (
                          <option key={s.id} value={s.id}>{s.name} (${s.defaultRate}/hr)</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">Description</label>
                    <input 
                      type="text" 
                      list="preset-descriptions"
                      value={item.description} 
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Service description"
                      className="w-full px-2 py-1.5 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                    />
                    {suggestedDescriptions.length > 0 && (
                      <datalist id="preset-descriptions">
                        {suggestedDescriptions.map((desc, i) => <option key={i} value={desc} />)}
                      </datalist>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-1">Start Date (Opt)</label>
                      <input 
                        type="date" 
                        value={item.startDate || ''} 
                        onChange={e => updateItem(item.id, 'startDate', e.target.value)}
                        className="w-full px-2 py-1.5 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#3b82f6] text-[#475569]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-1">End Date (Opt)</label>
                      <input 
                        type="date" 
                        value={item.endDate || ''} 
                        onChange={e => updateItem(item.id, 'endDate', e.target.value)}
                        className="w-full px-2 py-1.5 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#3b82f6] text-[#475569]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-1">Qty / Hours</label>
                      <input 
                        type="number" 
                        min="0" step="0.25"
                        value={item.quantity} 
                        onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-1">Rate ($)</label>
                      <input 
                        type="number" 
                        min="0" step="0.01"
                        value={item.rate} 
                        onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={addItem} 
              className="mt-3 w-full py-2 px-4 border border-dashed border-[#cbd5e1] rounded-md text-sm font-medium text-[#475569] hover:bg-[#f8fafc] flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Line Item
            </button>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-wider text-[#64748b] font-bold mb-3">Notes & Terms</h3>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Notes</label>
              <textarea 
                value={invoice.notes} 
                onChange={e => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Payment Terms</label>
              <input 
                type="text" 
                value={invoice.paymentTerms} 
                onChange={e => setInvoice(prev => ({ ...prev, paymentTerms: e.target.value }))}
                className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]"
              />
            </div>
          </div>
        </aside>

        {/* Live Preview Area - Hidden on small mobile */}
        <section className="hidden md:flex flex-1 bg-slate-100 p-8 overflow-auto justify-center items-[flex-start]">
          <div className="w-full max-w-[210mm] transition-all duration-300 shadow-2xl rounded-sm">
             <div className="relative w-full h-full pointer-events-none scale-[0.95] origin-top md:scale-100">
               <InvoiceDocument invoice={invoice} settings={settings} client={currentClient} />
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}

