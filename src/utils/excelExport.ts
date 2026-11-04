import * as XLSX from 'xlsx';
import { ExpenseRecord } from '../types/expense';
import { formatDateDisplay, formatQuantity } from './formatters';
import { calculateSummary } from './storage';

export function exportExpensesToExcel(
  expenses: ExpenseRecord[],
  filename: string = 'My_Expense_Report.xlsx'
): boolean {
  try {
    const summary = calculateSummary(expenses);
    const wb = XLSX.utils.book_new();

    // ----------------------------------------------------
    // Sheet 1: Expense Records
    // ----------------------------------------------------
    const recordsData: any[][] = [];

    // Header Title
    recordsData.push(['DAILY EXPENSE MANAGEMENT REPORT']);
    recordsData.push([`Generated On: ${new Date().toLocaleString('en-IN')}`]);
    recordsData.push([`Total Records: ${expenses.length}`]);
    recordsData.push([]); // Empty row

    // Table Column Headers
    recordsData.push([
      'S.No',
      'Date (DD-MM-YYYY)',
      'Material / Product',
      'Weight / Quantity',
      'Price (₹)',
      'Payment Status',
      'Paid By',
      'Notes'
    ]);

    // Sort newest first
    const sorted = [...expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sorted.forEach((exp, idx) => {
      recordsData.push([
        idx + 1,
        formatDateDisplay(exp.date),
        exp.material,
        formatQuantity(exp.quantityValue, exp.quantityUnit),
        Number(exp.price) || 0,
        exp.paymentStatus,
        exp.paymentStatus === 'Paid' ? (exp.paidBy || 'Self') : 'Due (Unpaid)',
        exp.notes || ''
      ]);
    });

    // Total Row
    recordsData.push([]);
    recordsData.push([
      '',
      '',
      'TOTAL EXPENSES',
      '',
      summary.totalAmount,
      `Paid: ₹${summary.totalPaid} | Due: ₹${summary.totalDue}`,
      '',
      ''
    ]);

    const wsRecords = XLSX.utils.aoa_to_sheet(recordsData);

    // Column widths for readability in Excel
    wsRecords['!cols'] = [
      { wch: 8 },  // S.No
      { wch: 18 }, // Date
      { wch: 28 }, // Material
      { wch: 20 }, // Quantity
      { wch: 15 }, // Price
      { wch: 16 }, // Status
      { wch: 22 }, // Paid By
      { wch: 30 }, // Notes
    ];

    XLSX.utils.book_append_sheet(wb, wsRecords, 'Expense Records');

    // ----------------------------------------------------
    // Sheet 2: Summary Dashboard
    // ----------------------------------------------------
    const summaryData: any[][] = [
      ['EXPENSE SUMMARY DASHBOARD'],
      [`Report As Of: ${new Date().toLocaleDateString('en-IN')}`],
      [],
      ['Metric', 'Value', 'Details'],
      ['Total Amount Spent', summary.totalAmount, 'Total purchase expenditure in INR (₹)'],
      ['Total Paid Amount', summary.totalPaid, 'Amount cleared and settled'],
      ['Total Due Amount', summary.totalDue, 'Amount remaining to be cleared'],
      ['Total Number of Purchases', summary.totalPurchases, 'All purchase transactions'],
      ['Paid Transactions Count', summary.paidPurchasesCount, 'Completed payments'],
      ['Due Transactions Count', summary.duePurchasesCount, 'Pending payments'],
      [
        'Settlement Rate',
        summary.totalAmount > 0
          ? `${((summary.totalPaid / summary.totalAmount) * 100).toFixed(1)}%`
          : '100%',
        'Percentage of expenses cleared'
      ],
      [],
      ['PAYMENT STATUS BREAKDOWN'],
      ['Status', 'Count', 'Amount (₹)', 'Percentage'],
      [
        'Paid',
        summary.paidPurchasesCount,
        summary.totalPaid,
        summary.totalAmount > 0
          ? `${((summary.totalPaid / summary.totalAmount) * 100).toFixed(1)}%`
          : '0%'
      ],
      [
        'Due',
        summary.duePurchasesCount,
        summary.totalDue,
        summary.totalAmount > 0
          ? `${((summary.totalDue / summary.totalAmount) * 100).toFixed(1)}%`
          : '0%'
      ]
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [
      { wch: 30 },
      { wch: 18 },
      { wch: 40 }
    ];

    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary Dashboard');

    // Trigger download
    XLSX.writeFile(wb, filename);
    return true;
  } catch (error) {
    console.error('Failed to export Excel report:', error);
    return false;
  }
}
