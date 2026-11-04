import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ShoppingBag, 
  Scale, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  User, 
  Save, 
  X, 
  Sparkles,
  AlertCircle,
  FileText
} from 'lucide-react';
import { ExpenseRecord, PaymentStatus } from '../types/expense';
import { getTodayISO, COMMON_UNITS, formatDateDisplay } from '../utils/formatters';
import { getSavedPayerNames, savePayerName } from '../utils/storage';

interface ExpenseFormProps {
  onSaveExpense: (expense: Omit<ExpenseRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateExpense?: (id: string, updated: Partial<ExpenseRecord>) => void;
  editingExpense: ExpenseRecord | null;
  onCancelEdit?: () => void;
  onViewHistory?: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSaveExpense,
  onUpdateExpense,
  editingExpense,
  onCancelEdit,
  onViewHistory,
}) => {
  // Form State
  const [date, setDate] = useState<string>(getTodayISO());
  const [material, setMaterial] = useState<string>('');
  const [quantityValue, setQuantityValue] = useState<string>('');
  const [quantityUnit, setQuantityUnit] = useState<string>('kg');
  const [customUnit, setCustomUnit] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [paidBy, setPaidBy] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // UI helpers
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    setSavedNames(getSavedPayerNames());
  }, []);

  // When editingExpense changes, populate fields
  useEffect(() => {
    if (editingExpense) {
      setDate(editingExpense.date);
      setMaterial(editingExpense.material);
      setQuantityValue(editingExpense.quantityValue);
      
      if (COMMON_UNITS.includes(editingExpense.quantityUnit)) {
        setQuantityUnit(editingExpense.quantityUnit);
        setCustomUnit('');
      } else {
        setQuantityUnit('other');
        setCustomUnit(editingExpense.quantityUnit);
      }

      setPrice(String(editingExpense.price));
      setPaymentStatus(editingExpense.paymentStatus);
      setPaidBy(editingExpense.paidBy || '');
      setNotes(editingExpense.notes || '');
      setErrors({});
    } else {
      resetForm();
    }
  }, [editingExpense]);

  const resetForm = () => {
    setDate(getTodayISO());
    setMaterial('');
    setQuantityValue('');
    setQuantityUnit('kg');
    setCustomUnit('');
    setPrice('');
    setPaymentStatus('Paid');
    setPaidBy('');
    setNotes('');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!date) {
      newErrors.date = 'Date is required';
    }

    if (!material.trim()) {
      newErrors.material = 'Please enter material/product name';
    }

    if (!quantityValue || isNaN(Number(quantityValue)) || Number(quantityValue) <= 0) {
      newErrors.quantityValue = 'Please enter a valid quantity greater than 0';
    }

    if (quantityUnit === 'other' && !customUnit.trim()) {
      newErrors.customUnit = 'Please specify the custom unit';
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Please enter a valid price in ₹ greater than 0';
    }

    if (paymentStatus === 'Paid' && !paidBy.trim()) {
      newErrors.paidBy = "Please specify who paid for this (e.g., 'Self', 'Cash', or person's name)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const finalUnit = quantityUnit === 'other' ? customUnit.trim() : quantityUnit;
    const finalPrice = parseFloat(price);

    if (paymentStatus === 'Paid' && paidBy.trim()) {
      savePayerName(paidBy.trim());
      setSavedNames(getSavedPayerNames());
    }

    if (editingExpense && onUpdateExpense) {
      onUpdateExpense(editingExpense.id, {
        date,
        material: material.trim(),
        quantityValue: quantityValue.trim(),
        quantityUnit: finalUnit,
        price: finalPrice,
        paymentStatus,
        paidBy: paymentStatus === 'Paid' ? paidBy.trim() : undefined,
        notes: notes.trim() || undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } else {
      onSaveExpense({
        date,
        material: material.trim(),
        quantityValue: quantityValue.trim(),
        quantityUnit: finalUnit,
        price: finalPrice,
        paymentStatus,
        paidBy: paymentStatus === 'Paid' ? paidBy.trim() : undefined,
        notes: notes.trim() || undefined,
      });

      setSaveSuccess(true);
      resetForm();
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const selectExistingPayer = (name: string) => {
    setPaidBy(name);
    if (errors.paidBy) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.paidBy;
        return next;
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Banner when editing */}
      {editingExpense && (
        <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-amber-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Editing Expense Entry</p>
              <p className="text-xs text-amber-200/70">
                You are updating the record for &quot;{editingExpense.material}&quot; from {formatDateDisplay(editingExpense.date)}
              </p>
            </div>
          </div>
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
        </div>
      )}

      {/* Success Notification */}
      {saveSuccess && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="text-sm font-medium">
            {editingExpense ? 'Record updated successfully!' : 'Expense saved successfully to LocalStorage!'}
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Form Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              {editingExpense ? 'Modify Purchase Details' : 'New Expense Entry'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter the exact material, quantity, price in Indian Rupees, and payment state.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Auto-saved Locally
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Date Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                1. Date <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border ${
                    errors.date ? 'border-red-500' : 'border-slate-800'
                  } text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`}
                />
              </div>
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[11px] text-slate-400">
                  Formatted: {formatDateDisplay(date)}
                </span>
                {date !== getTodayISO() && (
                  <button
                    type="button"
                    onClick={() => setDate(getTodayISO())}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    Set to Today
                  </button>
                )}
              </div>
              {errors.date && (
                <p className="text-xs text-red-400 mt-1">{errors.date}</p>
              )}
            </div>

            {/* 2. Material/Product */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                2. Material / Product Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Cement, Milk, Vegetables, Diesel, Rice..."
                value={material}
                onChange={(e) => {
                  setMaterial(e.target.value);
                  if (errors.material) setErrors((prev) => ({ ...prev, material: '' }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border ${
                  errors.material ? 'border-red-500' : 'border-slate-800'
                } text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`}
              />
              {errors.material ? (
                <p className="text-xs text-red-400 mt-1">{errors.material}</p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Specific name of the purchased item or raw material.
                </p>
              )}
            </div>

            {/* 3. Weight / Quantity */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                3. Weight / Quantity <span className="text-emerald-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  min="0.001"
                  placeholder="e.g., 5, 2.5, 10"
                  value={quantityValue}
                  onChange={(e) => {
                    setQuantityValue(e.target.value);
                    if (errors.quantityValue) setErrors((prev) => ({ ...prev, quantityValue: '' }));
                  }}
                  className={`w-1/2 px-4 py-2.5 rounded-xl bg-slate-950 border ${
                    errors.quantityValue ? 'border-red-500' : 'border-slate-800'
                  } text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`}
                />
                
                <select
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  className="w-1/2 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                  <option value="other">Other unit...</option>
                </select>
              </div>

              {quantityUnit === 'other' && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Enter custom unit (e.g. roll, drum, tin)"
                    value={customUnit}
                    onChange={(e) => {
                      setCustomUnit(e.target.value);
                      if (errors.customUnit) setErrors((prev) => ({ ...prev, customUnit: '' }));
                    }}
                    className={`w-full px-3 py-2 rounded-lg bg-slate-950 border ${
                      errors.customUnit ? 'border-red-500' : 'border-slate-800'
                    } text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500`}
                  />
                  {errors.customUnit && (
                    <p className="text-xs text-red-400 mt-1">{errors.customUnit}</p>
                  )}
                </div>
              )}

              {errors.quantityValue && (
                <p className="text-xs text-red-400 mt-1">{errors.quantityValue}</p>
              )}
            </div>

            {/* 4. Price in Indian Rupees */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                4. Total Price (₹ INR) <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400 font-bold">
                  ₹
                </div>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
                  }}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border ${
                    errors.price ? 'border-red-500' : 'border-slate-800'
                  } text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`}
                />
              </div>
              {errors.price ? (
                <p className="text-xs text-red-400 mt-1">{errors.price}</p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Amount in Indian Rupees (₹).
                </p>
              )}
            </div>
          </div>

          {/* 5. Payment Status */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5">
              5. Payment Status <span className="text-emerald-400">*</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setPaymentStatus('Paid');
                  if (!paidBy) setPaidBy('Self');
                }}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-semibold text-sm transition-all border ${
                  paymentStatus === 'Paid'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <CheckCircle2
                  className={`w-5 h-5 ${
                    paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                />
                <span>Paid (Settled)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentStatus('Due');
                }}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-semibold text-sm transition-all border ${
                  paymentStatus === 'Due'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Clock
                  className={`w-5 h-5 ${
                    paymentStatus === 'Due' ? 'text-amber-400' : 'text-slate-500'
                  }`}
                />
                <span>Due (Unpaid)</span>
              </button>
            </div>
          </div>

          {/* 6. Paid By - ONLY VISIBLE WHEN STATUS IS PAID */}
          {paymentStatus === 'Paid' && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  6. Paid By (Payer Name) <span className="text-emerald-400">*</span>
                </label>
                <span className="text-[11px] text-emerald-400">
                  Visible because status is Paid
                </span>
              </div>

              <input
                type="text"
                list="payer-names-list"
                placeholder="Enter person's name or who paid (e.g., Self, Ramesh, Cash, GPay, Card)"
                value={paidBy}
                onChange={(e) => {
                  setPaidBy(e.target.value);
                  if (errors.paidBy) setErrors((prev) => ({ ...prev, paidBy: '' }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border ${
                  errors.paidBy ? 'border-red-500' : 'border-slate-700'
                } text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`}
              />

              <datalist id="payer-names-list">
                <option value="Self" />
                <option value="Cash" />
                <option value="UPI / GPay" />
                <option value="Credit Card" />
                {savedNames.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>

              {errors.paidBy && (
                <p className="text-xs text-red-400">{errors.paidBy}</p>
              )}

              {/* Quick Select Chips */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-400">Quick select payer:</div>
                <div className="flex flex-wrap gap-1.5">
                  {['Self', 'Cash', 'UPI', 'Debit Card', ...savedNames.filter(n => !['Self', 'Cash', 'UPI', 'Debit Card'].includes(n)).slice(0, 5)].map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => selectExistingPayer(name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                        paidBy.toLowerCase() === name.toLowerCase()
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes / Remarks (Optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Optional Remarks / Shop Name
            </label>
            <input
              type="text"
              placeholder="e.g., Shop name, invoice number, or additional note"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Prominent Save / Update Expense Button */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99] cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>{editingExpense ? 'UPDATE EXPENSE' : 'SAVE EXPENSE'}</span>
            </button>

            {editingExpense && onCancelEdit && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="w-full sm:w-auto py-3.5 px-5 rounded-xl font-medium text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                Cancel Edit
              </button>
            )}

            {!editingExpense && onViewHistory && (
              <button
                type="button"
                onClick={onViewHistory}
                className="w-full sm:w-auto py-3.5 px-4 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                View History
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
