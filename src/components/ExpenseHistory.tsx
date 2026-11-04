import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  X, 
  ArrowUpDown,
  ShoppingBag,
  IndianRupee,
  RefreshCw,
  Plus
} from 'lucide-react';
import { ExpenseRecord, PaymentStatus } from '../types/expense';
import { formatCurrency, formatDateDisplay, formatQuantity, getTodayISO } from '../utils/formatters';

interface ExpenseHistoryProps {
  expenses: ExpenseRecord[];
  onEditExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (expense: ExpenseRecord) => void;
  onAddNew: () => void;
  onExportExcel: () => void;
}

type DateFilterMode = 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

export const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({
  expenses,
  onEditExpense,
  onDeleteExpense,
  onAddNew,
  onExportExcel,
}) => {
  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Due'>('All');
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('all');
  const [customDate, setCustomDate] = useState<string>(getTodayISO());
  
  // Sort State: newest first by default
  const [sortField, setSortField] = useState<'date' | 'price' | 'material'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false); // false = newest / highest first

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Filter Logic
  const filteredRecords = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
    startOfWeek.setDate(diff);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return expenses.filter((record) => {
      // 1. Search by material name (and paidBy/notes as fallback)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesMaterial = record.material.toLowerCase().includes(query);
        const matchesPayer = record.paidBy ? record.paidBy.toLowerCase().includes(query) : false;
        const matchesNotes = record.notes ? record.notes.toLowerCase().includes(query) : false;
        if (!matchesMaterial && !matchesPayer && !matchesNotes) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== 'All' && record.paymentStatus !== statusFilter) {
        return false;
      }

      // 3. Date filter
      if (dateFilterMode !== 'all') {
        const recordDate = new Date(record.date + 'T00:00:00');

        if (dateFilterMode === 'today') {
          if (record.date !== getTodayISO()) return false;
        } else if (dateFilterMode === 'yesterday') {
          const yYear = yesterday.getFullYear();
          const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
          const yDay = String(yesterday.getDate()).padStart(2, '0');
          const yesterdayISO = `${yYear}-${yMonth}-${yDay}`;
          if (record.date !== yesterdayISO) return false;
        } else if (dateFilterMode === 'this_week') {
          if (recordDate < startOfWeek) return false;
        } else if (dateFilterMode === 'this_month') {
          if (recordDate < startOfMonth) return false;
        } else if (dateFilterMode === 'custom') {
          if (customDate && record.date !== customDate) return false;
        }
      }

      return true;
    });
  }, [expenses, searchTerm, statusFilter, dateFilterMode, customDate]);

  // Sort logic
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortAsc ? dateA - dateB : dateB - dateA;
      } else if (sortField === 'price') {
        return sortAsc ? a.price - b.price : b.price - a.price;
      } else if (sortField === 'material') {
        return sortAsc 
          ? a.material.localeCompare(b.material)
          : b.material.localeCompare(a.material);
      }
      return 0;
    });
  }, [filteredRecords, sortField, sortAsc]);

  // Dynamic automatic calculation of totals for the filtered results
  const filteredSummary = useMemo(() => {
    let totalAmount = 0;
    let totalPaid = 0;
    let totalDue = 0;

    for (const rec of filteredRecords) {
      const p = Number(rec.price) || 0;
      totalAmount += p;
      if (rec.paymentStatus === 'Paid') {
        totalPaid += p;
      } else {
        totalDue += p;
      }
    }

    return { totalAmount, totalPaid, totalDue, count: filteredRecords.length };
  }, [filteredRecords]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const toggleSort = (field: 'date' | 'price' | 'material') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for new field
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setDateFilterMode('all');
    setCustomDate(getTodayISO());
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    searchTerm.trim() !== '' || 
    statusFilter !== 'All' || 
    dateFilterMode !== 'all';

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            Expense History
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Full ledger of all your material purchases with instant search and status filters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={onExportExcel}
            disabled={expenses.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Search by Material Name */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search material / product..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Payment Statuses</option>
              <option value="Paid">Paid Only (Settled)</option>
              <option value="Due">Due Only (Unpaid)</option>
            </select>
          </div>

          {/* 3. Date Presets Filter */}
          <div>
            <select
              value={dateFilterMode}
              onChange={(e) => {
                setDateFilterMode(e.target.value as DateFilterMode);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today Only</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week (Mon-Sun)</option>
              <option value="this_month">This Month</option>
              <option value="custom">Specific Date Pick...</option>
            </select>
          </div>

          {/* 4. Custom Date Picker or Reset */}
          <div>
            {dateFilterMode === 'custom' ? (
              <div className="relative">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 h-full">
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Filtered Totals Bar - Real-time calculation */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            Showing <strong className="text-white">{filteredRecords.length}</strong> of{' '}
            <strong className="text-white">{expenses.length}</strong> total records
            {hasActiveFilters && (
              <span className="ml-2 text-emerald-400 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Filtered
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              Filtered Total:{' '}
              <strong className="text-white font-bold ml-1">
                {formatCurrency(filteredSummary.totalAmount)}
              </strong>
            </div>

            <div className="px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
              Paid:{' '}
              <strong className="text-emerald-400 font-bold ml-1">
                {formatCurrency(filteredSummary.totalPaid)}
              </strong>
            </div>

            <div className="px-3 py-1 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300">
              Due:{' '}
              <strong className="text-amber-400 font-bold ml-1">
                {formatCurrency(filteredSummary.totalDue)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Expense Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {sortedRecords.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Search className="w-6 h-6 text-slate-500" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              No Matching Expense Records
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mb-4">
              {expenses.length === 0
                ? "You haven't recorded any purchases yet. Click 'Add Expense' to get started."
                : 'No records matched your search query or filter criteria. Try clearing filters.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                onClick={onAddNew}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Add Your First Expense
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950/80 text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    {/* Date Column */}
                    <th 
                      onClick={() => toggleSort('date')}
                      className="py-3 px-4 cursor-pointer hover:text-white select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Date (DD-MM-YYYY)</span>
                        <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === 'date' ? 'text-emerald-400' : 'text-slate-600'}`} />
                      </div>
                    </th>

                    {/* Material Column */}
                    <th 
                      onClick={() => toggleSort('material')}
                      className="py-3 px-4 cursor-pointer hover:text-white select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Material / Product</span>
                        <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === 'material' ? 'text-emerald-400' : 'text-slate-600'}`} />
                      </div>
                    </th>

                    {/* Quantity */}
                    <th className="py-3 px-4">Quantity / Weight</th>

                    {/* Price */}
                    <th 
                      onClick={() => toggleSort('price')}
                      className="py-3 px-4 cursor-pointer hover:text-white select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Price (₹)</span>
                        <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === 'price' ? 'text-emerald-400' : 'text-slate-600'}`} />
                      </div>
                    </th>

                    {/* Status */}
                    <th className="py-3 px-4">Payment Status</th>

                    {/* Paid By */}
                    <th className="py-3 px-4">Paid By</th>

                    {/* Action */}
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {paginatedRecords.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {formatDateDisplay(item.date)}
                      </td>

                      {/* Material */}
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div>{item.material}</div>
                        {item.notes && (
                          <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                            Note: {item.notes}
                          </div>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap font-medium">
                        {formatQuantity(item.quantityValue, item.quantityUnit)}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        {formatCurrency(item.price)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.paymentStatus === 'Paid' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3.5 h-3.5" />
                            Due
                          </span>
                        )}
                      </td>

                      {/* Paid By */}
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {item.paymentStatus === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 text-slate-200 font-medium">
                            {item.paidBy || 'Self'}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">
                            — Due (Unpaid) —
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditExpense(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-colors"
                            title="Edit this purchase"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => onDeleteExpense(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                            title="Delete this purchase"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination & Footer Controls */}
            {totalPages > 1 && (
              <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div>
                  Page <strong className="text-white">{currentPage}</strong> of{' '}
                  <strong className="text-white">{totalPages}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                            currentPage === pageNum
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="text-slate-600">...</span>;
                    }
                    return null;
                  })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
