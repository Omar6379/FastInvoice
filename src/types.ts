export interface ContractorSettings {
  fullName: string;
  abn: string;
  acn: string;
  address: string;
  mobile: string;
  email: string;
  bankAccountName: string;
  bankName: string;
  bsb: string;
  accountNumber: string;
  presetDescriptions?: string[];
}

export interface Service {
  id: string;
  name: string;
  defaultRate: number;
}

export interface TimesheetEntry {
  id: string;
  clientId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  hours: number;
  description?: string;
}

export interface Client {
  id: string;
  companyName: string;
  email: string;
  contactDetails: string;
}

export interface LineItem {
  id: string;
  description: string;
  startDate?: string;
  endDate?: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string; // Kept for backward compatibility
  servicesSuppliedAt: string;
  clientId: string;
  items: LineItem[];
  hasGst: boolean;
  notes: string;
  paymentTerms: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Unpaid';
  clientSnapshot?: Client;
}
