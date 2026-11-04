import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { ExpenseRecord } from '../types/expense';
import { formatCurrency, formatDateDisplay, formatQuantity } from '../utils/formatters';

interface DeleteConfirmModalProps {
  record: ExpenseRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  record,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Delete Expense Record?
            </h3>
            <p className="text-xs text-slate-400">
              Please confirm before permanently deleting this entry.
            </p>
          </div>
        </div>

        {/* Record Details Card */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Date:</span>
            <span className="font-mono text-slate-200">
              {formatDateDisplay(record.date)}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Material:</span>
            <span className="font-semibold text-white">
              {record.material}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Quantity:</span>
            <span className="text-slate-200">
              {formatQuantity(record.quantityValue, record.quantityUnit)}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Price:</span>
            <span className="font-bold text-emerald-400 text-sm">
              {formatCurrency(record.price)}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Payment Status:</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                record.paymentStatus === 'Paid'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
              }`}
            >
              {record.paymentStatus}
              {record.paymentStatus === 'Paid' && record.paidBy && ` (${record.paidBy})`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Yes, Delete Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};
