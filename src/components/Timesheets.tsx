import React, { useState, useMemo } from 'react';
import { useInvoiceContext } from '../context/InvoiceContext';
import { Plus, Trash2, Calendar, Clock, Briefcase, Settings as SettingsIcon, Check } from 'lucide-react';

export default function Timesheets() {
  const { clients, services, addService, timesheets, addTimesheet, deleteTimesheet } = useInvoiceContext();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  
  // New entry state
  const [entryMode, setEntryMode] = useState<'single' | 'range'>('single');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [serviceId, setServiceId] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Inline Quick-Add Service state
  const [isAddingService, setIsAddingService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceRate, setNewServiceRate] = useState('');

  const activeClientTimesheets = useMemo(() => {
    return timesheets
      .filter(t => t.clientId === selectedClientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [timesheets, selectedClientId]);

  // Hours Suggestions from previous 5 entries or entries in last 3 active days
  const hourSuggestions = useMemo(() => {
    const historicalHours = timesheets
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(t => t.hours.toString())
      .filter((val, index, self) => self.indexOf(val) === index);
    return historicalHours.slice(0, 5);
  }, [timesheets]);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !serviceId || !hours) return;

    if (entryMode === 'single') {
      if (!date) return;
      addTimesheet({
        id: Date.now().toString(),
        clientId: selectedClientId,
        serviceId,
        date,
        hours: parseFloat(hours),
        description: description.trim()
      });
    } else {
      if (!startDate || !endDate) return;
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      
      const days: string[] = [];
      let current = new Date(start);
      while (current <= end) {
        days.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }

      days.forEach((dayDate, index) => {
        addTimesheet({
          id: `${Date.now()}-${index}`,
          clientId: selectedClientId,
          serviceId,
          date: dayDate,
          hours: parseFloat(hours),
          description: description.trim()
        });
      });
    }

    // Reset some fields but keep service for faster entry
    setHours('');
    setDescription('');
  };

  const handleQuickAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (newServiceName.trim() && newServiceRate) {
      const id = Date.now().toString();
      addService({
        id,
        name: newServiceName.trim(),
        defaultRate: parseFloat(newServiceRate)
      });
      setServiceId(id); // auto select it
      setIsAddingService(false);
      setNewServiceName('');
      setNewServiceRate('');
    }
  };

  const getServiceName = (id: string) => {
    const service = services.find(s => s.id === id);
    return service ? service.name : 'Unknown Service';
  };

  const getServiceRate = (id: string) => {
    const service = services.find(s => s.id === id);
    return service ? service.defaultRate : 0;
  };

  return (
    <div className="max-w-4xl mx-auto text-[#333]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Timesheets</h1>
          <p className="text-sm text-[#64748b] mt-1">Track your time to auto-fill invoices.</p>
        </div>
        <div className="w-full sm:w-64">
          <label className="block text-xs font-semibold text-[#475569] mb-1.5">Select Client</label>
          <select 
            value={selectedClientId} 
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full px-3 py-2 border border-[#e2e8f0] bg-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633]"
          >
            <option value="">-- Choose a Client --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedClientId && (
        <div className="bg-white p-8 rounded-xl border border-[#e0e6ed] text-center">
          <Calendar className="w-12 h-12 text-[#cbd5e1] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#1e293b] mb-1">Select a client to view timesheets</h3>
          <p className="text-sm text-[#64748b]">Select a client from the dropdown above to add timesheet entries.</p>
        </div>
      )}

      {selectedClientId && (
        <div className="space-y-6">
          {/* Add Entry Form */}
          <div className="bg-white p-5 rounded-xl border border-[#e0e6ed] shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-bold text-[#1e293b] flex items-center">
                  <Plus className="w-4 h-4 mr-2 text-[#2563eb]" /> Log Time
                </h2>
                <div className="flex bg-[#f1f5f9] p-1 rounded-lg">
                  <button 
                    onClick={() => setEntryMode('single')}
                    className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${entryMode === 'single' ? 'bg-white text-[#2563eb] shadow-sm' : 'text-[#64748b] hover:text-[#1e293b]'}`}
                  >
                    Single Date
                  </button>
                  <button 
                    onClick={() => setEntryMode('range')}
                    className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${entryMode === 'range' ? 'bg-white text-[#2563eb] shadow-sm' : 'text-[#64748b] hover:text-[#1e293b]'}`}
                  >
                    Date Range
                  </button>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddingService(!isAddingService)}
                className="text-xs text-[#2563eb] hover:underline flex items-center font-medium"
              >
                <SettingsIcon className="w-3 h-3 mr-1" /> Manage Services
              </button>
            </div>

            {isAddingService && (
              <form onSubmit={handleQuickAddService} className="mb-6 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-md">
                <h3 className="text-xs font-bold text-[#475569] mb-3 uppercase tracking-wider">Quick-Add New Service</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    value={newServiceName} 
                    onChange={e => setNewServiceName(e.target.value)} 
                    placeholder="Service Name" 
                    className="flex-[2] px-3 py-2 border border-[#cbd5e1] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#2563eb]" 
                  />
                  <input 
                    type="number" 
                    value={newServiceRate} 
                    onChange={e => setNewServiceRate(e.target.value)} 
                    placeholder="Rate ($)" 
                    className="flex-1 px-3 py-2 border border-[#cbd5e1] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#2563eb]" 
                  />
                  <button type="submit" className="px-4 py-2 bg-[#1e293b] text-white font-medium text-sm rounded-md hover:bg-[#334155] transition-colors whitespace-nowrap">
                    Add Service
                  </button>
                </div>
              </form>
            )}

            <form onSubmit={handleAddEntry}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
                {entryMode === 'single' ? (
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-[#475569] mb-1">Date</label>
                    <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633]" />
                  </div>
                ) : (
                  <>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-[#475569] mb-1">From</label>
                      <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-2 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633]" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-[#475569] mb-1">To</label>
                      <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-2 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633]" />
                    </div>
                  </>
                )}
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Work Type</label>
                  <select required value={serviceId} onChange={e => setServiceId(e.target.value)} className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633] bg-white">
                    <option value="">-- Select --</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} (${s.defaultRate}/hr)</option>)}
                  </select>
                </div>
                <div className="md:col-span-1 relative">
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Hours</label>
                  <input 
                    type="number" 
                    step="0.25" 
                    min="0" 
                    required 
                    list="hour-suggestions"
                    value={hours} 
                    onChange={e => setHours(e.target.value)} 
                    placeholder="0.00" 
                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633]" 
                  />
                  <datalist id="hour-suggestions">
                    {hourSuggestions.map(val => <option key={val} value={val} />)}
                  </datalist>
                </div>
                <div className={entryMode === 'single' ? 'md:col-span-2' : 'md:col-span-2'}>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Details</label>
                  <div className="flex gap-2">
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Task details..." className="flex-1 px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f633]" />
                    <button type="submit" className="bg-[#2563eb] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#3b82f633] whitespace-nowrap">Save</button>
                  </div>
                </div>
              </div>
              {hourSuggestions.length > 0 && (
                <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[10px] text-[#94a3b8] font-bold uppercase shrink-0">Quick Hours:</span>
                  {hourSuggestions.map(h => (
                    <button 
                      key={h}
                      type="button" 
                      onClick={() => setHours(h)}
                      className={`text-xs px-2 py-0.5 rounded-full border transition-all ${hours === h ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#2563eb] hover:text-[#2563eb]'}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
              {services.length === 0 && (
                <p className="text-xs text-amber-600 mt-3 font-medium">Warning: No services found. Click 'Manage Services' to get started.</p>
              )}
            </form>
          </div>

          {/* Timesheet List */}
          <div className="bg-white rounded-xl border border-[#e0e6ed] shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e0e6ed] bg-[#f8fafc] flex justify-between items-center">
              <h2 className="text-sm font-bold text-[#1e293b]">Logged Entries</h2>
              <div className="text-xs font-semibold text-[#64748b]">
                Total for client: <span className="text-[#1e293b] font-bold">
                  {activeClientTimesheets.reduce((sum, t) => sum + t.hours, 0)} hours
                </span>
              </div>
            </div>
            
            {activeClientTimesheets.length === 0 ? (
              <div className="p-12 text-center text-[#64748b]">
                <Clock className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
                <p className="text-sm font-medium">No time logged for this client yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#e0e6ed]">
                {activeClientTimesheets.map(entry => (
                  <div key={entry.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-[#f8fafc] transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="inline-flex items-center text-xs font-bold bg-[#f1f5f9] text-[#475569] px-2 py-0.5 rounded-md border border-[#e2e8f0]">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        <span className="inline-flex items-center text-xs font-bold bg-[#eff6ff] text-[#1e40af] px-2 py-0.5 rounded-md border border-[#dbeafe]">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {getServiceName(entry.serviceId)}
                        </span>
                      </div>
                      {entry.description && <p className="text-sm text-[#475569] mt-2 font-medium">{entry.description}</p>}
                    </div>
                    
                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 pl-0 sm:pl-6 sm:border-l border-[#e0e6ed]">
                      <div className="text-center min-w-[60px]">
                        <div className="text-lg font-bold text-[#1e293b]">{entry.hours}</div>
                        <div className="text-[10px] uppercase font-bold text-[#94a3b8] tracking-wider text-center">Hrs</div>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <div className="text-lg font-bold text-[#16a34a]">${(entry.hours * getServiceRate(entry.serviceId)).toFixed(2)}</div>
                        <div className="text-[10px] uppercase font-bold text-[#94a3b8] tracking-wider">Amount</div>
                      </div>
                      <button onClick={() => deleteTimesheet(entry.id)} className="p-2 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
