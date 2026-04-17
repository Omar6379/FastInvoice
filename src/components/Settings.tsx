import React, { useState } from 'react';
import { useInvoiceContext } from '../context/InvoiceContext';
import { Save, Check, Plus, Trash2 } from 'lucide-react';
import { Service } from '../types';

export default function Settings() {
  const { settings, setSettings, services, addService, updateService, deleteService } = useInvoiceContext();
  const [formData, setFormData] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceRate, setNewServiceRate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddService = () => {
    if (newServiceName.trim() && newServiceRate) {
      addService({
        id: Date.now().toString(),
        name: newServiceName.trim(),
        defaultRate: parseFloat(newServiceRate)
      });
      setNewServiceName('');
      setNewServiceRate('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-[#333]">
      <h1 className="text-2xl font-bold text-[#1e293b] mb-2">My Details (Contractor)</h1>
      <p className="text-[#64748b] mb-8 text-sm">
        These details will be automatically filled into every new invoice you create.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-[#e0e6ed]">
        <div>
          <h2 className="text-[11px] uppercase tracking-wider text-[#94a3b8] font-bold mb-4 border-b border-[#e0e6ed] pb-2">Personal / Business Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Full Name / Trading Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">ABN</label>
              <input type="text" name="abn" value={formData.abn} onChange={handleChange} required className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">ACN (Optional)</label>
              <input type="text" name="acn" value={formData.acn} onChange={handleChange} className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Mobile Number</label>
              <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows={2} required className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]"></textarea>
            </div>
          </div>
        </div>

        <div>
           <h2 className="text-[11px] uppercase tracking-wider text-[#94a3b8] font-bold mb-4 border-b border-[#e0e6ed] pb-2">Bank Account Details</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-xs font-semibold text-[#475569] mb-1.5">Account Holder Name</label>
               <input type="text" name="bankAccountName" value={formData.bankAccountName} onChange={handleChange} required className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]" />
             </div>
             <div>
               <label className="block text-xs font-semibold text-[#475569] mb-1.5">Bank Name</label>
               <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} required className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]" />
             </div>
             <div>
               <label className="block text-xs font-semibold text-[#475569] mb-1.5">BSB Number</label>
               <input type="text" name="bsb" value={formData.bsb} onChange={handleChange} required className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]" />
             </div>
             <div>
               <label className="block text-xs font-semibold text-[#475569] mb-1.5">Account Number</label>
               <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]" />
             </div>
           </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className={`flex items-center px-6 py-2.5 rounded-md font-semibold text-sm transition-colors border ${saved ? 'bg-[#16a34a] border-[#16a34a] text-white' : 'bg-[#2563eb] border-[#2563eb] text-white hover:bg-[#1d4ed8]'}`}>
            {saved ? <><Check className="w-4 h-4 mr-2" /> Saved</> : <><Save className="w-4 h-4 mr-2" /> Save Details</>}
          </button>
        </div>
      </form>

      <div className="mt-8 bg-white p-6 md:p-8 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-[#e0e6ed]">
        <h2 className="text-[11px] uppercase tracking-wider text-[#94a3b8] font-bold mb-4 border-b border-[#e0e6ed] pb-2">Services & Pay Rates</h2>
        <p className="text-xs text-[#64748b] mb-4">Add your standard services and hourly rates. These will be available in your timesheets and invoices.</p>
        
        <div className="space-y-3 mb-4 max-h-[250px] overflow-y-auto w-full">
          {services?.map((service) => (
            <div key={service.id} className="flex justify-between items-center p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-md">
              <span className="text-sm font-medium">{service.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#475569] bg-white px-2 py-1 border border-[#e2e8f0] rounded">${service.defaultRate}/hr</span>
                <button type="button" onClick={() => deleteService(service.id)} className="text-[#94a3b8] hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {(!services || services.length === 0) && (
            <div className="text-sm text-center text-[#94a3b8] py-4 bg-[#f8fafc] rounded-md border border-dashed border-[#cbd5e1]">
              No services or rates saved. Add one below to use the timesheet functionality.
            </div>
          )}
        </div>
        <div className="flex gap-2 w-full flex-col sm:flex-row">
          <input 
            type="text" 
            value={newServiceName} 
            onChange={e => setNewServiceName(e.target.value)} 
            placeholder="Service (e.g. Graphic Design)" 
            className="flex-[2] px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]" 
            onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); handleAddService(); } }}
          />
          <input 
            type="number" 
            value={newServiceRate} 
            onChange={e => setNewServiceRate(e.target.value)} 
            placeholder="Min/Hr Rate (e.g. 50)" 
            className="flex-1 px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]" 
            onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); handleAddService(); } }}
          />
          <button type="button" onClick={handleAddService} className="px-4 py-2 bg-[#f1f5f9] text-[#475569] font-medium text-sm rounded-md hover:bg-[#e2e8f0] transition-colors border border-[#e2e8f0] flex items-center justify-center">
            <Plus className="w-4 h-4 mr-1" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
