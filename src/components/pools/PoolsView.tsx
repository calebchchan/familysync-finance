import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../shared/Modal';

export default function PoolsView() {
  const { pools, pledges, transactions } = useApp();
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [showPledgeForm, setShowPledgeForm] = useState(false);

  const poolSummaries = useMemo(() => {
    return pools
      .sort((a, b) => a.order - b.order)
      .map((pool) => {
        const totalPledged = pledges
          .filter((p) => p.poolId === pool.id)
          .reduce((s, p) => s + p.amount, 0);
        const totalSpent = transactions
          .filter((t) => t.poolId === pool.id && t.type === 'expense')
          .reduce((s, t) => s + t.amount, 0);
        const totalIncome = transactions
          .filter((t) => t.poolId === pool.id && t.type === 'income')
          .reduce((s, t) => s + t.amount, 0);
        return {
          pool,
          totalPledged,
          totalSpent,
          totalIncome,
          available: totalPledged + totalIncome - totalSpent,
        };
      });
  }, [pools, pledges, transactions]);

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const totalJointValue = poolSummaries.reduce((s, p) => s + p.available, 0);

  return (
    <div className="pb-4">
      {/* Overall joint summary */}
      <div className="bg-dark-card rounded-xl p-4 border border-dark-border mb-5">
        <p className="text-xs text-amber-400 font-medium mb-1">Total Joint Value</p>
        <p className="text-2xl font-bold text-dark-text">{fmtMoney(totalJointValue)}</p>
        <p className="text-xs text-dark-muted mt-1">{pools.length} active pools</p>
      </div>

      {/* Pool cards */}
      <div className="space-y-3">
        {poolSummaries.map(({ pool, totalPledged, totalSpent, available }) => {
          const progress = pool.target > 0 ? (available / pool.target) * 100 : 0;
          return (
            <button
              key={pool.id}
              onClick={() => setSelectedPool(pool.id)}
              className="w-full bg-dark-card rounded-xl p-4 border border-dark-border text-left hover:bg-dark-surface transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{pool.icon}</span>
                  <span className="text-sm font-semibold text-dark-text">{pool.name}</span>
                </div>
                <span className="text-xs text-dark-muted">Target: {fmtMoney(pool.target)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <p className="text-[10px] text-dark-muted uppercase">Pledged</p>
                  <p className="text-sm font-semibold text-blue-400">{fmtMoney(totalPledged)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-dark-muted uppercase">Spent</p>
                  <p className="text-sm font-semibold text-red-400">{fmtMoney(totalSpent)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-dark-muted uppercase">Available</p>
                  <p className="text-sm font-semibold text-emerald-400">{fmtMoney(available)}</p>
                </div>
              </div>

              <div className="w-full bg-dark-surface rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-amber-500 transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-dark-muted mt-1 text-right">
                {Math.round(progress)}% of target
              </p>
            </button>
          );
        })}
      </div>

      {selectedPool && (
        <PoolDetail
          poolId={selectedPool}
          onClose={() => setSelectedPool(null)}
          onPledge={() => setShowPledgeForm(true)}
        />
      )}

      {showPledgeForm && selectedPool && (
        <PledgeForm
          poolId={selectedPool}
          onClose={() => setShowPledgeForm(false)}
        />
      )}
    </div>
  );
}

function PoolDetail({
  poolId,
  onClose,
  onPledge,
}: {
  poolId: string;
  onClose: () => void;
  onPledge: () => void;
}) {
  const { pools, pledges, transactions, users } = useApp();
  const pool = pools.find((p) => p.id === poolId)!;

  const poolPledges = pledges.filter((p) => p.poolId === poolId);
  const poolTxs = transactions
    .filter((t) => t.poolId === poolId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const getUserName = (id: string) => users.find((u) => u.id === id)?.name ?? id;

  return (
    <Modal open onClose={onClose} title={`${pool.icon} ${pool.name}`}>
      <h3 className="text-xs font-semibold text-dark-muted uppercase tracking-wide mb-2">Pledges</h3>
      <div className="space-y-2 mb-4">
        {poolPledges.length === 0 && <p className="text-sm text-dark-muted">No pledges yet</p>}
        {poolPledges.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-dark-surface rounded-lg px-3 py-2">
            <div>
              <span className="text-sm font-medium text-dark-text">{getUserName(p.userId)}</span>
              {p.recurring && (
                <span className="ml-2 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                  {p.recurringPeriod}
                </span>
              )}
            </div>
            <span className="text-sm font-semibold text-blue-400">{fmtMoney(p.amount)}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onPledge}
        className="w-full py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 mb-4"
      >
        + Add Pledge
      </button>

      <h3 className="text-xs font-semibold text-dark-muted uppercase tracking-wide mb-2">
        Transactions
      </h3>
      <div className="space-y-2">
        {poolTxs.length === 0 && <p className="text-sm text-dark-muted">No transactions yet</p>}
        {poolTxs.map((t) => (
          <div key={t.id} className="flex items-center justify-between bg-dark-surface rounded-lg px-3 py-2">
            <div>
              <p className="text-sm font-medium text-dark-text">{t.description}</p>
              <p className="text-xs text-dark-muted">
                {getUserName(t.userId)} · {t.date}
              </p>
            </div>
            <span
              className={`text-sm font-semibold ${
                t.type === 'income' ? 'text-blue-400' : 'text-red-400'
              }`}
            >
              {t.type === 'income' ? '+' : '-'}
              {fmtMoney(t.amount)}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function PledgeForm({ poolId, onClose }: { poolId: string; onClose: () => void }) {
  const { currentUser, addPledge } = useApp();
  const [amount, setAmount] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurringPeriod, setRecurringPeriod] = useState<'weekly' | 'monthly'>('monthly');

  const handleSave = async () => {
    if (!amount) return;
    await addPledge({
      userId: currentUser,
      poolId,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      recurring: recurring || undefined,
      recurringPeriod: recurring ? recurringPeriod : undefined,
    });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Add Pledge">
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-dark-muted mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-lg font-semibold text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="recurring"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="recurring" className="text-sm text-dark-text">Recurring</label>
          {recurring && (
            <select
              value={recurringPeriod}
              onChange={(e) => setRecurringPeriod(e.target.value as 'weekly' | 'monthly')}
              className="ml-auto bg-dark-surface border border-dark-border rounded-lg px-2 py-1 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          )}
        </div>
      </div>
      <div className="mt-5 flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-medium bg-dark-surface text-dark-muted hover:bg-dark-border">
          Cancel
        </button>
        <button onClick={handleSave} className="px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
          Pledge
        </button>
      </div>
    </Modal>
  );
}
