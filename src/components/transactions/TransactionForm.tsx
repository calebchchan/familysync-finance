import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../shared/Modal';
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

  const typeColors: Record<TransactionType, string> = {
    income: 'bg-emerald-500 text-white',
    expense: 'bg-red-500 text-white',
    transfer: 'bg-gray-500 text-white',
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Edit Transaction' : 'New Transaction'}>
      {/* Type selector */}
      <div className="flex gap-2 mb-4">
        {(['income', 'expense', 'transfer'] as TransactionType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              type === t ? typeColors[t] : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this for?"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select category</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {type === 'transfer' ? 'From Account' : 'Account'}
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select account</option>
            {userAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.icon} {a.name}
              </option>
            ))}
          </select>
        </div>

        {type === 'transfer' && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To Account</label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select account</option>
              {userAccounts
                .filter((a) => a.id !== accountId)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {type !== 'transfer' && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Joint Pool (optional)
            </label>
            <select
              value={poolId}
              onChange={(e) => setPoolId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">None (Personal)</option>
              {pools.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-3">
        {isEdit && isOwner && (
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
        {isOwner && (
          <button
            onClick={handleSave}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {isEdit ? 'Update' : 'Save'}
          </button>
        )}
      </div>
    </Modal>
  );
}
