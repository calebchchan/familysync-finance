import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Transaction, TransactionType } from '../../types';

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionForm({ transaction, onClose }: Props) {
  const {
    currentUser,
    categories,
    accounts,
    pools,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useApp();

  const isEdit = !!transaction;
  const isOwner = !transaction || transaction.userId === currentUser;

  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense');
  const [amount, setAmount] = useState(transaction?.amount?.toString() ?? '');
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '');
  const [accountId, setAccountId] = useState(
    transaction?.accountId ?? accounts.find((a) => a.userId === currentUser)?.id ?? ''
  );
  const [toAccountId, setToAccountId] = useState(transaction?.toAccountId ?? '');
  const [poolId, setPoolId] = useState(transaction?.poolId ?? '');
  const [date, setDate] = useState(transaction?.date ?? new Date().toISOString().split('T')[0]);

  const userAccounts = accounts.filter((a) => a.userId === currentUser);
  const filteredCategories = categories.filter((c) =>
    type === 'transfer' ? true : c.type === type
  );

  const handleSave = async () => {
    if (!amount || !description || !categoryId || !accountId) return;
    const data = {
      userId: currentUser,
      type,
      amount: parseFloat(amount),
      description,
      categoryId,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      poolId: poolId || undefined,
      date,
    };

    if (isEdit && transaction) {
      await updateTransaction({ ...transaction, ...data });
    } else {
      await addTransaction(data);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (transaction) {
      await deleteTransaction(transaction.id);
      onClose();
    }
  };

  const handleNumpad = (key: string) => {
    if (key === 'backspace') {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === 'OK') {
      // Do nothing, amount is set
    } else {
      setAmount((prev) => prev + key);
    }
  };

  const typeLabel: Record<TransactionType, string> = {
    income: 'Income',
    expense: 'Expense',
    transfer: 'Transfer',
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark-bg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
        <button onClick={onClose} className="flex items-center gap-1 text-dark-muted text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Trans.
        </button>
        <h2 className="text-base font-bold text-dark-text">{typeLabel[type]}</h2>
        <div className="w-10" />
      </div>

      {/* Type toggle */}
      <div className="flex gap-2 px-4 py-3">
        {(['income', 'expense', 'transfer'] as TransactionType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${
              type === t
                ? t === 'income'
                  ? 'border-blue-500 text-blue-400 bg-transparent'
                  : t === 'expense'
                  ? 'border-red-500 text-red-400 bg-transparent'
                  : 'border-dark-muted text-dark-text bg-transparent'
                : 'border-dark-border text-dark-muted bg-dark-surface'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Form fields */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-dark-border">
          <span className="text-sm text-dark-muted">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-dark-text text-sm text-right focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between py-2 border-b border-dark-border">
          <span className="text-sm text-dark-muted">Amount</span>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="bg-transparent text-dark-text text-lg font-semibold text-right focus:outline-none w-40"
          />
        </div>

        <div className="flex items-center justify-between py-2 border-b border-dark-border">
          <span className="text-sm text-dark-muted">Category</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="bg-transparent text-dark-text text-sm text-right focus:outline-none appearance-none"
          >
            <option value="" className="bg-dark-card">Select</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id} className="bg-dark-card">
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-dark-border">
          <span className="text-sm text-dark-muted">
            {type === 'transfer' ? 'From Account' : 'Account'}
          </span>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="bg-transparent text-dark-text text-sm text-right focus:outline-none appearance-none"
          >
            <option value="" className="bg-dark-card">Select</option>
            {userAccounts.map((a) => (
              <option key={a.id} value={a.id} className="bg-dark-card">
                {a.icon} {a.name}
              </option>
            ))}
          </select>
        </div>

        {type === 'transfer' && (
          <div className="flex items-center justify-between py-2 border-b border-dark-border">
            <span className="text-sm text-dark-muted">To Account</span>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="bg-transparent text-dark-text text-sm text-right focus:outline-none appearance-none"
            >
              <option value="" className="bg-dark-card">Select</option>
              {userAccounts
                .filter((a) => a.id !== accountId)
                .map((a) => (
                  <option key={a.id} value={a.id} className="bg-dark-card">
                    {a.icon} {a.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-between py-2 border-b border-dark-border">
          <span className="text-sm text-dark-muted">Note</span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="bg-transparent text-dark-text text-sm text-right focus:outline-none w-48"
          />
        </div>

        {type !== 'transfer' && (
          <div className="flex items-center justify-between py-2 border-b border-dark-border">
            <span className="text-sm text-dark-muted">Joint Pool</span>
            <select
              value={poolId}
              onChange={(e) => setPoolId(e.target.value)}
              className="bg-transparent text-dark-text text-sm text-right focus:outline-none appearance-none"
            >
              <option value="" className="bg-dark-card">None (Personal)</option>
              {pools.map((p) => (
                <option key={p.id} value={p.id} className="bg-dark-card">
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action buttons */}
        {isEdit && isOwner && (
          <button
            onClick={handleDelete}
            className="w-full py-2 text-sm text-red-400 hover:text-red-300"
          >
            Delete Transaction
          </button>
        )}
      </div>

      {/* Calculator numpad */}
      <div className="bg-dark-surface border-t border-dark-border">
        <div className="flex items-center justify-between px-4 py-2 border-b border-dark-border">
          <span className="text-sm text-dark-muted">Amount</span>
          <button className="text-dark-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </button>
          <button onClick={onClose} className="text-dark-muted">✕</button>
        </div>
        <div className="grid grid-cols-4 gap-0">
          {['+', '-', '×', '÷'].map((k) => (
            <button key={k} className="py-3 text-center text-lg text-dark-muted hover:bg-dark-border">
              {k}
            </button>
          ))}
          {['7', '8', '9', '='].map((k) => (
            <button
              key={k}
              onClick={() => k !== '=' && handleNumpad(k)}
              className="py-3 text-center text-lg text-dark-text hover:bg-dark-border"
            >
              {k}
            </button>
          ))}
          {['4', '5', '6', '.'].map((k) => (
            <button
              key={k}
              onClick={() => handleNumpad(k)}
              className="py-3 text-center text-lg text-dark-text hover:bg-dark-border"
            >
              {k}
            </button>
          ))}
          {['1', '2', '3'].map((k) => (
            <button
              key={k}
              onClick={() => handleNumpad(k)}
              className="py-3 text-center text-lg text-dark-text hover:bg-dark-border"
            >
              {k}
            </button>
          ))}
          <button
            onClick={() => handleNumpad('backspace')}
            className="py-3 text-center text-lg text-dark-text hover:bg-dark-border"
          >
            ⌫
          </button>
          {['00', '0', '000'].map((k) => (
            <button
              key={k}
              onClick={() => handleNumpad(k)}
              className="py-3 text-center text-lg text-dark-text hover:bg-dark-border"
            >
              {k}
            </button>
          ))}
          <button
            onClick={handleSave}
            className="py-3 text-center text-lg font-bold bg-orange-500 text-white hover:bg-orange-600"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
