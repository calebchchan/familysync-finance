import { useMemo, useState } from 'react';
import { isSameMonth, parseISO } from 'date-fns';
import { useApp } from '../../context/AppContext';
import MonthPicker from '../shared/MonthPicker';
import Modal from '../shared/Modal';
import type { Budget, BudgetPeriod } from '../../types';

const periodMultipliers: Record<BudgetPeriod, Record<BudgetPeriod, number>> = {
  weekly: { weekly: 1, monthly: 4.33, quarterly: 13, yearly: 52 },
  monthly: { weekly: 1 / 4.33, monthly: 1, quarterly: 3, yearly: 12 },
  quarterly: { weekly: 1 / 13, monthly: 1 / 3, quarterly: 1, yearly: 4 },
  yearly: { weekly: 1 / 52, monthly: 1 / 12, quarterly: 1 / 4, yearly: 1 },
};

type ViewPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export default function BudgetView() {
  const {
    currentUser,
    budgets,
    transactions,
    categories,
    selectedMonth,
    setSelectedMonth,
  } = useApp();

  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('monthly');
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [showForm, setShowForm] = useState(false);

  const userBudgets = useMemo(
    () => budgets.filter((b) => b.userId === currentUser),
    [budgets, currentUser]
  );

  // Calculate actual spending per category for the selected month
  const actuals = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(
        (t) =>
          t.userId === currentUser &&
          t.type === 'expense' &&
          !t.poolId &&
          isSameMonth(parseISO(t.date), selectedMonth)
      )
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      });
    return map;
  }, [transactions, currentUser, selectedMonth]);

  const scaledLimit = (budget: Budget) => {
    const multiplier = periodMultipliers[budget.period][viewPeriod];
    return budget.limit * multiplier;
  };

  const getCategory = (id: string) => categories.find((c) => c.id === id);
  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const progressColor = (ratio: number) => {
    if (ratio < 0.6) return 'bg-emerald-500';
    if (ratio < 0.85) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4">
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        <button
          onClick={() => { setEditBudget(null); setShowForm(true); }}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-600 text-white text-lg shadow-md hover:bg-indigo-700"
        >
          +
        </button>
      </div>

      {/* Period selector */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        {(['weekly', 'monthly', 'quarterly', 'yearly'] as ViewPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setViewPeriod(p)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
              viewPeriod === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {userBudgets.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No budgets set. Tap + to create one.
        </div>
      )}

      <div className="space-y-3">
        {userBudgets.map((b) => {
          const cat = getCategory(b.categoryId);
          const limit = scaledLimit(b);
          const actual = actuals[b.categoryId] || 0;
          // Scale actual to view period as well (actuals are monthly)
          const scaledActual = actual * periodMultipliers.monthly[viewPeriod];
          const ratio = limit > 0 ? scaledActual / limit : 0;

          return (
            <button
              key={b.id}
              onClick={() => { setEditBudget(b); setShowForm(true); }}
              className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat?.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{cat?.name}</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${ratio > 1 ? 'text-red-500' : 'text-gray-900'}`}>
                    {fmtMoney(scaledActual)}
                  </span>
                  <span className="text-xs text-gray-400"> / {fmtMoney(limit)}</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${progressColor(ratio)}`}
                  style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-gray-400 uppercase">
                  {b.period} limit: {fmtMoney(b.limit)}
                </span>
                <span className={`text-[10px] font-semibold ${ratio > 1 ? 'text-red-500' : ratio > 0.85 ? 'text-amber-500' : 'text-emerald-600'}`}>
                  {ratio > 1 ? `${fmtMoney(scaledActual - limit)} over` : `${fmtMoney(limit - scaledActual)} left`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {showForm && (
        <BudgetForm
          budget={editBudget}
          onClose={() => { setShowForm(false); setEditBudget(null); }}
        />
      )}
    </div>
  );
}

function BudgetForm({ budget, onClose }: { budget: Budget | null; onClose: () => void }) {
  const { currentUser, categories, addBudget, updateBudget, deleteBudget } = useApp();
  const isEdit = !!budget;

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const [categoryId, setCategoryId] = useState(budget?.categoryId ?? '');
  const [limit, setLimit] = useState(budget?.limit?.toString() ?? '');
  const [period, setPeriod] = useState<BudgetPeriod>(budget?.period ?? 'monthly');

  const handleSave = async () => {
    if (!categoryId || !limit) return;
    const data = { userId: currentUser, categoryId, limit: parseFloat(limit), period };
    if (isEdit && budget) {
      await updateBudget({ ...budget, ...data });
    } else {
      await addBudget(data);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (budget) {
      await deleteBudget(budget.id);
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Edit Budget' : 'New Budget'}>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select category</option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Limit</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        {isEdit && (
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
          >
            Delete
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {isEdit ? 'Update' : 'Save'}
        </button>
      </div>
    </Modal>
  );
}
