export type PaymentStatus = 'Paid' | 'Due';

export interface ExpenseRecord {
  id: string;
  date: string; // YYYY-MM-DD
  material: string;
  quantityValue: string; // e.g., "5", "2.5"
  quantityUnit: string; // e.g., "kg", "grams", "litres", "pieces"
  price: number; // in INR (₹)
  paymentStatus: PaymentStatus;
  paidBy?: string; // required when paymentStatus === 'Paid'
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type ActiveTab = 'dashboard' | 'add-expense' | 'history' | 'reports' | 'manage';

export interface ExpenseFilter {
  searchQuery: string;
  status: 'All' | 'Paid' | 'Due';
  dateFilterType: 'all' | 'today' | 'this_week' | 'this_month' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface ExpenseSummary {
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
  totalPurchases: number;
  paidPurchasesCount: number;
  duePurchasesCount: number;
}
