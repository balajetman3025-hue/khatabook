import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  ShoppingBag, 
  Calendar,
  Layers,
  ArrowDownToLine,
  FileCheck,
  Table
} from 'lucide-react';
import { ExpenseRecord, ExpenseSummary } from '../types/expense';
import { formatCurrency, formatDateDisplay, getTodayISO } from '../utils/formatters';
import { exportExpensesToExcel } from '../utils/excelExport';

interface ReportsExportProps {
  expenses: ExpenseRecord[];
  summary: ExpenseSummary;
  onAddNew: () => void;
}

export const ReportsExport: React.FC<ReportsExportProps> = ({
  expenses,
  summary,
  onAddNew,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [exportFileName, setExportFileName] = useState<string>('My_Expense_Report.xlsx');

  const handleExport = () => {
    if (expenses.length === 0) return;
    const success = exportExpensesToExcel(expenses, exportFileName.trim() || 'My_Expense_Report.xlsx');
    if (success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }
  };

  // Payer breakdown
  const payerStats = React.useMemo(() => {
    const map: { [payer: string]: { count: number; total: number } } = {};
    expenses.forEach((item) => {
      if (item.paymentStatus === 'Paid') {
        const p = item.paidBy?.trim() || 'Self';
        if (!map[p]) map[p] = { count: 0, total: 0 };
        map[p].count += 1;
        map[p].total += item.price;
      }
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [expenses]);

  // Top materials
  const materialStats = React.useMemo(() => {
    const map: { [material: string]: { count: number; total: number } } = {};
    expenses.forEach((item) => {
      const mat = item.material.trim();
      if (!map[mat]) map[mat] = { count: 0, total: 0 };
      map[mat].count += 1;
      map[mat].total += item.price;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total).slice(0, 5);
  }, [expenses]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
          Financial Reports & Excel Export
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Export your complete expense database into a clean Microsoft Excel (.xlsx) workbook with dedicated summary sheets.
        </p>
      </div>

      {/* Main Download Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Microsoft Excel Compatible (.xlsx)</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              Export All Records to Excel
            </h3>

            <p className="text-xs sm:text-sm text-slate-300">
              Downloads a formatted spreadsheet named{' '}
              <code className="text-emerald-300 font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-500/20">
                {exportFileName}
              </code>{' '}
              containing all your purchases, quantities, prices in Indian Rupees (₹), and a dedicated <strong>Summary Dashboard</strong> worksheet.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Records</span>
                <strong className="text-white text-sm">{expenses.length}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Total Expenses</span>
                <strong className="text-emerald-400 text-sm">{formatCurrency(summary.totalAmount)}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Total Paid</span>
                <strong className="text-emerald-400 text-sm">{formatCurrency(summary.totalPaid)}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Total Due</span>
                <strong className="text-amber-400 text-sm">{formatCurrency(summary.totalDue)}</strong>
              </div>
            </div>
          </div>

          {/* Action Button & Feedback */}
          <div className="w-full lg:w-auto flex flex-col items-center lg:items-end gap-3 flex-shrink-0">
            <button
              onClick={handleExport}
              disabled={expenses.length === 0}
              className={`w-full sm:w-auto px-7 py-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xl ${
                expenses.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <Download className="w-5 h-5" />
              <span>EXPORT TO EXCEL</span>
            </button>

            {downloadSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Downloaded {exportFileName}</span>
              </div>
            )}

            {expenses.length === 0 && (
              <p className="text-xs text-amber-400/80 text-center lg:text-right">
                Please add at least one expense record to enable export.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Excel Sheet Structure Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Worksheet 1 Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
            <Table className="w-4 h-4 text-emerald-400" />
            <span>Worksheet 1: Expense Records</span>
          </div>
          <p className="text-xs text-slate-400">
            Formatted tabular sheet with all purchase rows, matching your form fields:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <li><span className="text-slate-400">Column 1:</span> S.No (Sequential ID)</li>
            <li><span className="text-slate-400">Column 2:</span> Date in standard DD-MM-YYYY</li>
            <li><span className="text-slate-400">Column 3:</span> Material / Product name</li>
            <li><span className="text-slate-400">Column 4:</span> Weight / Quantity with unit</li>
            <li><span className="text-slate-400">Column 5:</span> Price in Indian Rupees (₹)</li>
            <li><span className="text-slate-400">Column 6:</span> Status (Paid / Due)</li>
            <li><span className="text-slate-400">Column 7:</span> Paid By (Payer / Cash / UPI)</li>
            <li><span className="text-slate-400">Bottom Row:</span> Calculated totals formula row</li>
          </ul>
        </div>

        {/* Worksheet 2 Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Worksheet 2: Summary Dashboard</span>
          </div>
          <p className="text-xs text-slate-400">
            Executive financial snapshot worksheet included in the same workbook:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <li><span className="text-slate-400">Total Expenses:</span> {formatCurrency(summary.totalAmount)}</li>
            <li><span className="text-slate-400">Total Paid Amount:</span> {formatCurrency(summary.totalPaid)}</li>
            <li><span className="text-slate-400">Total Due Amount:</span> {formatCurrency(summary.totalDue)}</li>
            <li><span className="text-slate-400">Total Purchases:</span> {summary.totalPurchases} transactions</li>
            <li><span className="text-slate-400">Paid Count:</span> {summary.paidPurchasesCount} orders</li>
            <li><span className="text-slate-400">Due Count:</span> {summary.duePurchasesCount} pending orders</li>
          </ul>
        </div>
      </div>

      {/* Payer Breakdown & Top Materials */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Top Payers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>Paid By Breakdown</span>
              <span className="text-xs text-emerald-400 font-normal">
                {payerStats.length} payer{payerStats.length > 1 ? 's' : ''}
              </span>
            </h4>
            {payerStats.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No paid transactions recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {payerStats.map(([payer, data]) => (
                  <div
                    key={payer}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{payer}</span>
                      <span className="text-slate-400 text-[11px] block">
                        {data.count} transaction{data.count > 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-400">
                      {formatCurrency(data.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Purchased Materials */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>Top Purchased Materials</span>
              <span className="text-xs text-slate-400 font-normal">By total spend</span>
            </h4>
            {materialStats.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No records to display.</p>
            ) : (
              <div className="space-y-2">
                {materialStats.map(([mat, data]) => (
                  <div
                    key={mat}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{mat}</span>
                      <span className="text-slate-400 text-[11px] block">
                        {data.count} purchase{data.count > 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="font-bold text-white">
                      {formatCurrency(data.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
