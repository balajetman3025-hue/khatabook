/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ActiveTab, 
  ExpenseRecord 
} from './types/expense';
import { 
  getStoredExpenses, 
  saveExpensesToStorage, 
  calculateSummary 
} from './utils/storage';
import { exportExpensesToExcel } from './utils/excelExport';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseHistory } from './components/ExpenseHistory';
import { ReportsExport } from './components/ReportsExport';
import { ManageRecords } from './components/ManageRecords';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  // Primary records state stored permanently in browser LocalStorage
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    return getStoredExpenses();
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Edit & Delete modal states
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<ExpenseRecord | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3500);
  };

  // Sync state to LocalStorage whenever expenses changes
  useEffect(() => {
    saveExpensesToStorage(expenses);
  }, [expenses]);

  // Derived financial summary calculated on the fly
  const summary = useMemo(() => {
    return calculateSummary(expenses);
  }, [expenses]);

  // Handler: Add new expense
  const handleSaveExpense = (newExpenseData: Omit<ExpenseRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: ExpenseRecord = {
      ...newExpenseData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setExpenses((prev) => [newRecord, ...prev]);
    showToast(`Saved expense for "${newRecord.material}" (₹${newRecord.price})!`, 'success');
  };

  // Handler: Update existing expense
  const handleUpdateExpense = (id: string, updatedFields: Partial<ExpenseRecord>) => {
    setExpenses((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updatedFields,
              updatedAt: Date.now(),
            }
          : item
      )
    );
    setEditingExpense(null);
    showToast('Expense record updated successfully!', 'success');
  };

  // Handler: Start editing
  const handleStartEdit = (expense: ExpenseRecord) => {
    setEditingExpense(expense);
    setActiveTab('add-expense');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Cancel editing
  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  // Handler: Request delete confirmation
  const handleRequestDelete = (expense: ExpenseRecord) => {
    setRecordToDelete(expense);
  };

  // Handler: Confirm delete
  const handleConfirmDelete = () => {
    if (!recordToDelete) return;
    const materialName = recordToDelete.material;
    setExpenses((prev) => prev.filter((item) => item.id !== recordToDelete.id));
    
    // If the currently edited item was deleted, clear edit mode
    if (editingExpense?.id === recordToDelete.id) {
      setEditingExpense(null);
    }
    
    setRecordToDelete(null);
    showToast(`Deleted "${materialName}" from records.`, 'info');
  };

  // Handler: Clear all records
  const handleClearAllRecords = () => {
    setExpenses([]);
    setEditingExpense(null);
    showToast('All expense records have been wiped from storage.', 'info');
  };

  // Handler: Restore backup
  const handleRestoreBackup = (importedRecords: ExpenseRecord[]) => {
    setExpenses(importedRecords);
    showToast(`Restored ${importedRecords.length} records successfully!`, 'success');
  };

  // Handler: Quick Excel Export
  const handleQuickExport = () => {
    if (expenses.length === 0) {
      showToast('No expense records available to export.', 'info');
      return;
    }
    const success = exportExpensesToExcel(expenses, 'My_Expense_Report.xlsx');
    if (success) {
      showToast('My_Expense_Report.xlsx downloaded successfully!', 'success');
    } else {
      showToast('Could not generate Excel report.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-3 fade-in duration-200">
          <div
            className={`p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border ${
              toast.type === 'success'
                ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-slate-900 border-red-500/40 text-red-300'
                : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              ) : (
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'add-expense') {
            setEditingExpense(null);
          }
        }}
        summary={summary}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/40">
        <Header
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'add-expense') {
              setEditingExpense(null);
            }
          }}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onQuickExport={handleQuickExport}
          summary={summary}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              expenses={expenses}
              summary={summary}
              setActiveTab={setActiveTab}
              onEditExpense={handleStartEdit}
              onDeleteExpense={handleRequestDelete}
              onExportExcel={handleQuickExport}
            />
          )}

          {activeTab === 'add-expense' && (
            <ExpenseForm
              onSaveExpense={handleSaveExpense}
              onUpdateExpense={handleUpdateExpense}
              editingExpense={editingExpense}
              onCancelEdit={handleCancelEdit}
              onViewHistory={() => setActiveTab('history')}
            />
          )}

          {activeTab === 'history' && (
            <ExpenseHistory
              expenses={expenses}
              onEditExpense={handleStartEdit}
              onDeleteExpense={handleRequestDelete}
              onAddNew={() => {
                setEditingExpense(null);
                setActiveTab('add-expense');
              }}
              onExportExcel={handleQuickExport}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsExport
              expenses={expenses}
              summary={summary}
              onAddNew={() => {
                setEditingExpense(null);
                setActiveTab('add-expense');
              }}
            />
          )}

          {activeTab === 'manage' && (
            <ManageRecords
              expenses={expenses}
              summary={summary}
              onDeleteRecord={handleRequestDelete}
              onClearAllRecords={handleClearAllRecords}
              onRestoreBackup={handleRestoreBackup}
              onExportExcel={handleQuickExport}
            />
          )}
        </main>
      </div>

      {/* Delete Record Confirmation Modal */}
      <DeleteConfirmModal
        record={recordToDelete}
        isOpen={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
