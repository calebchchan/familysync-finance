import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../shared/Modal';
import type { Category, Account, AccountGroup, JointPool, UserProfile } from '../../types';

type SettingsSection = 'users' | 'categories' | 'accounts' | 'groups' | 'pools' | 'import';

export default function SettingsView() {
  const { resetAllData } = useApp();
  const { user, userRole, signOut, generateInviteLink } = useAuth();
  const [section, setSection] = useState<SettingsSection | null>(null);
  const [copied, setCopied] = useState(false);

  const sections: { id: SettingsSection; label: string; icon: string; desc: string }[] = [
    { id: 'users', label: 'User Profiles', icon: '👥', desc: 'Update display names' },
    { id: 'categories', label: 'Categories', icon: '🏷️', desc: 'Income & expense categories' },
    { id: 'accounts', label: 'Accounts', icon: '🏦', desc: 'Bank accounts, cards, wallets' },
    { id: 'groups', label: 'Account Groups', icon: '📁', desc: 'Organize your accounts' },
    { id: 'pools', label: 'Joint Pools', icon: '🤝', desc: 'Shared financial goals' },
    { id: 'import', label: 'Import Transactions', icon: '📥', desc: 'Import from Excel file' },
  ];

  const handleReset = async () => {
    if (window.confirm('Reset all data to defaults? This cannot be undone.')) {
      await resetAllData();
    }
  };

  const handleCopyInvite = async () => {
    const link = generateInviteLink();
    if (link) {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="pb-4">
      <h1 className="text-lg font-bold text-dark-text mb-4">More</h1>

      {/* Account info */}
      <div className="bg-dark-card rounded-xl p-4 border border-dark-border mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{userRole === 'husband' ? '👨' : '👩'}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-dark-text capitalize">{userRole ?? 'User'}</p>
            <p className="text-xs text-dark-muted">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg bg-red-500/10"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Invite link */}
      <button
        onClick={handleCopyInvite}
        className="w-full flex items-center gap-3 bg-dark-card rounded-xl p-4 border border-dark-border text-left hover:bg-dark-surface transition-colors mb-4"
      >
        <span className="text-2xl">🔗</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-dark-text">Invite Partner</p>
          <p className="text-xs text-dark-muted">
            {copied ? 'Link copied to clipboard!' : 'Generate invite link for your spouse'}
          </p>
        </div>
        <span className="text-dark-muted">›</span>
      </button>

      <div className="space-y-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className="w-full flex items-center gap-3 bg-dark-card rounded-xl p-4 border border-dark-border text-left hover:bg-dark-surface transition-colors"
          >
            <span className="text-2xl">{s.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-dark-text">{s.label}</p>
              <p className="text-xs text-dark-muted">{s.desc}</p>
            </div>
            <span className="text-dark-muted">›</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-semibold text-dark-muted uppercase tracking-wide mb-2 px-1">
          Data Management
        </h3>
        <div className="bg-dark-card rounded-xl border border-dark-border divide-y divide-dark-border">
          <div className="px-4 py-3">
            <p className="text-xs text-dark-muted">
              Data is stored in Supabase and synced across devices.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-500/10 transition-colors"
          >
            <span className="text-xl">🔄</span>
            <div>
              <p className="text-sm font-medium text-red-400">Reset All Data</p>
              <p className="text-xs text-dark-muted">Restore sample data and clear all changes</p>
            </div>
          </button>
        </div>
      </div>

      {section === 'users' && <UserSettings onClose={() => setSection(null)} />}
      {section === 'categories' && <CategorySettings onClose={() => setSection(null)} />}
      {section === 'accounts' && <AccountSettings onClose={() => setSection(null)} />}
      {section === 'groups' && <GroupSettings onClose={() => setSection(null)} />}
      {section === 'pools' && <PoolSettings onClose={() => setSection(null)} />}
      {section === 'import' && <ImportView onClose={() => setSection(null)} />}
    </div>
  );
}

function ImportView({ onClose }: { onClose: () => void }) {
  const { currentUser, categories, accounts, addTransaction } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    try {
      const XLSX = await import('xlsx');
      const data = await f.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { raw: false });

      if (json.length > 0) {
        setColumns(Object.keys(json[0]));
        setPreview(json.slice(0, 5));

        // Auto-detect mapping
        const cols = Object.keys(json[0]).map((c) => c.toLowerCase());
        const autoMap: Record<string, string> = {};
        const colNames = Object.keys(json[0]);
        cols.forEach((c, i) => {
          if (c.includes('date')) autoMap.date = colNames[i];
          if (c.includes('amount') || c.includes('sum') || c.includes('total')) autoMap.amount = colNames[i];
          if (c.includes('desc') || c.includes('note') || c.includes('memo') || c.includes('narr')) autoMap.description = colNames[i];
          if (c.includes('categ') || c.includes('type')) autoMap.category = colNames[i];
          if (c.includes('account')) autoMap.account = colNames[i];
        });
        setMapping(autoMap);
      }
    } catch (err) {
      setResult('Error reading file. Make sure it\'s a valid Excel file (.xlsx).');
    }
  };

  const handleImport = async () => {
    if (!mapping.date || !mapping.amount || !mapping.description) {
      setResult('Please map at least Date, Amount, and Description columns.');
      return;
    }

    setImporting(true);
    try {
      const XLSX = await import('xlsx');
      const data = await file!.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { raw: false });

      let imported = 0;
      for (const row of json) {
        const amount = parseFloat(row[mapping.amount]?.replace(/[,$]/g, '') ?? '0');
        if (isNaN(amount) || amount === 0) continue;

        const description = row[mapping.description] ?? '';
        const dateStr = row[mapping.date] ?? '';

        // Try to parse date
        let date = '';
        try {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            date = d.toISOString().split('T')[0];
          }
        } catch {
          continue;
        }
        if (!date) continue;

        // Match category by name
        const catName = row[mapping.category]?.toLowerCase() ?? '';
        const matchedCat = categories.find((c) => c.name.toLowerCase() === catName);
        const categoryId = matchedCat?.id ?? categories.find((c) => c.type === (amount > 0 ? 'income' : 'expense'))?.id ?? categories[0]?.id;

        // Match account by name
        const accName = row[mapping.account]?.toLowerCase() ?? '';
        const userAccounts = accounts.filter((a) => a.userId === currentUser);
        const matchedAcc = userAccounts.find((a) => a.name.toLowerCase() === accName);
        const accountId = matchedAcc?.id ?? userAccounts[0]?.id;

        if (!categoryId || !accountId) continue;

        await addTransaction({
          userId: currentUser,
          type: amount > 0 ? 'income' : 'expense',
          amount: Math.abs(amount),
          description,
          categoryId,
          accountId,
          date,
        });
        imported++;
      }

      setResult(`Successfully imported ${imported} transactions.`);
    } catch (err) {
      setResult('Error importing: ' + (err instanceof Error ? err.message : String(err)));
    }
    setImporting(false);
  };

  return (
    <Modal open onClose={onClose} title="Import Transactions">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-dark-muted mb-2">Select Excel File (.xlsx)</label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="w-full text-sm text-dark-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30"
          />
        </div>

        {columns.length > 0 && (
          <>
            <div>
              <h3 className="text-xs font-semibold text-dark-muted uppercase tracking-wide mb-2">Column Mapping</h3>
              {['date', 'amount', 'description', 'category', 'account'].map((field) => (
                <div key={field} className="flex items-center justify-between py-2 border-b border-dark-border">
                  <span className="text-sm text-dark-text capitalize">{field}{field === 'date' || field === 'amount' || field === 'description' ? ' *' : ''}</span>
                  <select
                    value={mapping[field] ?? ''}
                    onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                    className="bg-dark-surface border border-dark-border rounded-lg px-2 py-1 text-sm text-dark-text focus:outline-none"
                  >
                    <option value="">-- Skip --</option>
                    {columns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {preview.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-dark-muted uppercase tracking-wide mb-2">Preview (first 5 rows)</h3>
                <div className="overflow-x-auto">
                  <table className="text-xs text-dark-text w-full">
                    <thead>
                      <tr>
                        {columns.slice(0, 5).map((c) => (
                          <th key={c} className="text-left py-1 px-2 text-dark-muted font-medium">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className="border-t border-dark-border">
                          {columns.slice(0, 5).map((c) => (
                            <td key={c} className="py-1 px-2 truncate max-w-[100px]">{row[c]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import All Rows'}
            </button>
          </>
        )}

        {result && (
          <p className={`text-sm ${result.startsWith('Success') ? 'text-emerald-400' : 'text-red-400'}`}>
            {result}
          </p>
        )}
      </div>
    </Modal>
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
          <div key={u.id} className="flex items-center gap-3 bg-dark-surface rounded-lg px-3 py-3">
            <span className="text-2xl">{u.avatar}</span>
            {editing?.id === u.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-dark-card border border-dark-border rounded-lg px-2 py-1 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={handleSave} className="text-sm text-blue-400 font-medium">Save</button>
                <button onClick={() => setEditing(null)} className="text-sm text-dark-muted">Cancel</button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium text-dark-text">{u.name}</span>
                <button onClick={() => startEdit(u)} className="text-xs text-blue-400 font-medium">Edit</button>
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
            className="w-full flex items-center gap-3 bg-dark-surface rounded-lg px-3 py-2 text-left hover:bg-dark-border"
          >
            <span>{c.icon}</span>
            <span className="flex-1 text-sm text-dark-text">{c.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.type === 'income' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
              {c.type}
            </span>
          </button>
        ))}
      </div>
      <button onClick={startAdd} className="w-full py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
        + Add Category
      </button>
      {showAdd && (
        <div className="mt-4 p-3 bg-dark-surface rounded-lg space-y-3">
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-16 bg-dark-card border border-dark-border rounded-lg px-2 py-1 text-center text-lg text-dark-text"
            maxLength={2}
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'income' | 'expense')}
            className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <div className="flex gap-2">
            {editing && <button onClick={handleDelete} className="px-3 py-1.5 text-sm text-red-400 bg-red-500/20 rounded-lg">Delete</button>}
            <div className="flex-1" />
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-dark-muted bg-dark-card rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg">Save</button>
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
          <button key={a.id} onClick={() => startEdit(a)} className="w-full flex items-center gap-3 bg-dark-surface rounded-lg px-3 py-2 text-left hover:bg-dark-border">
            <span>{a.icon}</span>
            <span className="flex-1 text-sm text-dark-text">{a.name}</span>
            <span className={`text-sm font-medium ${a.balance >= 0 ? 'text-dark-text' : 'text-red-400'}`}>{fmtMoney(a.balance)}</span>
          </button>
        ))}
      </div>
      <button onClick={startAdd} className="w-full py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
        + Add Account
      </button>
      {showAdd && (
        <div className="mt-4 p-3 bg-dark-surface rounded-lg space-y-3">
          <div className="flex gap-2">
            <input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-16 bg-dark-card border border-dark-border rounded-lg px-2 py-1 text-center text-lg text-dark-text" maxLength={2} />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Account name" className="flex-1 bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500">
            {accountGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="Balance" className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-2">
            {editing && <button onClick={handleDelete} className="px-3 py-1.5 text-sm text-red-400 bg-red-500/20 rounded-lg">Delete</button>}
            <div className="flex-1" />
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-dark-muted bg-dark-card rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg">Save</button>
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
          <button key={g.id} onClick={() => startEdit(g)} className="w-full flex items-center gap-3 bg-dark-surface rounded-lg px-3 py-2 text-left hover:bg-dark-border">
            <span className="text-sm text-dark-text">{g.name}</span>
            <span className="ml-auto text-xs text-dark-muted">Order: {g.order}</span>
          </button>
        ))}
      </div>
      <button onClick={startAdd} className="w-full py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
        + Add Group
      </button>
      {showAdd && (
        <div className="mt-4 p-3 bg-dark-surface rounded-lg space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-2">
            {editing && <button onClick={handleDelete} className="px-3 py-1.5 text-sm text-red-400 bg-red-500/20 rounded-lg">Delete</button>}
            <div className="flex-1" />
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-dark-muted bg-dark-card rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg">Save</button>
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
          <button key={p.id} onClick={() => startEdit(p)} className="w-full flex items-center gap-3 bg-dark-surface rounded-lg px-3 py-2 text-left hover:bg-dark-border">
            <span>{p.icon}</span>
            <span className="flex-1 text-sm text-dark-text">{p.name}</span>
            <span className="text-xs text-dark-muted">Target: {fmtMoney(p.target)}</span>
          </button>
        ))}
      </div>
      <button onClick={startAdd} className="w-full py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
        + Add Pool
      </button>
      {showAdd && (
        <div className="mt-4 p-3 bg-dark-surface rounded-lg space-y-3">
          <div className="flex gap-2">
            <input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-16 bg-dark-card border border-dark-border rounded-lg px-2 py-1 text-center text-lg text-dark-text" maxLength={2} />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pool name" className="flex-1 bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Target amount" className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-2">
            {editing && <button onClick={handleDelete} className="px-3 py-1.5 text-sm text-red-400 bg-red-500/20 rounded-lg">Delete</button>}
            <div className="flex-1" />
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-dark-muted bg-dark-card rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg">Save</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
