import React from 'react';
import { 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Plus, 
  ReceiptText,
  Calendar,
  AlertTriangle,
  TrendingDown,
  ChevronRight
} from 'lucide-react';
import { ExpenseRecord, ExpenseSummary, ActiveTab } from '../types/expense';
import { formatCurrency, formatDateDisplay, formatQuantity } from '../utils/formatters';

interface DashboardProps {
  expenses: ExpenseRecord[];
  summary: ExpenseSummary;
  setActiveTab: (tab: ActiveTab) => void;
  onEditExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (expense: ExpenseRecord) => void;
  onExportExcel: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  expenses,
  summary,
  setActiveTab,
  onEditExpense,
  onDeleteExpense,
  onExportExcel,
}) => {
  const paidPercent = summary.totalAmount > 0 
    ? Math.round((summary.totalPaid / summary.totalAmount) * 100) 
    : 100;
  
  const duePercent = summary.totalAmount > 0 
    ? Math.round((summary.totalDue / summary.totalAmount) * 100) 
    : 0;

  // Newest 5 records
  const recentRecords = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome with Quick Action */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Daily Expense Dashboard
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Personal Expense & Purchase Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track daily materials, monitor paid vs due settlements, and export Excel reports anytime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('add-expense')}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-900/40 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={onExportExcel}
            disabled={expenses.length === 0}
            className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              expenses.length === 0
                ? 'bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-white border-slate-700 active:scale-95 cursor-pointer'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Amount Spent */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Spent</span>
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 border border-slate-700/60">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {formatCurrency(summary.totalAmount)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Overall expenditure</span>
            <span className="text-slate-300 font-medium">{summary.totalPurchases} purchases</span>
          </div>
        </div>

        {/* Card 2: Total Paid Amount */}
        <div className="bg-slate-900 border border-emerald-900/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-600/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Total Paid</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
            {formatCurrency(summary.totalPaid)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span className="text-emerald-400/90 font-medium">{paidPercent}% settled</span>
            <span className="text-slate-400">{summary.paidPurchasesCount} orders</span>
          </div>
        </div>

        {/* Card 3: Total Due Amount */}
        <div className="bg-slate-900 border border-amber-900/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-600/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between text-amber-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Total Due</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 border border-amber-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">
            {formatCurrency(summary.totalDue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span className="text-amber-400/90 font-medium">{duePercent}% pending</span>
            <span className="text-slate-400">{summary.duePurchasesCount} pending</span>
          </div>
        </div>

        {/* Card 4: Total Number of Purchases */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Purchases Count</span>
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 border border-slate-700/60">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {summary.totalPurchases}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Transactions logged</span>
            <span className="text-slate-300">Records active</span>
          </div>
        </div>
      </div>

      {/* Progress & Payment Distribution Strip */}
      {summary.totalAmount > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Payment Settlement Progress
            </div>
            <div className="text-xs font-semibold text-slate-400">
              <span className="text-emerald-400">₹{summary.totalPaid.toLocaleString('en-IN')} Paid</span>
              {' • '}
              <span className="text-amber-400">₹{summary.totalDue.toLocaleString('en-IN')} Due</span>
            </div>
          </div>

          {/* Dual Bar */}
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              style={{ width: `${paidPercent}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Paid: ${paidPercent}%`}
            />
            <div
              style={{ width: `${duePercent}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`Due: ${duePercent}%`}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Paid: {paidPercent}% ({summary.paidPurchasesCount} items)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Due: {duePercent}% ({summary.duePurchasesCount} items)
            </span>
          </div>
        </div>
      )}

      {/* Due Alert Notice if there are pending dues */}
      {summary.duePurchasesCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-300">
                You have {summary.duePurchasesCount} pending payment{summary.duePurchasesCount > 1 ? 's' : ''} amounting to {formatCurrency(summary.totalDue)}
              </p>
              <p className="text-xs text-amber-200/70">
                Check Expense History to update payment status when cleared.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex-shrink-0"
          >
            Review Dues
          </button>
        </div>
      )}

      {/* Recent Records Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Recent Purchases</h3>
            <span className="text-xs text-slate-400">
              ({expenses.length} total)
            </span>
          </div>

          {expenses.length > 0 && (
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <span>View All Records</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {expenses.length === 0 ? (
          /* Empty State */
          <div className="py-14 px-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-4 border border-slate-700/60">
              <ShoppingBag className="w-7 h-7 text-emerald-400" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              No Expense Records Yet
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-5">
              Start by recording your daily purchases. Enter the date, product material, quantity, price in Rupees, and payment status.
            </p>
            <button
              onClick={() => setActiveTab('add-expense')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Purchase</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Material / Product</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Price (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Paid By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-200">
                {recentRecords.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {formatDateDisplay(item.date)}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {item.material}
                      {item.notes && (
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {item.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {formatQuantity(item.quantityValue, item.quantityUnit)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-3 px-4">
                      {item.paymentStatus === 'Paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          Due
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {item.paymentStatus === 'Paid' ? (
                        <span className="inline-flex items-center gap-1 text-slate-200">
                          {item.paidBy || 'Self'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unpaid</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditExpense(item)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit record"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteExpense(item)}
                          className="px-2.5 py-1 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete record"
                        >
                          Delete
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
    </div>
  );
};
