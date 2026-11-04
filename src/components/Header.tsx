import React from 'react';
import { Menu, Plus, FileSpreadsheet, Calendar, IndianRupee } from 'lucide-react';
import { ActiveTab, ExpenseSummary } from '../types/expense';
import { formatDateDisplay, getTodayISO } from '../utils/formatters';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMobileMenu: () => void;
  onQuickExport: () => void;
  summary: ExpenseSummary;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  onQuickExport,
  summary,
}) => {
  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return {
          title: 'Financial Overview',
          subtitle: 'Monitor your daily purchases, paid balances, and pending dues',
        };
      case 'add-expense':
        return {
          title: 'Record New Expense',
          subtitle: 'Log product purchases with quantity, pricing, and payment status',
        };
      case 'history':
        return {
          title: 'Expense History',
          subtitle: 'View, filter, edit, and search through all recorded transactions',
        };
      case 'reports':
        return {
          title: 'Reports & Export',
          subtitle: 'Generate professional Excel spreadsheets and financial summaries',
        };
      case 'manage':
        return {
          title: 'Manage Records',
          subtitle: 'Individual item cleanup, database reset, and data backups',
        };
    }
  };

  const { title, subtitle } = getTabTitle(activeTab);
  const todayStr = formatDateDisplay(getTodayISO());

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              {title}
            </h2>
            <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Date Pill & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Today: <strong className="text-white font-semibold">{todayStr}</strong></span>
          </div>

          {activeTab !== 'add-expense' && (
            <button
              onClick={() => setActiveTab('add-expense')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}

          {summary.totalPurchases > 0 && activeTab !== 'reports' && (
            <button
              onClick={onQuickExport}
              title="Download Excel Report"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:text-white active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Export Excel</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
