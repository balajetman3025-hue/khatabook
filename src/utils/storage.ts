import { ExpenseRecord, ExpenseSummary } from '../types/expense';

const STORAGE_KEY = 'daily_expense_manager_records_v1';
const SAVED_NAMES_KEY = 'daily_expense_manager_saved_payers_v1';

export function getStoredExpenses(): ExpenseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('Error reading expenses from localStorage:', error);
    return [];
  }
}

export function saveExpensesToStorage(expenses: ExpenseRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving expenses to localStorage:', error);
  }
}

export function getSavedPayerNames(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_NAMES_KEY);
    const set = new Set<string>();
    
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((name) => {
          if (name && typeof name === 'string' && name.trim()) {
            set.add(name.trim());
          }
        });
      }
    }

    // Also collect from actual records
    const expenses = getStoredExpenses();
    expenses.forEach((exp) => {
      if (exp.paidBy && exp.paidBy.trim()) {
        set.add(exp.paidBy.trim());
      }
    });

    return Array.from(set).sort();
  } catch (error) {
    console.error('Error reading saved payer names:', error);
    return [];
  }
}

export function savePayerName(name: string): void {
  if (!name || !name.trim()) return;
  try {
    const current = getSavedPayerNames();
    const updated = Array.from(new Set([...current, name.trim()])).sort();
    localStorage.setItem(SAVED_NAMES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving payer name:', error);
  }
}

export function calculateSummary(expenses: ExpenseRecord[]): ExpenseSummary {
  let totalAmount = 0;
  let totalPaid = 0;
  let totalDue = 0;
  let paidPurchasesCount = 0;
  let duePurchasesCount = 0;

  for (const exp of expenses) {
    const price = Number(exp.price) || 0;
    totalAmount += price;
    if (exp.paymentStatus === 'Paid') {
      totalPaid += price;
      paidPurchasesCount++;
    } else {
      totalDue += price;
      duePurchasesCount++;
    }
  }

  return {
    totalAmount,
    totalPaid,
    totalDue,
    totalPurchases: expenses.length,
    paidPurchasesCount,
    duePurchasesCount,
  };
}
