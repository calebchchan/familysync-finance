import { useMemo, useState } from 'react';
import { isSameMonth, parseISO } from 'date-fns';
import { useApp } from '../../context/AppContext';
import MonthPicker from '../shared/MonthPicker';
import Modal from '../shared/Modal';
import type { Budget, BudgetPeriod } from '../../types';

type StatsTab = 'stats' | 'budget' | 'note';
type IncomeExpenseTab = 'income' | 'expense';

export default function BudgetView() {
  const {
    currentUser,
    budgets,
    transactions,
    categories,
    selectedMonth,
    setSelectedMonth,
  } = useApp();

  const [statsTab, setStatsTab] = useState<StatsTab>('budget');
  const [incExpTab, setIncExpTab] = useState<IncomeExpenseTab>('expense');
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const userBudgets = useMemo(
    () => budgets.filter((b) => b.userId === currentUser),
    [budgets, currentUser]
  );

  const monthTransactions = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.userId === currentUser &&
        !t.poolId &&
        isSameMonth(parseISO(t.date), selectedMonth)
    );
  }, [transactions, currentUser, selectedMonth]);

  const totalIncome = useMemo(
    () => monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [monthTransactions]
  );

  const totalExpense = useMemo(
    () => monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [monthTransactions]
  );

  const actuals = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      });
    return map;
  }, [monthTransactions]);

  const totalBudgetLimit = useMemo(
    () => userBudgets.reduce((s, b) => s + b.limit, 0),
    [userBudgets]
  );

  const totalSpent = useMemo(
    () => Object.values(actuals).reduce((s, v) => s + v, 0),
    [actuals]
  );

  const getCategory = (id: string) => categories.find((c) => c.id === id);
  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

  return (
    <div className="pb-4">
      {/* Stats/Budget/Note tabs */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex bg-dark-surface rounded-lg p-1 flex-1">
          {(['stats', 'budget', 'note'] as StatsTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setStatsTab(t)}
              className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                statsTab === t
                  ? 'bg-red-500 text-white'
                  : 'text-dark-muted hover:text-dark-text'
              }`}
            >
              {t === 'budget' ? 'Budget' : t === 'stats' ? 'Stats' : 'Note'}
            </button>
          ))}
        </div>
        <button className="bg-dark-surface text-dark-muted px-3 py-2 rounded-lg text-sm font-medium">
          M
        </button>
      </div>

      {/* Month navigation */}
      <div className="mb-4">
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {/* Income / Expense toggle */}
      <div className="flex border-b border-dark-border mb-4">
        <button
          onClick={() => setIncExpTab('income')}
          className={`flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
            incExpTab === 'income'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-dark-muted'
          }`}
        >
          Income
        </button>
        <button
          onClick={() => setIncExpTab('expense')}
          className={`flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
            incExpTab === 'expense'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-dark-muted'
          }`}
        >
          Exp. {fmtMoney(totalExpense)}
        </button>
      </div>

      {incExpTab === 'expense' && statsTab === 'budget' && (
        <>
          {/* Remaining summary */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-dark-muted">Remaining(Monthly)</p>
              <p className="text-2xl font-bold text-dark-text">
                {fmtMoney(totalBudgetLimit - totalSpent)}
              </p>
            </div>
            <button
              onClick={() => { setEditBudget(null); setShowForm(true); }}
              className="bg-dark-surface text-dark-muted px-4 py-2 rounded-lg text-sm hover:text-dark-text"
            >
              Budget Setting &rsaquo;
            </button>
          </div>

          {/* Overall monthly bar */}
          <div className="border-b border-dark-border pb-4 mb-2">
            <BudgetBar
              label="Monthly"
              limit={totalBudgetLimit}
              spent={totalSpent}
              fmtMoney={fmtMoney}
            />
          </div>

          {/* Per-category budget bars */}
          <div className="divide-y divide-dark-border">
            {userBudgets.map((b) => {
              const cat = getCategory(b.categoryId);
              const actual = actuals[b.categoryId] || 0;

              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedCategoryId(b.categoryId)}
                  className="w-full py-3 text-left hover:bg-dark-surface/50 transition-colors"
                >
                  <BudgetBar
                    label={cat?.name ?? 'Unknown'}
                    limit={b.limit}
                    spent={actual}
                    fmtMoney={fmtMoney}
                  />
                </button>
              );
            })}
          </div>
        </>
      )}

      {incExpTab === 'income' && (
        <div className="text-center py-12">
          <p className="text-dark-muted text-sm">Total Income</p>
          <p className="text-2xl font-bold text-blue-400 mt-2">{fmtMoney(totalIncome)}</p>
        </div>
      )}

      {incExpTab === 'expense' && statsTab === 'stats' && (
        <div className="text-center py-12">
          <p className="text-dark-muted text-sm">Total Expenses</p>
          <p className="text-2xl font-bold text-red-400 mt-2">{fmtMoney(totalExpense)}</p>
          <p className="text-dark-muted text-sm mt-4">Net</p>
          <p className={`text-xl font-bold mt-1 ${totalIncome - totalExpense >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            {fmtMoney(totalIncome - totalExpense)}
          </p>
        </div>
      )}

      {incExpTab === 'expense' && statsTab === 'note' && (
        <div className="text-center py-12 text-dark-muted text-sm">
          Notes coming soon
        </div>
      )}

      {/* Budget category detail */}
      {selectedCategoryId && (
        <BudgetCategoryDetail
          categoryId={selectedCategoryId}
          onClose={() => setSelectedCategoryId(null)}
        />
      )}

      {showForm && (
        <BudgetForm
          budget={editBudget}
          onClose={() => { setShowForm(false); setEditBudget(null); }}
        />
      )}
    </div>
  );
}

