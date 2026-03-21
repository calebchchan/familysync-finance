import { useMemo, useState } from 'react';
import { isSameMonth, parseISO } from 'date-fns';
import { useApp } from '../../context/AppContext';
import MonthPicker from '../shared/MonthPicker';

export default function BalancesView() {
  const { currentUser, accounts, accountGroups } = useApp();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const userAccounts = useMemo(
    () => accounts.filter((a) => a.userId === currentUser),
    [accounts, currentUser]
  );

  const assets = useMemo(
    () => userAccounts.filter((a) => a.balance >= 0).reduce((s, a) => s + a.balance, 0),
    [userAccounts]
  );

  const liabilities = useMemo(
    () => userAccounts.filter((a) => a.balance < 0).reduce((s, a) => s + a.balance, 0),
    [userAccounts]
  );

  const total = assets + liabilities;

  const grouped = useMemo(() => {
    return accountGroups
      .sort((a, b) => a.order - b.order)
      .map((g) => ({
        group: g,
        accounts: userAccounts.filter((a) => a.groupId === g.id),
        total: userAccounts.filter((a) => a.groupId === g.id).reduce((s, a) => s + a.balance, 0),
      }))
      .filter((g) => g.accounts.length > 0);
  }, [accountGroups, userAccounts]);

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

  if (selectedAccountId) {
    return (
      <AccountDetail
        accountId={selectedAccountId}
        onClose={() => setSelectedAccountId(null)}
      />
    );
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-dark-text">Accounts</h1>
        <div className="flex gap-2">
          <button className="w-8 h-8 flex items-center justify-center text-dark-muted hover:text-dark-text">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
            </svg>
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-dark-muted hover:text-dark-text">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Assets / Liabilities / Total */}
      <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-dark-border">
        <div className="text-center">
          <p className="text-xs text-dark-muted">Assets</p>
          <p className="text-sm font-bold text-blue-400">{fmtMoney(assets)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-dark-muted">Liabilities</p>
          <p className="text-sm font-bold text-red-400">{fmtMoney(liabilities)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-dark-muted">Total</p>
          <p className="text-sm font-bold text-dark-text">{fmtMoney(total)}</p>
        </div>
      </div>

      {/* Account groups */}
      {grouped.map(({ group, accounts: accs, total: groupTotal }) => (
        <div key={group.id} className="mb-2">
          <div className="flex items-center justify-between py-2 border-b border-dark-border">
            <span className="text-sm text-dark-muted">{group.name}</span>
            <span className="text-sm font-semibold text-red-400">{fmtMoney(groupTotal)}</span>
          </div>
          {accs.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setSelectedAccountId(acc.id)}
              className="w-full flex items-center justify-between px-2 py-3 text-left hover:bg-dark-surface/50 transition-colors border-b border-dark-border/50"
            >
              <span className="text-sm font-medium text-dark-text">{acc.name}</span>
              <span className={`text-sm font-semibold ${acc.balance >= 0 ? 'text-red-400' : 'text-red-400'}`}>
                {fmtMoney(acc.balance)}
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function AccountDetail({ accountId, onClose }: { accountId: string; onClose: () => void }) {
  const { accounts, transactions, categories, selectedMonth, setSelectedMonth } = useApp();
  const account = accounts.find((a) => a.id === accountId)!;
  const [viewMode, setViewMode] = useState<'daily' | 'monthly' | 'annually'>('daily');

  const accountTxs = useMemo(() => {
    return transactions
      .filter(
        (t) =>
          (t.accountId === accountId || t.toAccountId === accountId) &&
          isSameMonth(parseISO(t.date), selectedMonth)
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, accountId, selectedMonth]);

  const deposits = accountTxs
    .filter((t) => t.type === 'income' || (t.type === 'transfer' && t.toAccountId === accountId))
    .reduce((s, t) => s + t.amount, 0);
  const withdrawals = accountTxs
    .filter((t) => t.type === 'expense' || (t.type === 'transfer' && t.accountId === accountId))
    .reduce((s, t) => s + t.amount, 0);

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

  const getAccountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? '';
  const getCatName = (id: string) => categories.find((c) => c.id === id)?.name ?? '';

  // Group transactions by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof accountTxs> = {};
    accountTxs.forEach((t) => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return Object.entries(groups);
  }, [accountTxs]);

  // Calculate running balance
  const allAccountTxs = useMemo(() => {
    return transactions
      .filter((t) => t.accountId === accountId || t.toAccountId === accountId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions, accountId]);

  const runningBalanceMap = useMemo(() => {
    const map = new Map<string, number>();
    let balance = account.balance;
    // Work backwards from current balance
    const reversed = [...allAccountTxs].reverse();
    for (const t of reversed) {
      map.set(t.id, balance);
      if (t.type === 'income' || (t.type === 'transfer' && t.toAccountId === accountId)) {
        balance -= t.amount;
      } else {
        balance += t.amount;
      }
    }
    return map;
  }, [allAccountTxs, account.balance, accountId]);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onClose} className="flex items-center gap-1 text-blue-400 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Accounts
        </button>
        <h2 className="text-lg font-bold text-dark-text">{account.name}</h2>
        <div className="flex gap-2">
          <button className="w-8 h-8 flex items-center justify-center text-dark-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-dark-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Month picker */}
      <div className="mb-4">
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {/* Daily/Monthly/Annually toggle */}
      <div className="flex border-b border-dark-border mb-4">
        {(['daily', 'monthly', 'annually'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 py-2 text-sm font-medium capitalize text-center border-b-2 transition-colors ${
              viewMode === mode
                ? 'border-dark-text text-dark-text'
                : 'border-transparent text-dark-muted'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-2 pb-3 mb-3 border-b border-dark-border">
        <div className="text-center">
          <p className="text-xs text-dark-muted">Deposit</p>
          <p className="text-xs font-bold text-blue-400">{fmtMoney(deposits)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-dark-muted">Withdrawal</p>
          <p className="text-xs font-bold text-red-400">{fmtMoney(withdrawals)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-dark-muted">Total</p>
          <p className="text-xs font-bold text-dark-text">{fmtMoney(deposits - withdrawals)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-dark-muted">Balance</p>
          <p className="text-xs font-bold text-dark-text">{fmtMoney(account.balance)}</p>
        </div>
      </div>

      {/* Transaction list grouped by date */}
      {grouped.map(([date, txs]) => {
        const d = parseISO(date);
        const dayNum = d.getDate().toString().padStart(2, '0');
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
        const dayDeposit = txs
          .filter((t) => t.type === 'income' || (t.type === 'transfer' && t.toAccountId === accountId))
          .reduce((s, t) => s + t.amount, 0);
        const dayWithdraw = txs
          .filter((t) => t.type === 'expense' || (t.type === 'transfer' && t.accountId === accountId))
          .reduce((s, t) => s + t.amount, 0);

        return (
          <div key={date} className="mb-1">
            <div className="flex items-center justify-between py-2 border-b border-dark-border">
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
                <span className="text-blue-400">{fmtMoney(dayDeposit)}</span>
                <span className="text-red-400">{fmtMoney(dayWithdraw)}</span>
              </div>
            </div>
            {txs.map((t) => {
              const isInflow = t.type === 'income' || (t.type === 'transfer' && t.toAccountId === accountId);
              const balance = runningBalanceMap.get(t.id) ?? 0;
              let label = '';
              let subtitle = '';

              if (t.type === 'transfer') {
                if (t.accountId === accountId) {
                  label = `${account.name} → ${getAccountName(t.toAccountId!)}`;
                } else {
                  label = `${getAccountName(t.accountId)} → ${account.name}`;
                }
                subtitle = label;
              } else {
                label = t.description;
                subtitle = `${getCatName(t.categoryId)} · ${account.name}`;
              }

              return (
                <div key={t.id} className="flex items-center justify-between py-2.5 pl-2 border-b border-dark-border/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-dark-muted">
                        {t.type === 'transfer' ? 'Transfer' : getCatName(t.categoryId)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-dark-text truncate">{label}</p>
                    <p className="text-xs text-dark-muted truncate">{subtitle}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className={`text-sm font-semibold ${isInflow ? 'text-blue-400' : 'text-red-400'}`}>
                      {fmtMoney(t.amount)}
                    </p>
                    <p className="text-xs text-dark-muted">{fmtMoney(balance)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {accountTxs.length === 0 && (
        <p className="text-sm text-dark-muted text-center py-8">No transactions this month</p>
      )}

      {/* FAB */}
      <button className="fixed bottom-20 right-6 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:bg-orange-600 transition-colors z-30">
        +
      </button>
    </div>
  );
}
