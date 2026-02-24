import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../shared/Modal';
import type { Category, Account, AccountGroup, JointPool, UserProfile } from '../../types';

type SettingsSection = 'users' | 'categories' | 'accounts' | 'groups' | 'pools';

export default function SettingsView() {
  const { resetAllData } = useApp();
  const [section, setSection] = useState<SettingsSection | null>(null);

  const sections: { id: SettingsSection; label: string; icon: string; desc: string }[] = [
    { id: 'users', label: 'User Profiles', icon: '👥', desc: 'Update display names' },
    { id: 'categories', label: 'Categories', icon: '🏷️', desc: 'Income & expense categories' },
    { id: 'accounts', label: 'Accounts', icon: '🏦', desc: 'Bank accounts, cards, wallets' },
    { id: 'groups', label: 'Account Groups', icon: '📁', desc: 'Organize your accounts' },
    { id: 'pools', label: 'Joint Pools', icon: '🤝', desc: 'Shared financial goals' },
  ];

  const handleReset = async () => {
    if (window.confirm('Reset all data to defaults? This cannot be undone.')) {
      await resetAllData();
    }
  };

  return (
    <div className="pb-4">
      <div className="space-y-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className="w-full flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{s.label}</p>
              <p className="text-xs text-gray-400">{s.desc}</p>
            </div>
            <span className="ml-auto text-gray-300">›</span>
          </button>
        ))}
      </div>

      {/* Data management */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
          Data Management
        </h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          <div className="px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">
              Data is stored locally on this device in your browser. It persists across refreshes
              but is not synced to any cloud service.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors"
          >
            <span className="text-xl">🔄</span>
            <div>
              <p className="text-sm font-medium text-red-600">Reset All Data</p>
              <p className="text-xs text-gray-400">Restore sample data and clear all changes</p>
            </div>
          </button>
        </div>
      </div>

      {section === 'users' && <UserSettings onClose={() => setSection(null)} />}
      {section === 'categories' && <CategorySettings onClose={() => setSection(null)} />}
      {section === 'accounts' && <AccountSettings onClose={() => setSection(null)} />}
      {section === 'groups' && <GroupSettings onClose={() => setSection(null)} />}
      {section === 'pools' && <PoolSettings onClose={() => setSection(null)} />}
    </div>
  );
}

