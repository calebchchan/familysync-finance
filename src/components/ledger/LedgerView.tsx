import { useMemo, useState } from 'react';
import { format, isSameMonth, parseISO } from 'date-fns';
import { useApp } from '../../context/AppContext';
import MonthPicker from '../shared/MonthPicker';
import TransactionForm from '../transactions/TransactionForm';
import type { Transaction } from '../../types';

export default function LedgerView() {
  const {
    currentUser,
    transactions,
    categories,
    accounts,
    pools,
    selectedMonth,
    setSelectedMonth,
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Visible transactions: own personal + any joint (with poolId)
  const visibleTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const inMonth = isSameMonth(parseISO(t.date), selectedMonth);
      if (!inMonth) return false;
      if (t.poolId) return true; // joint = visible to both
      return t.userId === currentUser; // personal = only owner
    });
  }, [transactions, currentUser, selectedMonth]);

  // Summary calculations
  const summary = useMemo(() => {
    const userTxs = visibleTransactions.filter((t) => t.userId === currentUser);
    const personalIncome = userTxs
      .filter((t) => t.type === 'income' && !t.poolId)
      .reduce((s, t) => s + t.amount, 0);
    const personalExpense = userTxs
      .filter((t) => t.type === 'expense' && !t.poolId)
      .reduce((s, t) => s + t.amount, 0);
    const totalIncome = userTxs
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = userTxs
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    return {
      personalIncome,
      personalExpense,
      netPersonal: personalIncome - personalExpense,
      netTotal: totalIncome - totalExpense,
    };
  }, [visibleTransactions, currentUser]);

  // Group by date
  const grouped = useMemo(() => {
    const sorted = [...visibleTransactions].sort(
      (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
    );
    const groups: Record<string, Transaction[]> = {};
    sorted.forEach((t) => {
      const key = t.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return Object.entries(groups);
  }, [visibleTransactions]);

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '';
  const getCategoryIcon = (id: string) => categories.find((c) => c.id === id)?.icon ?? '📝';
  const getAccountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? '';
  const getPoolName = (id: string) => pools.find((p) => p.id === id)?.name ?? '';

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="pb-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        <button
          onClick={() => { setEditingTx(null); setShowForm(true); }}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-600 text-white text-lg shadow-md hover:bg-indigo-700"
        >
          +
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Personal Income</p>
          <p className="text-lg font-bold text-emerald-600">{fmtMoney(summary.personalIncome)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Personal Expense</p>
          <p className="text-lg font-bold text-red-500">{fmtMoney(summary.personalExpense)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Net Personal</p>
          <p className={`text-lg font-bold ${summary.netPersonal >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {fmtMoney(summary.netPersonal)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Net Total</p>
          <p className={`text-lg font-bold ${summary.netTotal >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {fmtMoney(summary.netTotal)}
          </p>
        </div>
      </div>

      {/* Transaction feed */}
      {grouped.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No transactions this month</div>
      )}
      {grouped.map(([date, txs]) => (
        <div key={date} className="mb-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {format(parseISO(date), 'EEEE, MMM d')}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {txs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setEditingTx(t); setShowForm(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">{getCategoryIcon(t.categoryId)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">{t.description}</span>
                    {t.poolId && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded">
                        JOINT
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {getCategoryName(t.categoryId)}
                    {t.type === 'transfer' ? ` → ${getAccountName(t.toAccountId!)}` : ` · ${getAccountName(t.accountId)}`}
                    {t.poolId && ` · ${getPoolName(t.poolId)}`}
                    {t.userId !== currentUser && (
                      <span className="ml-1 text-gray-300">
                        (by {t.userId === 'husband' ? 'Caleb' : 'Rachel'})
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    t.type === 'income'
                      ? 'text-emerald-600'
                      : t.type === 'expense'
                      ? 'text-red-500'
                      : 'text-gray-500'
                  }`}
                >
                  {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}
                  {fmtMoney(t.amount)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {showForm && (
        <TransactionForm
          transaction={editingTx}
          onClose={() => { setShowForm(false); setEditingTx(null); }}
        />
      )}
    </div>
  );
}
