/**
 * Formatting utilities for Indian currency and date formats
 */

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0';
  
  // Format with Indian numbering system (e.g., 1,50,000)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  });

  return formatter.format(amount);
}

export function formatCurrencyPlain(amount: number): string {
  if (isNaN(amount)) return '0';
  const formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  });
  return formatter.format(amount);
}

/**
 * Converts YYYY-MM-DD to DD-MM-YYYY
 */
export function formatDateDisplay(isoDateStr: string): string {
  if (!isoDateStr) return '-';
  const parts = isoDateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
  }
  
  const d = new Date(isoDateStr);
  if (isNaN(d.getTime())) return isoDateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Returns today's date in YYYY-MM-DD for native <input type="date" />
 */
export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatQuantity(value: string | number, unit: string): string {
  if (!value && value !== 0) return '-';
  if (!unit) return String(value);
  return `${value} ${unit}`.trim();
}

export const COMMON_UNITS = [
  'kg',
  'grams',
  'litre',
  'ml',
  'pieces',
  'packet',
  'box',
  'bundle',
  'dozen',
  'meter',
  'quintal',
  'bag',
  'units',
];
