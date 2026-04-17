import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ContractorSettings, Client, Invoice, Service, TimesheetEntry } from '../types';

interface InvoiceContextType {
  settings: ContractorSettings;
  setSettings: (settings: ContractorSettings) => void;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  addService: (service: Service) => void;
  updateService: (service: Service) => void;
  deleteService: (id: string) => void;
  timesheets: TimesheetEntry[];
  setTimesheets: React.Dispatch<React.SetStateAction<TimesheetEntry[]>>;
  addTimesheet: (entry: TimesheetEntry) => void;
  updateTimesheet: (entry: TimesheetEntry) => void;
  deleteTimesheet: (id: string) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const useInvoiceContext = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoiceContext must be used within an InvoiceProvider');
  }
  return context;
};

export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<ContractorSettings>('contractor_settings', {
    fullName: '', abn: '', acn: '', address: '', mobile: '', email: '',
    bankAccountName: '', bankName: '', bsb: '', accountNumber: ''
  });

  const [clients, setClients] = useLocalStorage<Client[]>('contractor_clients', []);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('contractor_invoices', []);
  const [services, setServices] = useLocalStorage<Service[]>('contractor_services', []);
  const [timesheets, setTimesheets] = useLocalStorage<TimesheetEntry[]>('contractor_timesheets', []);

  const addInvoice = (invoice: Invoice) => setInvoices(prev => [...prev, invoice]);
  const updateInvoice = (updated: Invoice) => setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
  const deleteInvoice = (id: string) => setInvoices(prev => prev.filter(inv => inv.id !== id));

  const addClient = (client: Client) => setClients(prev => [...prev, client]);
  const updateClient = (updated: Client) => setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
  const deleteClient = (id: string) => setClients(prev => prev.filter(c => c.id !== id));

  const addService = (service: Service) => setServices(prev => [...prev, service]);
  const updateService = (updated: Service) => setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
  const deleteService = (id: string) => setServices(prev => prev.filter(s => s.id !== id));

  const addTimesheet = (entry: TimesheetEntry) => setTimesheets(prev => [...prev, entry]);
  const updateTimesheet = (updated: TimesheetEntry) => setTimesheets(prev => prev.map(t => t.id === updated.id ? updated : t));
  const deleteTimesheet = (id: string) => setTimesheets(prev => prev.filter(t => t.id !== id));

  return (
    <InvoiceContext.Provider value={{
      settings, setSettings,
      clients, setClients, addClient, updateClient, deleteClient,
      invoices, setInvoices, addInvoice, updateInvoice, deleteInvoice,
      services, setServices, addService, updateService, deleteService,
      timesheets, setTimesheets, addTimesheet, updateTimesheet, deleteTimesheet
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};