function UserSettings({ onClose }: { onClose: () => void }) {
  const { users, updateUser } = useApp();
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');

  const startEdit = (u: UserProfile) => { setEditing(u); setName(u.name); };
  const handleSave = async () => {
    if (editing && name.trim()) {
      await updateUser({ ...editing, name: name.trim() });
      setEditing(null);
    }
  };

  return (
    <Modal open onClose={onClose} title="User Profiles">
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-3">
            <span className="text-2xl">{u.avatar}</span>
            {editing?.id === u.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button onClick={handleSave} className="text-sm text-indigo-600 font-medium">Save</button>
                <button onClick={() => setEditing(null)} className="text-sm text-gray-400">Cancel</button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium text-gray-900">{u.name}</span>
                <button onClick={() => startEdit(u)} className="text-xs text-indigo-600 font-medium">Edit</button>
              </>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}

function CategorySettings({ onClose }: { onClose: () => void }) {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📝');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const startEdit = (c: Category) => { setEditing(c); setName(c.name); setIcon(c.icon); setType(c.type); setShowAdd(true); };
  const startAdd = () => { setEditing(null); setName(''); setIcon('📝'); setType('expense'); setShowAdd(true); };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editing) {
      await updateCategory({ ...editing, name: name.trim(), icon, type });
    } else {
      await addCategory({ name: name.trim(), icon, type });
    }
    setShowAdd(false);
  };

  const handleDelete = async () => {
    if (editing) {
      await deleteCategory(editing.id);
      setShowAdd(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Categories">
      <div className="space-y-2 mb-4">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => startEdit(c)}
            className="w-full flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 text-left hover:bg-gray-100"
          >
            <span>{c.icon}</span>
            <span className="flex-1 text-sm text-gray-900">{c.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {c.type}
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={startAdd}
        className="w-full py-2 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
      >
        + Add Category
      </button>

      {showAdd && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-3">
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-center text-lg"
            maxLength={2}
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'income' | 'expense')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <div className="flex gap-2">
            {editing && (
              <button onClick={handleDelete} className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg">Delete</button>
            )}
            <div className="flex-1" />
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded-lg">Save</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function AccountSettings({ onClose }: { onClose: () => void }) {
  const { currentUser, accounts, accountGroups, addAccount, updateAccount, deleteAccount } = useApp();
  const userAccounts = accounts.filter((a) => a.userId === currentUser);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏦');
  const [groupId, setGroupId] = useState(accountGroups[0]?.id ?? '');
  const [balance, setBalance] = useState('0');

  const startEdit = (a: Account) => { setEditing(a); setName(a.name); setIcon(a.icon); setGroupId(a.groupId); setBalance(a.balance.toString()); setShowAdd(true); };
  const startAdd = () => { setEditing(null); setName(''); setIcon('🏦'); setGroupId(accountGroups[0]?.id ?? ''); setBalance('0'); setShowAdd(true); };

  const handleSave = async () => {
    if (!name.trim() || !groupId) return;
    if (editing) {
      await updateAccount({ ...editing, name: name.trim(), icon, groupId, balance: parseFloat(balance) });
    } else {
      await addAccount({ userId: currentUser, name: name.trim(), icon, groupId, balance: parseFloat(balance) });
    }
    setShowAdd(false);
  };

  const handleDelete = async () => {
    if (editing) { await deleteAccount(editing.id); setShowAdd(false); }
  };

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <Modal open onClose={onClose} title="Accounts">
      <div className="space-y-2 mb-4">
        {userAccounts.map((a) => (
          <button
            key={a.id}
            onClick={() => startEdit(a)}
            className="w-full flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 text-left hover:bg-gray-100"
          >
            <span>{a.icon}</span>
            <span className="flex-1 text-sm text-gray-900">{a.name}</span>
            <span className={`text-sm font-medium ${a.balance >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
              {fmtMoney(a.balance)}
            </span>
          </button>
        ))}
      </div>
      <button onClick={startAdd} className="w-full py-2 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
        + Add Account
      </button>
      {showAdd && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-3">
          <div className="flex gap-2">
            <input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-center text-lg" maxLength={2} />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Account name" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {accountGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="Balance" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="flex gap-2">
            {editing && <button onClick={handleDelete} className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg">Delete</button>}
            <div className="flex-1" />
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded-lg">Save</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function GroupSettings({ onClose }: { onClose: () => void }) {
  const { accountGroups, addAccountGroup, updateAccountGroup, deleteAccountGroup } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<AccountGroup | null>(null);
  const [name, setName] = useState('');

  const startEdit = (g: AccountGroup) => { setEditing(g); setName(g.name); setShowAdd(true); };
  const startAdd = () => { setEditing(null); setName(''); setShowAdd(true); };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editing) {
      await updateAccountGroup({ ...editing, name: name.trim() });
    } else {
      await addAccountGroup({ name: name.trim(), order: accountGroups.length + 1 });
    }
    setShowAdd(false);
  };

  const handleDelete = async () => {
    if (editing) { await deleteAccountGroup(editing.id); setShowAdd(false); }
  };

  return (
    <Modal open onClose={onClose} title="Account Groups">
      <div className="space-y-2 mb-4">
        {accountGroups.map((g) => (
          <button key={g.id} onClick={() => startEdit(g)} className="w-full flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 text-left hover:bg-gray-100">
            <span className="text-sm text-gray-900">{g.name}</span>
            <span className="ml-auto text-xs text-gray-400">Order: {g.order}</span>
          </button>
        ))}
      </div>
      <button onClick={startAdd} className="w-full py-2 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
        + Add Group
      </button>
      {showAdd && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="flex gap-2">
            {editing && <button onClick={handleDelete} className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg">Delete</button>}
            <div className="flex-1" />
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded-lg">Save</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function PoolSettings({ onClose }: { onClose: () => void }) {
  const { pools, addPool, updatePool, deletePool } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<JointPool | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [target, setTarget] = useState('0');

  const startEdit = (p: JointPool) => { setEditing(p); setName(p.name); setIcon(p.icon); setTarget(p.target.toString()); setShowAdd(true); };
  const startAdd = () => { setEditing(null); setName(''); setIcon('🎯'); setTarget('0'); setShowAdd(true); };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editing) {
      await updatePool({ ...editing, name: name.trim(), icon, target: parseFloat(target) });
    } else {
      await addPool({ name: name.trim(), icon, target: parseFloat(target), order: pools.length + 1 });
    }
    setShowAdd(false);
  };

  const handleDelete = async () => {
    if (editing) { await deletePool(editing.id); setShowAdd(false); }
  };

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <Modal open onClose={onClose} title="Joint Pools">
      <div className="space-y-2 mb-4">
        {pools.map((p) => (
          <button key={p.id} onClick={() => startEdit(p)} className="w-full flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 text-left hover:bg-gray-100">
            <span>{p.icon}</span>
            <span className="flex-1 text-sm text-gray-900">{p.name}</span>
            <span className="text-xs text-gray-400">Target: {fmtMoney(p.target)}</span>
          </button>
        ))}
      </div>
      <button onClick={startAdd} className="w-full py-2 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
        + Add Pool
      </button>
      {showAdd && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-3">
          <div className="flex gap-2">
            <input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-center text-lg" maxLength={2} />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pool name" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Target amount" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="flex gap-2">
            {editing && <button onClick={handleDelete} className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg">Delete</button>}
            <div className="flex-1" />
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded-lg">Save</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
