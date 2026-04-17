import React, { useRef, useState } from 'react';
import { useInvoiceContext } from '../context/InvoiceContext';
import { Printer, Download, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import InvoiceDocument from './InvoiceDocument';

export default function InvoicePreview({ invoiceId, onNavigate }: { invoiceId: string | null, onNavigate: (view: any, id?: string) => void }) {
  const { invoices, settings, clients, updateInvoice } = useInvoiceContext();
  const invoice = invoices.find(i => i.id === invoiceId);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!invoice) {
    return <div className="p-8 text-center">Invoice not found.</div>;
  }

  const currentClient = invoice.clientSnapshot || clients.find(c => c.id === invoice.clientId);

  const handlePrint = () => {
    markAsSent();
    window.print();
  };

  const markAsSent = () => {
    if (invoice.status === 'Draft') {
      updateInvoice({ ...invoice, status: 'Sent' });
    }
  };

  const handleEmail = () => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const gstAmount = invoice.hasGst ? subtotal * 0.1 : 0;
    const total = subtotal + gstAmount;

    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from ${settings.fullName}`);
    const body = encodeURIComponent(`Hi ${currentClient?.companyName || 'there'},\n\nPlease find attached the invoice ${invoice.invoiceNumber} for ${formatCurrency(total)}.\n\nThank you for your business.\n\nRegards,\n${settings.fullName}`);
    window.open(`mailto:${currentClient?.email || ''}?subject=${subject}&body=${body}`, '_blank');
    markAsSent();
  };

  const handleStatusChange = (status: 'Draft' | 'Sent' | 'Paid' | 'Unpaid') => {
    updateInvoice({ ...invoice, status });
  };

  return (
    <div className="flex flex-col h-full md:h-[calc(100vh-4rem)] -m-4 md:-m-8 bg-[#f4f7f9] print:m-0 print:h-auto print:bg-white">
      {/* Top Bar */}
      <div className="bg-white border-b border-[#e0e6ed] px-6 h-16 flex items-center justify-between shrink-0 print:hidden shadow-sm z-10 relative">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="text-gray-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg text-slate-800">{invoice.invoiceNumber}</h2>
            <select 
              value={invoice.status} 
              onChange={e => handleStatusChange(e.target.value as any)}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/30 transition-shadow ${
                 invoice.status === 'Paid' ? 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]' :
                 invoice.status === 'Sent' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                 invoice.status === 'Unpaid' ? 'bg-red-50 text-red-800 border-red-200' :
                 'bg-gray-100 text-gray-800 border-gray-200'
              }`}
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 md:gap-3">
          <button onClick={() => onNavigate('invoice-edit', invoice.id)} className="px-3 py-2 md:px-4 rounded-lg text-sm font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center transition-all shadow-sm">
            Edit
          </button>
          <button onClick={handlePrint} className="px-3 py-2 md:px-4 rounded-lg text-sm font-semibold border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center transition-all">
            <Printer className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Print / PDF</span>
          </button>
          <button onClick={handleEmail} className="px-3 py-2 md:px-4 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center transition-all shadow-sm">
            <Mail className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Email Invoice</span>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center print:p-0 print:overflow-visible">
         <div className="relative print:w-full max-w-[210mm] w-full shadow-2xl rounded-sm print:shadow-none print:rounded-none">
            {/* Status Badge overlay (hidden on print) */}
            <div className={`absolute top-8 right-12 z-10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm print:hidden ${
              invoice.status === 'Paid' ? 'bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]' :
              invoice.status === 'Sent' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
              invoice.status === 'Unpaid' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {invoice.status}
            </div>

            <div ref={invoiceRef} className="w-full h-full">
              <InvoiceDocument invoice={invoice} settings={settings} client={currentClient} />
            </div>
         </div>
      </div>
    </div>
  );
}

