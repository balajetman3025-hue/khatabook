import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Trash2, 
  AlertTriangle, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  Search,
  Database,
  Calendar,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { ExpenseRecord, ExpenseSummary } from '../types/expense';
import { formatCurrency, formatDateDisplay, formatQuantity } from '../utils/formatters';

interface ManageRecordsProps {
  expenses: ExpenseRecord[];
  summary: ExpenseSummary;
  onDeleteRecord: (expense: ExpenseRecord) => void;
  onClearAllRecords: () => void;
  onRestoreBackup: (records: ExpenseRecord[]) => void;
  onExportExcel: () => void;
}

export const ManageRecords: React.FC<ManageRecordsProps> = ({
  expenses,
  summary,
  onDeleteRecord,
  onClearAllRecords,
  onRestoreBackup,
  onExportExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Two-step clear all confirmation state
  const [clearStep, setClearStep] = useState<0 | 1 | 2>(0);
  const [confirmInput, setConfirmInput] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Filtered for deletion table
  const filtered = expenses.filter((item) =>
    item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.paidBy && item.paidBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // JSON Backup Export
  const handleExportJsonBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(expenses, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Expense_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // JSON Backup Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onRestoreBackup(parsed);
          setImportStatus(`Successfully restored ${parsed.length} records!`);
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus('Invalid backup format: Expected an array of records.');
        }
      } catch (err) {
        setImportStatus('Error reading JSON backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleStep1Confirm = () => {
    setClearStep(2);
    setConfirmInput('');
  };

  const handleFinalClear = () => {
    onClearAllRecords();
    setClearStep(0);
    setConfirmInput('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-400" />
          Manage Records & Database Operations
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review, selectively delete individual entries, perform database resets, or create safety backups.
        </p>
      </div>

      {/* Notification Toast */}
      {importStatus && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Two-step Clear Confirmation Modal Overlay */}
      {clearStep > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            {/* Step 1 Dialog */}
            {clearStep === 1 && (
              <>
                <div className="flex items-center gap-3 text-amber-400">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Clear All Records? (Step 1 of 2)
                    </h3>
                    <p className="text-xs text-slate-400">First confirmation check</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <p>
                    Are you sure you want to permanently clear all{' '}
                    <strong className="text-white">{expenses.length} expense records</strong>?
                  </p>
                  <p className="text-amber-400">
                    Total amount worth {formatCurrency(summary.totalAmount)} will be removed from your browser storage.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setClearStep(0)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStep1Confirm}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md"
                  >
                    Yes, Proceed to Step 2
                  </button>
                </div>
              </>
            )}

            {/* Step 2 Dialog */}
            {clearStep === 2 && (
              <>
                <div className="flex items-center gap-3 text-red-400">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Final Security Confirmation (Step 2 of 2)
                    </h3>
                    <p className="text-xs text-red-400/90 font-medium">Permanent and Irreversible</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200 space-y-2">
                  <p className="font-semibold">
                    Warning: All data will be completely deleted!
                  </p>
                  <p>
                    Your dashboard, history, and Excel export totals will be reset to zero immediately.
                  </p>
                  <p className="text-slate-300 pt-1">
                    To confirm, please type <strong className="text-white bg-slate-900 px-1.5 py-0.5 rounded font-mono">DELETE</strong> below:
                  </p>
                  <input
                    type="text"
                    placeholder="Type DELETE"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-red-500/50 text-white font-mono text-xs focus:outline-none focus:border-red-400"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setClearStep(0);
                      setConfirmInput('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    Cancel / Keep Data
                  </button>
                  <button
                    onClick={handleFinalClear}
                    disabled={confirmInput !== 'DELETE'}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      confirmInput === 'DELETE'
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50 cursor-pointer'
                        : 'bg-red-950 text-red-400/50 cursor-not-allowed border border-red-900/30'
                    }`}
                  >
                    PERMANENTLY CLEAR ALL
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Danger Zone: Clear All Records */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/20 border border-red-900/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Clear All Expense Records
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Permanently wipes all {expenses.length} records from this browser&apos;s LocalStorage. Protected by a mandatory 2-step confirmation popup.
              </p>
            </div>
          </div>

          <button
            onClick={() => setClearStep(1)}
            disabled={expenses.length === 0}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all flex-shrink-0 cursor-pointer ${
              expenses.length === 0
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50'
                : 'bg-red-600/90 hover:bg-red-600 text-white shadow-lg shadow-red-900/30 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Records</span>
          </button>
        </div>
      </div>

      {/* Backup & Restore Utility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backup */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export JSON Safety Backup</span>
          </div>
          <p className="text-xs text-slate-400">
            Download an offline JSON file of all your expense records for safeguarding or moving to another computer.
          </p>
          <button
            onClick={handleExportJsonBackup}
            disabled={expenses.length === 0}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON Backup ({expenses.length} items)</span>
          </button>
        </div>

        {/* Restore */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Upload className="w-4 h-4 text-teal-400" />
            <span>Restore From JSON Backup</span>
          </div>
          <p className="text-xs text-slate-400">
            Import a previously exported JSON backup to recover your transactions into LocalStorage.
          </p>
          <label className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Select JSON File to Restore</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Individual Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-3">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Individual Record Deletion</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Delete specific entries one-by-one with immediate confirmation.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            {expenses.length === 0
              ? 'No records currently in storage.'
              : 'No records matched your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Material / Product</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Price (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Delete Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {formatDateDisplay(item.date)}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {item.material}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {formatQuantity(item.quantityValue, item.quantityUnit)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.paymentStatus === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}
                      >
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteRecord(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
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
