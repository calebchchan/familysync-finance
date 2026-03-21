import { useMemo, useState } from 'react';
import { isSameMonth, parseISO } from 'date-fns';
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

  const visibleTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const inMonth = isSameMonth(parseISO(t.date), selectedMonth);
      if (!inMonth) return false;
      if (t.poolId) return true;
      return t.userId === currentUser;
    });
  }, [transactions, currentUser, selectedMonth]);

  const summary = useMemo(() => {
    const userTxs = visibleTransactions.filter((t) => t.userId === currentUser);
    const personalIncome = userTxs
      .filter((t) => t.type === 'income' && !t.poolId)
      .reduce((s, t) => s + t.amount, 0);
    const personalExpense = userTxs
      .filter((t) => t.type === 'expense' && !t.poolId)
      .reduce((s, t) => s + t.amount, 0);

    return { personalIncome, personalExpense };
  }, [visibleTransactions, currentUser]);

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
  const getAccountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? '';
  const getPoolName = (id: string) => pools.find((p) => p.id === id)?.name ?? '';

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="pb-4">
      {/* Month navigation */}
      <div className="mb-4">
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {/* Summary row */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-dark-muted">Deposit</p>
            <p className="text-sm font-bold text-blue-400">{fmtMoney(summary.personalIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-dark-muted">Withdrawal</p>
            <p className="text-sm font-bold text-red-400">{fmtMoney(summary.personalExpense)}</p>
          </div>
          <div>
            <p className="text-xs text-dark-muted">Total</p>
            <p className={`text-sm font-bold ${summary.personalIncome - summary.personalExpense >= 0 ? 'text-dark-text' : 'text-red-400'}`}>
              {fmtMoney(summary.personalIncome - summary.personalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction feed */}
      {grouped.length === 0 && (
        <div className="text-center py-12 text-dark-muted text-sm">No transactions this month</div>
      )}
      {grouped.map(([date, txs]) => {
        const d = parseISO(date);
        const dayNum = d.getDate().toString().padStart(2, '0');
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
        const dayIncome = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const dayExpense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        return (
          <div key={date} className="mb-1">
            {/* Day header */}
            <div className="flex items-center justify-between py-2.5 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-dark-text">{dayNum}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  dayName === 'Sun' || dayName === 'Sat'
                    ? 'bg-red-600 text-white'
                    : 'bg-dark-surface text-dark-muted'
                }`}>
                  {dayName}
                </span>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-blue-400">{fmtMoney(dayIncome)}</span>
                <span className="text-red-400">{fmtMoney(dayExpense)}</span>
              </div>
            </div>
            {/* Transactions */}
            {txs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setEditingTx(t); setShowForm(true); }}
                className="w-full flex items-center gap-3 px-2 py-3 text-left hover:bg-dark-surface/50 transition-colors border-b border-dark-border/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-muted">{getCategoryName(t.categoryId)}</span>
                    {t.poolId && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded">
                        JOINT
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-dark-text mt-0.5">
                    {t.description}
                    {t.type === 'transfer' && (
                      <span className="text-dark-muted"> → {getAccountName(t.toAccountId!)}</span>
                    )}
                  </div>
                  <div className="text-xs text-dark-muted mt-0.5">
                    {getAccountName(t.accountId)}
                    {t.poolId && ` · ${getPoolName(t.poolId)}`}
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    t.type === 'income'
                      ? 'text-blue-400'
                      : t.type === 'expense'
                      ? 'text-red-400'
                      : 'text-dark-muted'
                  }`}
                >
                  {fmtMoney(t.amount)}
                </span>
              </button>
            ))}
          </div>
        );
      })}

      {/* FAB */}
      <button
        onClick={() => { setEditingTx(null); setShowForm(true); }}
        className="fixed bottom-20 right-6 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:bg-orange-600 transition-colors z-30"
      >
        +
      </button>

      {showForm && (
        <TransactionForm
          transaction={editingTx}
          onClose={() => { setShowForm(false); setEditingTx(null); }}
        />
      )}
    </div>
  );
}
