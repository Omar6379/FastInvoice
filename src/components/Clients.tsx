import React, { useState } from 'react';
import { useInvoiceContext } from '../context/InvoiceContext';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import { Client } from '../types';
import { generateId } from '../lib/utils';

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useInvoiceContext();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const initialForm: Client = { id: '', companyName: '', email: '', contactDetails: '' };
  const [formData, setFormData] = useState<Client>(initialForm);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData(client);
    setIsAdding(false);
  };

  const handleAddNew = () => {
    setFormData({ ...initialForm, id: generateId() });
    setIsAdding(true);
    setEditingClient(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingClient(null);
    setFormData(initialForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      addClient(formData);
    } else if (editingClient) {
      updateClient(formData);
    }
    handleCancel();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-[#333]">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#1e293b]">Clients</h1>
        {!isAdding && !editingClient && (
          <button onClick={handleAddNew} className="flex items-center bg-[#2563eb] hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors border border-[#2563eb]">
            <Plus className="w-4 h-4 mr-2" /> Add Client
          </button>
        )}
      </div>

      {(isAdding || editingClient) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-[#e0e6ed] p-6">
          <div className="flex justify-between items-center mb-4 border-b border-[#e0e6ed] pb-2">
            <h2 className="text-[11px] uppercase tracking-wider text-[#94a3b8] font-bold">{isAdding ? 'Add New Client' : 'Edit Client'}</h2>
            <button type="button" onClick={handleCancel} className="text-[#64748b] hover:text-[#1e293b]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Company Name</label>
              <input type="text" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} required className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Company Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Contact Details / Address</label>
              <input type="text" value={formData.contactDetails} onChange={e => setFormData({ ...formData, contactDetails: e.target.value })} className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] focus:border-[#3b82f6]" />
            </div>
          </div>
          <div className="flex justify-end">
             <button type="submit" className="flex items-center px-4 py-2 bg-[#2563eb] text-white rounded-md hover:bg-blue-700 font-semibold text-sm transition-colors border border-[#2563eb]">
               <Save className="w-4 h-4 mr-2" /> Save Client
             </button>
          </div>
        </form>
      )}

      {!isAdding && !editingClient && (
        <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-[#e0e6ed] overflow-hidden">
          {clients.length === 0 ? (
            <div className="p-8 text-center text-[#64748b]">
              No clients saved yet. Add your first client to use them in invoices.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e0e6ed]">
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#64748b]">Company Name</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#64748b]">Email</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#64748b]">Contact Details</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#64748b] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e6ed]">
                  {clients.map(client => (
                    <tr key={client.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#1e293b] text-sm">{client.companyName}</td>
                      <td className="px-6 py-4 text-[#475569] text-sm font-medium">{client.email}</td>
                      <td className="px-6 py-4 text-[#475569] text-sm max-w-[200px] truncate">{client.contactDetails}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button onClick={() => handleEdit(client)} className="p-1.5 text-[#64748b] hover:text-[#2563eb] rounded bg-white hover:bg-[#eff6ff] transition-colors border border-transparent hover:border-[#bfdbfe]" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if(window.confirm('Delete this client?')) deleteClient(client.id); }} className="p-1.5 text-[#64748b] hover:text-[#ef4444] rounded bg-white hover:bg-[#fee2e2] transition-colors border border-transparent hover:border-[#fecaca]" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
