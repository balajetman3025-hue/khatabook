import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ReceiptText, 
  FileSpreadsheet, 
  ShieldAlert,
  Wallet,
  X,
  IndianRupee,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { ActiveTab, ExpenseSummary } from '../types/expense';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  summary: ExpenseSummary;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  summary,
  mobileOpen,
  setMobileOpen,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'add-expense' as ActiveTab,
      label: 'Add Expense',
      icon: PlusCircle,
      badge: null,
    },
    {
      id: 'history' as ActiveTab,
      label: 'Expense History',
      icon: ReceiptText,
      badge: summary.totalPurchases > 0 ? summary.totalPurchases : null,
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Reports & Export',
      icon: FileSpreadsheet,
      badge: 'Excel',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'manage' as ActiveTab,
      label: 'Manage Records',
      icon: ShieldAlert,
      badge: summary.duePurchasesCount > 0 ? `${summary.duePurchasesCount} Due` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/10">
              <IndianRupee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-tight">
                Daily Expenses
              </h1>
              <p className="text-xs text-slate-400">Personal Ledger & Tracker</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      item.badgeColor ||
                      (isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Ledger Snapshot Card in Sidebar */}
        <div className="p-4 m-3 bg-slate-900/90 rounded-2xl border border-slate-800/80 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Quick Balance
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Paid:
              </span>
              <span className="font-semibold text-emerald-400">₹{summary.totalPaid.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Due:
              </span>
              <span className="font-semibold text-amber-400">₹{summary.totalDue.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-400">Total Spent:</span>
            <span className="font-bold text-white">₹{summary.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
            LocalStorage Active
          </span>
          <span className="text-slate-400 font-mono">v1.2</span>
        </div>
      </aside>
    </>
  );
};