function BudgetBar({
  label,
  limit,
  spent,
  fmtMoney,
}: {
  label: string;
  limit: number;
  spent: number;
  fmtMoney: (n: number) => string;
}) {
  const ratio = limit > 0 ? spent / limit : 0;
  const isOver = ratio > 1;
  const pct = Math.round(ratio * 100);
  const remaining = limit - spent;
  const barColor = isOver ? 'bg-bar-red' : 'bg-bar-blue';

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-sm text-dark-muted">{label}</span>
          <br />
          <span className="text-sm font-semibold text-dark-text">{fmtMoney(limit)}</span>
        </div>
        <span className={`text-sm font-bold ${isOver ? 'text-bar-red' : 'text-dark-text'}`}>
          {pct}%
        </span>
      </div>
      <div className="w-full bg-dark-surface rounded-full h-2.5 mb-1">
        <div
          className={`h-2.5 rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className={isOver ? 'text-red-400' : 'text-blue-400'}>{fmtMoney(spent)}</span>
        <span className={isOver ? 'text-red-400' : 'text-dark-text'}>{fmtMoney(remaining)}</span>
      </div>
    </div>
  );
}

function BudgetCategoryDetail({
  categoryId,
  onClose,
}: {
  categoryId: string;
  onClose: () => void;
}) {
  const { transactions, categories, budgets, currentUser, selectedMonth } = useApp();

  const cat = categories.find((c) => c.id === categoryId);
  const budget = budgets.find((b) => b.categoryId === categoryId && b.userId === currentUser);

  const monthTxs = useMemo(() => {
    return transactions
      .filter(
        (t) =>
          t.userId === currentUser &&
          t.categoryId === categoryId &&
          t.type === 'expense' &&
          isSameMonth(parseISO(t.date), selectedMonth)
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, currentUser, categoryId, selectedMonth]);

  const spent = monthTxs.reduce((s, t) => s + t.amount, 0);
  const limit = budget?.limit ?? 0;
  const remaining = limit - spent;

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof monthTxs> = {};
    monthTxs.forEach((t) => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return Object.entries(groups);
  }, [monthTxs]);

  return (
    <Modal open onClose={onClose} title={cat?.name ?? 'Category'}>
      {/* Budget summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-xs text-dark-muted">Budget</p>
          <p className="text-sm font-bold text-dark-text">{fmtMoney(limit)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-dark-muted">Used Amount</p>
          <p className="text-sm font-bold text-red-400">{fmtMoney(spent)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-dark-muted">Remaining</p>
          <p className={`text-sm font-bold ${remaining >= 0 ? 'text-dark-text' : 'text-red-400'}`}>
            {fmtMoney(remaining)}
          </p>
        </div>
      </div>

      {/* Transaction list */}
      {grouped.map(([date, txs]) => {
        const dayTotal = txs.reduce((s, t) => s + t.amount, 0);
        const d = parseISO(date);
        const dayNum = d.getDate().toString().padStart(2, '0');
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];

        return (
          <div key={date} className="mb-3">
            <div className="flex items-center justify-between py-2 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-dark-text">{dayNum}</span>
                <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">{dayName}</span>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-blue-400">$0.00</span>
                <span className="text-red-400">{fmtMoney(dayTotal)}</span>
              </div>
            </div>
            {txs.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5 pl-2">
                <div>
                  <p className="text-sm text-dark-text">{t.description}</p>
                </div>
                <span className="text-sm font-semibold text-red-400">{fmtMoney(t.amount)}</span>
              </div>
            ))}
          </div>
        );
      })}

      {monthTxs.length === 0 && (
        <p className="text-sm text-dark-muted text-center py-8">No transactions this month</p>
      )}
    </Modal>
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
          <label className="block text-xs font-medium text-dark-muted mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-xs font-medium text-dark-muted mb-1">Limit</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="0.00"
            className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-dark-muted mb-1">Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
            className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <button onClick={handleDelete} className="px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30">
            Delete
          </button>
        )}
        <div className="flex-1" />
        <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-medium bg-dark-surface text-dark-muted hover:bg-dark-border">
          Cancel
        </button>
        <button onClick={handleSave} className="px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
          {isEdit ? 'Update' : 'Save'}
        </button>
      </div>
    </Modal>
  );
}
