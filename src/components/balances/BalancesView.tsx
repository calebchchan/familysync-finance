import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../context/AppContext';
import Modal from '../shared/Modal';

export default function BalancesView() {
  const { currentUser, accounts, accountGroups, pools, pledges, transactions } = useApp();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const userAccounts = useMemo(
    () => accounts.filter((a) => a.userId === currentUser),
    [accounts, currentUser]
  );

  const personalNetWorth = useMemo(
    () => userAccounts.reduce((s, a) => s + a.balance, 0),
    [userAccounts]
  );

  const jointValue = useMemo(() => {
    return pools.reduce((total, pool) => {
      const pledged = pledges
        .filter((p) => p.poolId === pool.id)
        .reduce((s, p) => s + p.amount, 0);
      const spent = transactions
        .filter((t) => t.poolId === pool.id && t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      const income = transactions
        .filter((t) => t.poolId === pool.id && t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
      return total + pledged + income - spent;
    }, 0);
  }, [pools, pledges, transactions]);

  // Historical chart data (simulated monthly trend)
  const chartData = useMemo(() => {
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    const basePersonal = personalNetWorth * 0.7;
    const baseJoint = jointValue * 0.5;
    return months.map((m, i) => ({
      month: m,
      personal: Math.round(basePersonal + (personalNetWorth - basePersonal) * ((i + 1) / months.length) + Math.random() * 500),
      joint: Math.round(baseJoint + (jointValue - baseJoint) * ((i + 1) / months.length) + Math.random() * 200),
    }));
  }, [personalNetWorth, jointValue]);

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const grouped = useMemo(() => {
    return accountGroups
      .sort((a, b) => a.order - b.order)
      .map((g) => ({
        group: g,
        accounts: userAccounts.filter((a) => a.groupId === g.id),
      }))
      .filter((g) => g.accounts.length > 0);
  }, [accountGroups, userAccounts]);

  return (
    <div className="pb-4">
      {/* Net worth summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4 shadow-sm border border-indigo-100">
          <p className="text-xs text-indigo-600 font-medium mb-1">Personal Net Worth</p>
          <p className={`text-xl font-bold ${personalNetWorth >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>
            {fmtMoney(personalNetWorth)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 shadow-sm border border-amber-100">
          <p className="text-xs text-amber-600 font-medium mb-1">Joint Value</p>
          <p className="text-xl font-bold text-amber-700">{fmtMoney(jointValue)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Net Worth Trend
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPersonal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorJoint" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              formatter={(value: number) => fmtMoney(value)}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="personal"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#colorPersonal)"
              name="Personal"
            />
            <Area
              type="monotone"
              dataKey="joint"
              stroke="#f59e0b"
              fillOpacity={1}
              fill="url(#colorJoint)"
              name="Joint"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Account groups */}
      {grouped.map(({ group, accounts: accs }) => (
        <div key={group.id} className="mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {group.name}
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {accs.map((acc) => (
              <button
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">{acc.icon}</span>
                <span className="flex-1 text-sm font-medium text-gray-900">{acc.name}</span>
                <span
                  className={`text-sm font-semibold ${
                    acc.balance >= 0 ? 'text-gray-900' : 'text-red-500'
                  }`}
                >
                  {fmtMoney(acc.balance)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {selectedAccountId && (
        <AccountDetail
          accountId={selectedAccountId}
          onClose={() => setSelectedAccountId(null)}
        />
      )}
    </div>
  );
}

function AccountDetail({ accountId, onClose }: { accountId: string; onClose: () => void }) {
  const { accounts, transactions, categories } = useApp();
  const account = accounts.find((a) => a.id === accountId)!;

  const accountTxs = useMemo(
    () =>
      transactions
        .filter((t) => t.accountId === accountId || t.toAccountId === accountId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, accountId]
  );

  const inflow = accountTxs
    .filter((t) => t.type === 'income' || (t.type === 'transfer' && t.toAccountId === accountId))
    .reduce((s, t) => s + t.amount, 0);
  const outflow = accountTxs
    .filter((t) => t.type === 'expense' || (t.type === 'transfer' && t.accountId === accountId))
    .reduce((s, t) => s + t.amount, 0);

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const getCatIcon = (id: string) => categories.find((c) => c.id === id)?.icon ?? '📝';

  return (
    <Modal open onClose={onClose} title={`${account.icon} ${account.name}`}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-emerald-50 rounded-lg p-3 text-center">
          <p className="text-[10px] text-emerald-600 uppercase font-medium">Inflow</p>
          <p className="text-sm font-bold text-emerald-700">{fmtMoney(inflow)}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-[10px] text-red-600 uppercase font-medium">Outflow</p>
          <p className="text-sm font-bold text-red-600">{fmtMoney(outflow)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-[10px] text-gray-600 uppercase font-medium">Net</p>
          <p className={`text-sm font-bold ${inflow - outflow >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {fmtMoney(inflow - outflow)}
          </p>
        </div>
      </div>

      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        Recent Transactions
      </h3>
      <div className="space-y-2">
        {accountTxs.slice(0, 20).map((t) => (
          <div key={t.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
            <span>{getCatIcon(t.categoryId)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{t.description}</p>
              <p className="text-xs text-gray-400">{t.date}</p>
            </div>
            <span
              className={`text-sm font-semibold ${
                t.type === 'income' || (t.type === 'transfer' && t.toAccountId === accountId)
                  ? 'text-emerald-600'
                  : 'text-red-500'
              }`}
            >
              {t.type === 'income' || (t.type === 'transfer' && t.toAccountId === accountId) ? '+' : '-'}
              {fmtMoney(t.amount)}
            </span>
          </div>
        ))}
        {accountTxs.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No transactions</p>
        )}
      </div>
    </Modal>
  );
}
