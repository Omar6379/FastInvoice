import React from 'react';
import { Invoice, ContractorSettings, Client } from '../types';
import { formatCurrency } from '../lib/utils';

interface Props {
  invoice: Invoice;
  settings: ContractorSettings;
  client?: Client;
}

export default function InvoiceDocument({ invoice, settings, client }: Props) {
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const gstAmount = invoice.hasGst ? subtotal * 0.1 : 0;
  const total = subtotal + gstAmount;

  const formatDateShort = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  return (
    <div className="w-full bg-white flex flex-col relative text-slate-800 subpixel-antialiased min-h-[1056px]">
      {/* Top Brand Accent */}
      <div className="h-4 w-full bg-indigo-600 shrink-0"></div>
      
      {/* Document Content */}
      <div className="flex-1 px-12 py-10 flex flex-col">
        
        {/* Header Section */}
        <div className="flex justify-between items-start pb-10 mb-8">
          <div>
            <h1 className="text-5xl font-extrabold tracking-widest text-slate-900 mb-2">INVOICE</h1>
            <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">NO. {invoice.invoiceNumber}</p>
          </div>
          
          <div className="text-right flex flex-col items-end">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{settings.fullName || 'Your Name'}</h2>
            {settings.abn && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 bg-slate-50 px-2 py-0.5 rounded-sm border border-slate-100">
                ABN {settings.abn}
              </p>
            )}
            
            <div className="text-sm font-medium text-right max-w-[260px]">
              {settings.address && (
                <p className="whitespace-pre-wrap leading-relaxed text-slate-500 mb-4">
                  {settings.address}
                </p>
              )}
              
              <div className="flex flex-col gap-1 items-end border-r-2 border-indigo-500 pr-3">
                {settings.mobile && <p className="text-slate-600">{settings.mobile}</p>}
                {settings.email && <p className="text-slate-800">{settings.email}</p>}
                {settings.acn && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ACN {settings.acn}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid - Modern 3 column approach */}
        <div className="grid grid-cols-12 gap-8 mb-12 border-t border-slate-100 pt-10">
          {/* Bill To */}
          <div className="col-span-5 bg-slate-50 rounded-xl p-5 border border-slate-100">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-900/60 mb-3">Bill To</h3>
            {client ? (
              <>
                <p className="font-bold text-slate-900 text-lg">{client.companyName}</p>
                {client.contactDetails && <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{client.contactDetails}</p>}
                {client.email && <p className="text-sm text-slate-600 mt-1">{client.email}</p>}
              </>
            ) : (
              <p className="text-sm text-slate-400 italic">No client selected</p>
            )}
          </div>

          {/* Service Location */}
          <div className="col-span-4 p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Service Location</h3>
            <p className="font-medium text-slate-800 leading-relaxed text-sm">
              {invoice.servicesSuppliedAt || '-'}
            </p>
          </div>

          {/* Dates */}
          <div className="col-span-3 p-5 flex flex-col justify-center">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Date Issued</h3>
              <p className="font-semibold text-slate-800 text-sm">
                {new Date(invoice.invoiceDate).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Minimalist Service Table */}
        <div className="mb-10 flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b-2 border-slate-200">Description</th>
                <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b-2 border-slate-200 text-right w-24">Hrs/Qty</th>
                <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b-2 border-slate-200 text-right w-32">Rate</th>
                <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b-2 border-slate-200 text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.length > 0 ? invoice.items.map(item => {
                const dateRangeStr = item.startDate && item.endDate 
                  ? `(${formatDateShort(item.startDate)} \u2013 ${formatDateShort(item.endDate)})`
                  : item.startDate ? `(${formatDateShort(item.startDate)})` : '';
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-2 text-sm text-slate-800 font-medium">
                      {item.description || '-'} {dateRangeStr && <span className="text-slate-500 whitespace-nowrap ml-1">{dateRangeStr}</span>}
                    </td>
                    <td className="py-5 px-2 text-sm text-slate-600 text-right">{item.quantity}</td>
                    <td className="py-5 px-2 text-sm text-slate-600 text-right">{formatCurrency(item.rate)}</td>
                    <td className="py-5 px-2 text-sm font-bold text-slate-800 text-right">{formatCurrency(item.quantity * item.rate)}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400 italic">No line items</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Area - Totals and Bank Details */}
        <div className="mt-auto border-t border-slate-200 pt-8 flex justify-between items-end gap-12 border-dashed">
          
          {/* Payment block */}
          <div className="flex-1 max-w-md">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>
              Payment Details
            </h3>
            
            <div className="bg-slate-50/80 rounded-lg border border-slate-100 p-5 text-sm">
              <div className="grid grid-cols-[100px_1fr] gap-y-2">
                <span className="text-slate-500">Bank</span>
                <span className="font-semibold text-slate-800">{settings.bankName || '-'}</span>
                
                <span className="text-slate-500">Account</span>
                <span className="font-semibold text-slate-800">{settings.bankAccountName || '-'}</span>
                
                <span className="text-slate-500 mt-2">BSB</span>
                <span className="font-semibold text-slate-800 mt-2">{settings.bsb || '-'}</span>
                
                <span className="text-slate-500">Account No</span>
                <span className="font-semibold text-slate-800">{settings.accountNumber || '-'}</span>
              </div>
            </div>

            {(invoice.notes || invoice.paymentTerms) && (
              <div className="mt-6 text-xs text-slate-500 leading-relaxed max-w-sm">
                {invoice.notes && <p className="mb-2 text-slate-700 font-medium">{invoice.notes}</p>}
                {invoice.paymentTerms && <p className="italic">{invoice.paymentTerms}</p>}
              </div>
            )}
          </div>

          {/* Totals Block */}
          <div className="w-80 shrink-0">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-slate-600 px-6 font-medium">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              {invoice.hasGst && (
                <div className="flex justify-between text-slate-600 px-6 font-medium border-t border-slate-100 pt-3">
                  <span>GST (10%)</span>
                  <span>{formatCurrency(gstAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-lg font-bold text-slate-900 bg-indigo-50 mt-4 p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
                <span className="text-indigo-900">Total Due</span>
                <span className="text-indigo-700">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
