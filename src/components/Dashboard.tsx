import React from 'react';
import { useInvoiceContext } from '../context/InvoiceContext';
import { Plus, FileText, Trash2, Edit, Eye, Copy } from 'lucide-react';
import { formatCurrency, generateId, generateInvoiceNumber } from '../lib/utils';
import { Invoice } from '../types';

export default function Dashboard({ onNavigate }: { onNavigate: (view: any, id?: string) => void }) {
  const { invoices, deleteInvoice, addInvoice, clients } = useInvoiceContext();

  const handleDuplicate = (invoice: Invoice) => {
    const duplicate = {
      ...invoice,
      id: generateId(),
      invoiceNumber: generateInvoiceNumber(invoices.length),
      invoiceDate: new Date().toISOString().split('T')[0],
      status: 'Draft' as const,
    };
    addInvoice(duplicate);
    onNavigate('invoice-edit', duplicate.id);
  };

  const calculateTotal = (invoice: Invoice) => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    return invoice.hasGst ? subtotal * 1.1 : subtotal;
  };

  const getClientName = (id: string) => {
    const client = clients.find(c => c.id === id);
    return client ? client.companyName : 'Unknown Client';
  };

  return (
    <div className="space-y-6 text-[#333]">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-[#1e293b]">Invoices</h1>
        <button
          onClick={() => onNavigate('invoice-edit', 'new')}
          className="flex items-center bg-[#2563eb] hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors border border-[#2563eb]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-[#e0e6ed] p-12 text-center">
          <div className="w-16 h-16 bg-[#f4f7f9] text-[#64748b] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e2e8f0]">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#1e293b] mb-2">No invoices yet</h3>
          <p className="text-[#64748b] mb-6">Create your first professional invoice in seconds.</p>
          <button
            onClick={() => onNavigate('invoice-edit', 'new')}
            className="inline-flex items-center text-[#2563eb] font-semibold hover:underline"
          >
            <Plus className="w-4 h-4 mr-1" /> Create one now
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-[#e0e6ed] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e0e6ed]">
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#64748b]">Invoice</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#64748b]">Client</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#64748b]">Date</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#64748b]">Amount</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#64748b]">Status</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#64748b] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e6ed]">
                {invoices.slice().reverse().map(invoice => (
                  <tr key={invoice.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#1e293b] text-sm">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-[#475569] text-sm font-medium">
                      {invoice.clientSnapshot ? invoice.clientSnapshot.companyName : getClientName(invoice.clientId)}
                    </td>
                    <td className="px-6 py-4 text-[#475569] text-sm">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1e293b] text-sm">
                      {formatCurrency(calculateTotal(invoice))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${
                        invoice.status === 'Paid' ? 'bg-[#dcfce7] text-[#166534]' :
                        invoice.status === 'Sent' ? 'bg-[#dbeafe] text-[#1e40af]' :
                        invoice.status === 'Unpaid' ? 'bg-[#fee2e2] text-[#991b1b]' :
                        'bg-[#f1f5f9] text-[#475569]'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => onNavigate('invoice-preview', invoice.id)} className="p-1.5 text-[#64748b] hover:text-[#2563eb] rounded bg-white hover:bg-[#eff6ff] transition-colors border border-transparent hover:border-[#bfdbfe]" title="View/Preview">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => onNavigate('invoice-edit', invoice.id)} className="p-1.5 text-[#64748b] hover:text-[#2563eb] rounded bg-white hover:bg-[#eff6ff] transition-colors border border-transparent hover:border-[#bfdbfe]" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDuplicate(invoice)} className="p-1.5 text-[#64748b] hover:text-[#16a34a] rounded bg-white hover:bg-[#dcfce7] transition-colors border border-transparent hover:border-[#bbf7d0]" title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if(window.confirm('Delete this invoice?')) deleteInvoice(invoice.id); }} className="p-1.5 text-[#64748b] hover:text-[#ef4444] rounded bg-white hover:bg-[#fee2e2] transition-colors border border-transparent hover:border-[#fecaca]" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
