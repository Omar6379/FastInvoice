import React, { useState } from 'react';
import { InvoiceProvider } from './context/InvoiceContext';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Clients from './components/Clients';
import Timesheets from './components/Timesheets';
import InvoiceEditor from './components/InvoiceEditor';
import InvoicePreview from './components/InvoicePreview';
import { Users, Settings as SettingsIcon, LayoutDashboard, Menu, X, Clock } from 'lucide-react';

type View = 'dashboard' | 'clients' | 'timesheets' | 'settings' | 'invoice-edit' | 'invoice-preview';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // To pass data to views
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);

  const navigate = (view: View, id?: string) => {
    if (id !== undefined) {
      setCurrentInvoiceId(id);
    } else if (['dashboard', 'clients', 'timesheets', 'settings'].includes(view)) {
      setCurrentInvoiceId(null);
    }
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const NavContent = () => (
    <div className="flex flex-col gap-2 p-4">
      <button onClick={() => navigate('dashboard')} className={`flex items-center w-full px-4 py-2 rounded-md text-sm transition-colors ${currentView === 'dashboard' ? 'bg-[#2563eb] text-white font-semibold' : 'text-[#475569] hover:bg-[#f1f5f9] font-medium'}`}>
        <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
      </button>
      <button onClick={() => navigate('clients')} className={`flex items-center w-full px-4 py-2 rounded-md text-sm transition-colors ${currentView === 'clients' ? 'bg-[#2563eb] text-white font-semibold' : 'text-[#475569] hover:bg-[#f1f5f9] font-medium'}`}>
        <Users className="w-4 h-4 mr-3" /> Clients
      </button>
      <button onClick={() => navigate('timesheets')} className={`flex items-center w-full px-4 py-2 rounded-md text-sm transition-colors ${currentView === 'timesheets' ? 'bg-[#2563eb] text-white font-semibold' : 'text-[#475569] hover:bg-[#f1f5f9] font-medium'}`}>
        <Clock className="w-4 h-4 mr-3" /> Timesheets
      </button>
      <button onClick={() => navigate('settings')} className={`flex items-center w-full px-4 py-2 rounded-md text-sm transition-colors ${currentView === 'settings' ? 'bg-[#2563eb] text-white font-semibold' : 'text-[#475569] hover:bg-[#f1f5f9] font-medium'}`}>
        <SettingsIcon className="w-4 h-4 mr-3" /> My Details
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f4f7f9] text-[#333] print:bg-white">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-[#e0e6ed] print:hidden">
        <div className="h-16 flex items-center px-6 border-b border-[#e0e6ed]">
          <div className="w-8 h-8 bg-[#2563eb] rounded-md flex items-center justify-center text-white font-bold text-lg mr-3 shadow-sm">I</div>
          <span className="font-bold text-lg text-[#1e293b]">FastInvoice</span>
        </div>
        <nav className="flex-1 overflow-y-auto mt-2">
          <NavContent />
        </nav>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white shadow-2xl transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden print:hidden flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#e0e6ed]">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#2563eb] rounded-md flex items-center justify-center text-white font-bold text-lg mr-3 shadow-sm">I</div>
            <span className="font-bold text-lg text-[#1e293b]">FastInvoice</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#64748b] hover:text-[#1e293b]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 mt-2">
          <NavContent />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-4 h-14 bg-white border-b border-[#e0e6ed] md:hidden print:hidden shrink-0">
          <div className="flex items-center">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-[#64748b] focus:outline-none hover:text-[#1e293b]">
               <Menu className="w-6 h-6" />
            </button>
            <div className="ml-3 flex items-center">
              <div className="w-6 h-6 bg-[#2563eb] rounded-[4px] flex items-center justify-center text-white font-bold text-xs mr-2 shadow-sm">I</div>
              <h1 className="text-base font-bold text-[#1e293b]">FastInvoice</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto w-full p-4 md:p-8 print:p-0 print:overflow-visible relative">
          {currentView === 'dashboard' && <Dashboard onNavigate={navigate} />}
          {currentView === 'settings' && <Settings />}
          {currentView === 'clients' && <Clients />}
          {currentView === 'timesheets' && <Timesheets />}
          {currentView === 'invoice-edit' && <InvoiceEditor invoiceId={currentInvoiceId} onNavigate={navigate} />}
          {currentView === 'invoice-preview' && <InvoicePreview invoiceId={currentInvoiceId} onNavigate={navigate} />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <InvoiceProvider>
      <AppContent />
    </InvoiceProvider>
  );
}
