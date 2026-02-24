import { v4 as uuid } from 'uuid';
import { supabase } from '../lib/supabase';
import type {
  UserProfile,
  Transaction,
  Category,
  Account,
  AccountGroup,
  JointPool,
  Pledge,
  Budget,
} from '../types';

// ── DB row types (snake_case) ──────────────────────────
interface DbTransaction {
  id: string; user_id: string; type: string; amount: number;
  description: string; category_id: string | null; account_id: string | null;
  to_account_id: string | null; pool_id: string | null;
  date: string; created_at: string;
}
interface DbAccount {
  id: string; user_id: string; name: string;
  group_id: string | null; balance: number; icon: string;
}
interface DbAccountGroup { id: string; name: string; sort_order: number; }
interface DbPool { id: string; name: string; target: number; icon: string; sort_order: number; }
interface DbPledge {
  id: string; user_id: string; pool_id: string | null; amount: number;
  date: string; recurring: boolean | null; recurring_period: string | null;
}
interface DbBudget {
  id: string; user_id: string; category_id: string | null;
  budget_limit: number; period: string;
}
interface DbCategory { id: string; name: string; icon: string; type: string; }
interface DbProfile { id: string; name: string; avatar: string; }

// ── Mappers: DB → TypeScript ───────────────────────────
const mapTx = (r: DbTransaction): Transaction => ({
  id: r.id, userId: r.user_id as 'husband' | 'wife',
  type: r.type as Transaction['type'], amount: r.amount,
  description: r.description, categoryId: r.category_id ?? '',
  accountId: r.account_id ?? '', toAccountId: r.to_account_id ?? undefined,
  poolId: r.pool_id ?? undefined, date: r.date, createdAt: r.created_at,
});
const mapAccount = (r: DbAccount): Account => ({
  id: r.id, userId: r.user_id as 'husband' | 'wife', name: r.name,
  groupId: r.group_id ?? '', balance: r.balance, icon: r.icon,
});
const mapGroup = (r: DbAccountGroup): AccountGroup => ({
  id: r.id, name: r.name, order: r.sort_order,
});
const mapPool = (r: DbPool): JointPool => ({
  id: r.id, name: r.name, target: r.target, icon: r.icon, order: r.sort_order,
});
const mapPledge = (r: DbPledge): Pledge => ({
  id: r.id, userId: r.user_id as 'husband' | 'wife',
  poolId: r.pool_id ?? '', amount: r.amount, date: r.date,
  recurring: r.recurring ?? undefined,
  recurringPeriod: (r.recurring_period as Pledge['recurringPeriod']) ?? undefined,
});
const mapBudget = (r: DbBudget): Budget => ({
  id: r.id, userId: r.user_id as 'husband' | 'wife',
  categoryId: r.category_id ?? '', limit: r.budget_limit,
  period: r.period as Budget['period'],
});
const mapCategory = (r: DbCategory): Category => ({
  id: r.id, name: r.name, icon: r.icon, type: r.type as Category['type'],
});
const mapProfile = (r: DbProfile): UserProfile => ({
  id: r.id as UserProfile['id'], name: r.name, avatar: r.avatar,
});

// ── Seed data ──────────────────────────────────────────
const seedUsers: DbProfile[] = [
  { id: 'husband', name: 'Caleb', avatar: '👨' },
  { id: 'wife', name: 'Rachel', avatar: '👩' },
];

const seedCategories: DbCategory[] = [
  { id: 'cat-salary', name: 'Salary', icon: '💰', type: 'income' },
  { id: 'cat-freelance', name: 'Freelance', icon: '💻', type: 'income' },
  { id: 'cat-investment', name: 'Investment', icon: '📈', type: 'income' },
  { id: 'cat-gift-in', name: 'Gift Received', icon: '🎁', type: 'income' },
  { id: 'cat-groceries', name: 'Groceries', icon: '🛒', type: 'expense' },
  { id: 'cat-dining', name: 'Dining', icon: '🍽️', type: 'expense' },
  { id: 'cat-transport', name: 'Transport', icon: '🚗', type: 'expense' },
  { id: 'cat-utilities', name: 'Utilities', icon: '💡', type: 'expense' },
  { id: 'cat-rent', name: 'Rent', icon: '🏠', type: 'expense' },
  { id: 'cat-entertainment', name: 'Entertainment', icon: '🎬', type: 'expense' },
  { id: 'cat-health', name: 'Health', icon: '🏥', type: 'expense' },
  { id: 'cat-clothing', name: 'Clothing', icon: '👕', type: 'expense' },
  { id: 'cat-travel', name: 'Travel', icon: '✈️', type: 'expense' },
  { id: 'cat-subscriptions', name: 'Subscriptions', icon: '📱', type: 'expense' },
  { id: 'cat-personal', name: 'Personal Care', icon: '💅', type: 'expense' },
  { id: 'cat-education', name: 'Education', icon: '📚', type: 'expense' },
];

const seedAccountGroups: DbAccountGroup[] = [
  { id: 'grp-bank', name: 'Bank Accounts', sort_order: 1 },
  { id: 'grp-credit', name: 'Credit Cards', sort_order: 2 },
  { id: 'grp-wallet', name: 'Wallets & Cash', sort_order: 3 },
];

const seedAccounts: DbAccount[] = [
  { id: 'acc-h-checking', user_id: 'husband', name: 'Checking', group_id: 'grp-bank', balance: 4250, icon: '🏦' },
  { id: 'acc-h-savings', user_id: 'husband', name: 'Savings', group_id: 'grp-bank', balance: 12800, icon: '🏦' },
  { id: 'acc-h-credit', user_id: 'husband', name: 'Visa Card', group_id: 'grp-credit', balance: -420, icon: '💳' },
  { id: 'acc-h-wallet', user_id: 'husband', name: 'Cash Wallet', group_id: 'grp-wallet', balance: 180, icon: '👛' },
  { id: 'acc-w-checking', user_id: 'wife', name: 'Checking', group_id: 'grp-bank', balance: 3800, icon: '🏦' },
  { id: 'acc-w-savings', user_id: 'wife', name: 'Savings', group_id: 'grp-bank', balance: 15200, icon: '🏦' },
  { id: 'acc-w-credit', user_id: 'wife', name: 'Amex Card', group_id: 'grp-credit', balance: -290, icon: '💳' },
  { id: 'acc-w-wallet', user_id: 'wife', name: 'Cash Wallet', group_id: 'grp-wallet', balance: 95, icon: '👛' },
];

const seedPools: DbPool[] = [
  { id: 'pool-rent', name: 'Joint Rent', target: 2400, icon: '🏠', sort_order: 1 },
  { id: 'pool-travel', name: 'Europe Trip', target: 8000, icon: '✈️', sort_order: 2 },
  { id: 'pool-emergency', name: 'Emergency Fund', target: 10000, icon: '🛡️', sort_order: 3 },
  { id: 'pool-groceries', name: 'Joint Groceries', target: 800, icon: '🛒', sort_order: 4 },
];

const seedPledges: DbPledge[] = [
  { id: 'pl-1', user_id: 'husband', pool_id: 'pool-rent', amount: 1200, date: '2026-01-01', recurring: true, recurring_period: 'monthly' },
  { id: 'pl-2', user_id: 'wife', pool_id: 'pool-rent', amount: 1200, date: '2026-01-01', recurring: true, recurring_period: 'monthly' },
  { id: 'pl-3', user_id: 'husband', pool_id: 'pool-travel', amount: 500, date: '2026-01-15', recurring: null, recurring_period: null },
  { id: 'pl-4', user_id: 'wife', pool_id: 'pool-travel', amount: 500, date: '2026-01-15', recurring: null, recurring_period: null },
  { id: 'pl-5', user_id: 'husband', pool_id: 'pool-travel', amount: 500, date: '2026-02-15', recurring: null, recurring_period: null },
  { id: 'pl-6', user_id: 'wife', pool_id: 'pool-travel', amount: 600, date: '2026-02-15', recurring: null, recurring_period: null },
  { id: 'pl-7', user_id: 'husband', pool_id: 'pool-emergency', amount: 300, date: '2026-01-05', recurring: null, recurring_period: null },
  { id: 'pl-8', user_id: 'wife', pool_id: 'pool-emergency', amount: 400, date: '2026-01-05', recurring: null, recurring_period: null },
  { id: 'pl-9', user_id: 'husband', pool_id: 'pool-emergency', amount: 300, date: '2026-02-05', recurring: null, recurring_period: null },
  { id: 'pl-10', user_id: 'wife', pool_id: 'pool-emergency', amount: 400, date: '2026-02-05', recurring: null, recurring_period: null },
  { id: 'pl-11', user_id: 'husband', pool_id: 'pool-groceries', amount: 400, date: '2026-01-01', recurring: true, recurring_period: 'monthly' },
  { id: 'pl-12', user_id: 'wife', pool_id: 'pool-groceries', amount: 400, date: '2026-01-01', recurring: true, recurring_period: 'monthly' },
];

const seedBudgets: DbBudget[] = [
  { id: 'bud-1', user_id: 'husband', category_id: 'cat-dining', budget_limit: 400, period: 'monthly' },
  { id: 'bud-2', user_id: 'husband', category_id: 'cat-groceries', budget_limit: 300, period: 'monthly' },
  { id: 'bud-3', user_id: 'husband', category_id: 'cat-entertainment', budget_limit: 150, period: 'monthly' },
  { id: 'bud-4', user_id: 'husband', category_id: 'cat-transport', budget_limit: 200, period: 'monthly' },
  { id: 'bud-5', user_id: 'husband', category_id: 'cat-subscriptions', budget_limit: 50, period: 'monthly' },
  { id: 'bud-6', user_id: 'wife', category_id: 'cat-dining', budget_limit: 350, period: 'monthly' },
  { id: 'bud-7', user_id: 'wife', category_id: 'cat-groceries', budget_limit: 250, period: 'monthly' },
  { id: 'bud-8', user_id: 'wife', category_id: 'cat-clothing', budget_limit: 200, period: 'monthly' },
  { id: 'bud-9', user_id: 'wife', category_id: 'cat-health', budget_limit: 100, period: 'monthly' },
  { id: 'bud-10', user_id: 'wife', category_id: 'cat-personal', budget_limit: 120, period: 'monthly' },
];

function makeSeedTransactions(): DbTransaction[] {
  const t = (
    o: Pick<DbTransaction, 'user_id' | 'type' | 'amount' | 'description' | 'category_id' | 'account_id' | 'date'> &
      Partial<Pick<DbTransaction, 'to_account_id' | 'pool_id'>>
  ): DbTransaction => ({
    id: uuid(), to_account_id: null, pool_id: null, created_at: o.date, ...o,
  });

  return [
    // ── January 2026 — Caleb ──
    t({ user_id: 'husband', type: 'income', amount: 5500, description: 'Monthly Salary', category_id: 'cat-salary', account_id: 'acc-h-checking', date: '2026-01-01' }),
    t({ user_id: 'husband', type: 'expense', amount: 1200, description: 'Rent Payment', category_id: 'cat-rent', account_id: 'acc-h-checking', date: '2026-01-02', pool_id: 'pool-rent' }),
    t({ user_id: 'husband', type: 'expense', amount: 85, description: 'Weekly Groceries', category_id: 'cat-groceries', account_id: 'acc-h-checking', date: '2026-01-04', pool_id: 'pool-groceries' }),
    t({ user_id: 'husband', type: 'expense', amount: 45, description: 'Lunch with team', category_id: 'cat-dining', account_id: 'acc-h-credit', date: '2026-01-06' }),
    t({ user_id: 'husband', type: 'expense', amount: 120, description: 'Car fuel & maintenance', category_id: 'cat-transport', account_id: 'acc-h-checking', date: '2026-01-08' }),
    t({ user_id: 'husband', type: 'expense', amount: 15, description: 'Netflix', category_id: 'cat-subscriptions', account_id: 'acc-h-credit', date: '2026-01-10' }),
    t({ user_id: 'husband', type: 'expense', amount: 92, description: 'Weekly Groceries', category_id: 'cat-groceries', account_id: 'acc-h-checking', date: '2026-01-11', pool_id: 'pool-groceries' }),
    t({ user_id: 'husband', type: 'expense', amount: 65, description: 'Date Night Dinner', category_id: 'cat-dining', account_id: 'acc-h-credit', date: '2026-01-14' }),
    t({ user_id: 'husband', type: 'income', amount: 800, description: 'Freelance Project', category_id: 'cat-freelance', account_id: 'acc-h-checking', date: '2026-01-15' }),
    t({ user_id: 'husband', type: 'expense', amount: 78, description: 'Weekly Groceries', category_id: 'cat-groceries', account_id: 'acc-h-checking', date: '2026-01-18', pool_id: 'pool-groceries' }),
    t({ user_id: 'husband', type: 'expense', amount: 35, description: 'Movie tickets', category_id: 'cat-entertainment', account_id: 'acc-h-wallet', date: '2026-01-20' }),
    t({ user_id: 'husband', type: 'expense', amount: 88, description: 'Weekly Groceries', category_id: 'cat-groceries', account_id: 'acc-h-checking', date: '2026-01-25', pool_id: 'pool-groceries' }),
    t({ user_id: 'husband', type: 'transfer', amount: 500, description: 'To Savings', category_id: 'cat-salary', account_id: 'acc-h-checking', to_account_id: 'acc-h-savings', date: '2026-01-28' }),
    // ── January 2026 — Rachel ──
    t({ user_id: 'wife', type: 'income', amount: 4800, description: 'Monthly Salary', category_id: 'cat-salary', account_id: 'acc-w-checking', date: '2026-01-01' }),
    t({ user_id: 'wife', type: 'expense', amount: 1200, description: 'Rent Payment', category_id: 'cat-rent', account_id: 'acc-w-checking', date: '2026-01-02', pool_id: 'pool-rent' }),
    t({ user_id: 'wife', type: 'expense', amount: 75, description: 'Yoga studio membership', category_id: 'cat-health', account_id: 'acc-w-checking', date: '2026-01-03' }),
    t({ user_id: 'wife', type: 'expense', amount: 92, description: 'Weekly Groceries', category_id: 'cat-groceries', account_id: 'acc-w-checking', date: '2026-01-04', pool_id: 'pool-groceries' }),
    t({ user_id: 'wife', type: 'expense', amount: 55, description: 'New blouse', category_id: 'cat-clothing', account_id: 'acc-w-credit', date: '2026-01-07' }),
    t({ user_id: 'wife', type: 'expense', amount: 38, description: 'Brunch with friends', category_id: 'cat-dining', account_id: 'acc-w-wallet', date: '2026-01-09' }),
    t({ user_id: 'wife', type: 'expense', amount: 80, description: 'Weekly Groceries', category_id: 'cat-groceries', account_id: 'acc-w-checking', date: '2026-01-11', pool_id: 'pool-groceries' }),
    t({ user_id: 'wife', type: 'expense', amount: 42, description: 'Skincare products', category_id: 'cat-personal', account_id: 'acc-w-credit', date: '2026-01-13' }),
    t({ user_id: 'wife', type: 'expense', amount: 65, description: 'Date Night Dinner', category_id: 'cat-dining', account_id: 'acc-w-wallet', date: '2026-01-14' }),
    t({ user_id: 'wife', type: 'income', amount: 200, description: 'Etsy sales', category_id: 'cat-freelance', account_id: 'acc-w-checking', date: '2026-01-16' }),
    t({ user_id: 'wife', type: 'expense', amount: 95, description: 'Weekly Groceries', category_id: 'cat-groceries', account_id: 'acc-w-checking', date: '2026-01-18', pool_id: 'pool-groceries' }),
    t({ user_id: 'wife', type: 'expense', amount: 130, description: 'Winter boots', category_id: 'cat-clothing', account_id: 'acc-w-credit', date: '2026-01-22' }),
    t({ user_id: 'wife', type: 'expense', amount: 70, description: 'Weekly Groceries', category_id: 'cat-groceries', account_id: 'acc-w-checking', date: '2026-01-25', pool_id: 'pool-groceries' }),
    t({ user_id: 'wife', type: 'transfer', amount: 600, description: 'To Savings', category_id: 'cat-salary', account_id: 'acc-w-checking', to_account_id: 'acc-w-savings', date: '2026-01-28' }),
    // ── February 2026 — Caleb ──
    t({ user_id: 'husband', type: 'income', amount: 5500, description: 'Monthly Salary', category_id: 'cat-salary', account_id: 'acc-h-checking', date: '2026-02-01' }),
    t({ user_id: 'husband', type: 'expense', amount: 1200, description: 'Rent Payment', category_id: 'cat-rent', account_id: 'acc-h-checking', date: '2026-02-02', pool_id: 'pool-rent' }),
    t({ user_id: 'husband', type: 'expense', amount: 95, description: 'Weekly Groceries', category_id: 'cat-groceries', account_id: 'acc-h-checking', date: '2026-02-03', pool_id: 'pool-groceries' }),
    t({ user_id: 'husband', type: 'expense', amount: 52, description: 'Pizza with friends', category_id: 'cat-dining', account_id: 'acc-h-credit', date: '2026-02-05' }),
    t({ user_id: 'husband', type: 'expense', amount: 110, description: 'Electric bill', category_id: 'cat-utilities', account_id: 'acc-h-checking', date: '2026-02-06', pool_id: 'pool-rent' }),
    t({ user_id: 'husband', type: 'expense', amount: 88, description: 'Weekly Groceries', category_id: 'cat-groceries', account_id: 'acc-h-checking', date: '2026-02-10', pool_id: 'pool-groceries' }),
    t({ user_id: 'husband', type: 'expense', amount: 75, description: 'Valentine Dinner', category_id: 'cat-dining', account_id: 'acc-h-credit', date: '2026-02-14' }),
    t({ user_id: 'husband', type: 'expense', amount: 45, description: 'Concert tickets', category_id: 'cat-entertainment', account_id: 'acc-h-wallet', date: '2026-02-15' }),
    t({ user_id: 'husband', type: 'expense', amount: 82, description: 'Weekly Groceries', category_id: 'cat-groceries', account_id: 'acc-h-checking', date: '2026-02-17', pool_id: 'pool-groceries' }),
    t({ user_id: 'husband', type: 'expense', amount: 60, description: 'Gas', category_id: 'cat-transport', account_id: 'acc-h-checking', date: '2026-02-19' }),
    t({ user_id: 'husband', type: 'income', amount: 1200, description: 'Freelance Project', category_id: 'cat-freelance', account_id: 'acc-h-checking', date: '2026-02-20' }),
    t({ user_id: 'husband', type: 'expense', amount: 15, description: 'Netflix', category_id: 'cat-subscriptions', account_id: 'acc-h-credit', date: '2026-02-22' }),
    // ── February 2026 — Rachel ──
    t({ user_id: 'wife', type: 'income', amount: 4800, description: 'Monthly Salary', category_id: 'cat-salary', account_id: 'acc-w-checking', date: '2026-02-01' }),
    t({ user_id: 'wife', type: 'expense', amount: 1200, description: 'Rent Payment', category_id: 'cat-rent', account_id: 'acc-w-checking', date: '2026-02-02', pool_id: 'pool-rent' }),
    t({ user_id: 'wife', type: 'expense', amount: 88, description: 'Weekly Groceries', category_id: 'cat-groceries', account_id: 'acc-w-checking', date: '2026-02-03', pool_id: 'pool-groceries' }),
    t({ user_id: 'wife', type: 'expense', amount: 75, description: 'Yoga studio', category_id: 'cat-health', account_id: 'acc-w-checking', date: '2026-02-04' }),
    t({ user_id: 'wife', type: 'expense', amount: 48, description: 'Sushi lunch', category_id: 'cat-dining', account_id: 'acc-w-wallet', date: '2026-02-06' }),
    t({ user_id: 'wife', type: 'expense', amount: 90, description: 'Weekly Groceries', category_id: 'cat-groceries', account_id: 'acc-w-checking', date: '2026-02-10', pool_id: 'pool-groceries' }),
    t({ user_id: 'wife', type: 'expense', amount: 85, description: 'Spring dress', category_id: 'cat-clothing', account_id: 'acc-w-credit', date: '2026-02-12' }),
    t({ user_id: 'wife', type: 'expense', amount: 60, description: 'Valentine Dinner', category_id: 'cat-dining', account_id: 'acc-w-credit', date: '2026-02-14' }),
    t({ user_id: 'wife', type: 'expense', amount: 78, description: 'Weekly Groceries', category_id: 'cat-groceries', account_id: 'acc-w-checking', date: '2026-02-17', pool_id: 'pool-groceries' }),
    t({ user_id: 'wife', type: 'income', amount: 350, description: 'Etsy sales', category_id: 'cat-freelance', account_id: 'acc-w-checking', date: '2026-02-18' }),
    t({ user_id: 'wife', type: 'expense', amount: 55, description: 'Hair salon', category_id: 'cat-personal', account_id: 'acc-w-checking', date: '2026-02-20' }),
    t({ user_id: 'wife', type: 'expense', amount: 35, description: 'Face cream', category_id: 'cat-personal', account_id: 'acc-w-credit', date: '2026-02-21' }),
    t({ user_id: 'wife', type: 'transfer', amount: 500, description: 'To Savings', category_id: 'cat-salary', account_id: 'acc-w-checking', to_account_id: 'acc-w-savings', date: '2026-02-23' }),
  ];
}

// ── Auto-seed on first load ─────────────────────────────
// Resolves once we've confirmed Supabase has data (or seeded it).
const initPromise: Promise<void> = (async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('[FamilySync] Supabase connection error:', error.message);
      return;
    }

    if (data && data.length > 0) return; // already seeded

    // First load: insert all seed data
    const transactions = makeSeedTransactions();
    const results = await Promise.all([
      supabase.from('profiles').upsert(seedUsers),
      supabase.from('categories').upsert(seedCategories),
      supabase.from('account_groups').upsert(seedAccountGroups),
      supabase.from('accounts').upsert(seedAccounts),
      supabase.from('joint_pools').upsert(seedPools),
      supabase.from('pledges').upsert(seedPledges),
      supabase.from('budgets').upsert(seedBudgets),
      supabase.from('transactions').upsert(transactions),
    ]);

    const firstErr = results.find((r) => r.error);
    if (firstErr?.error) {
      console.error('[FamilySync] Seeding error:', firstErr.error.message);
    }
  } catch (e) {
    console.error('[FamilySync] Unexpected init error:', e);
  }
})();

// ── Helper: throw on Supabase errors ──────────────────
function check<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

// ── API (Supabase-backed) ──────────────────────────────
export const api = {
  // ── Transactions ──
  async getTransactions(): Promise<Transaction[]> {
    await initPromise;
    const rows = check(await supabase.from('transactions').select('*').order('date', { ascending: false }));
    return (rows as DbTransaction[]).map(mapTx);
  },
  async addTransaction(t: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const row: DbTransaction = {
      id: uuid(), user_id: t.userId, type: t.type, amount: t.amount,
      description: t.description, category_id: t.categoryId, account_id: t.accountId,
      to_account_id: t.toAccountId ?? null, pool_id: t.poolId ?? null,
      date: t.date, created_at: new Date().toISOString(),
    };
    check(await supabase.from('transactions').insert(row));
    return mapTx(row);
  },
  async updateTransaction(t: Transaction): Promise<Transaction> {
    const row: DbTransaction = {
      id: t.id, user_id: t.userId, type: t.type, amount: t.amount,
      description: t.description, category_id: t.categoryId, account_id: t.accountId,
      to_account_id: t.toAccountId ?? null, pool_id: t.poolId ?? null,
      date: t.date, created_at: t.createdAt,
    };
    check(await supabase.from('transactions').update(row).eq('id', t.id));
    return t;
  },
  async deleteTransaction(id: string): Promise<void> {
    check(await supabase.from('transactions').delete().eq('id', id));
  },

  // ── Categories ──
  async getCategories(): Promise<Category[]> {
    await initPromise;
    const rows = check(await supabase.from('categories').select('*'));
    return (rows as DbCategory[]).map(mapCategory);
  },
  async addCategory(c: Omit<Category, 'id'>): Promise<Category> {
    const row: DbCategory = { id: uuid(), ...c };
    check(await supabase.from('categories').insert(row));
    return mapCategory(row);
  },
  async updateCategory(c: Category): Promise<Category> {
    check(await supabase.from('categories').update(c).eq('id', c.id));
    return c;
  },
  async deleteCategory(id: string): Promise<void> {
    check(await supabase.from('categories').delete().eq('id', id));
  },

  // ── Accounts ──
  async getAccounts(): Promise<Account[]> {
    await initPromise;
    const rows = check(await supabase.from('accounts').select('*'));
    return (rows as DbAccount[]).map(mapAccount);
  },
  async addAccount(a: Omit<Account, 'id'>): Promise<Account> {
    const row: DbAccount = { id: uuid(), user_id: a.userId, name: a.name, group_id: a.groupId, balance: a.balance, icon: a.icon };
    check(await supabase.from('accounts').insert(row));
    return mapAccount(row);
  },
  async updateAccount(a: Account): Promise<Account> {
    const row: DbAccount = { id: a.id, user_id: a.userId, name: a.name, group_id: a.groupId, balance: a.balance, icon: a.icon };
    check(await supabase.from('accounts').update(row).eq('id', a.id));
    return a;
  },
  async deleteAccount(id: string): Promise<void> {
    check(await supabase.from('accounts').delete().eq('id', id));
  },

  // ── Account Groups ──
  async getAccountGroups(): Promise<AccountGroup[]> {
    await initPromise;
    const rows = check(await supabase.from('account_groups').select('*').order('sort_order'));
    return (rows as DbAccountGroup[]).map(mapGroup);
  },
  async addAccountGroup(g: Omit<AccountGroup, 'id'>): Promise<AccountGroup> {
    const row: DbAccountGroup = { id: uuid(), name: g.name, sort_order: g.order };
    check(await supabase.from('account_groups').insert(row));
    return mapGroup(row);
  },
  async updateAccountGroup(g: AccountGroup): Promise<AccountGroup> {
    const row: DbAccountGroup = { id: g.id, name: g.name, sort_order: g.order };
    check(await supabase.from('account_groups').update(row).eq('id', g.id));
    return g;
  },
  async deleteAccountGroup(id: string): Promise<void> {
    check(await supabase.from('account_groups').delete().eq('id', id));
  },

  // ── Pools ──
  async getPools(): Promise<JointPool[]> {
    await initPromise;
    const rows = check(await supabase.from('joint_pools').select('*').order('sort_order'));
    return (rows as DbPool[]).map(mapPool);
  },
  async addPool(p: Omit<JointPool, 'id'>): Promise<JointPool> {
    const row: DbPool = { id: uuid(), name: p.name, target: p.target, icon: p.icon, sort_order: p.order };
    check(await supabase.from('joint_pools').insert(row));
    return mapPool(row);
  },
  async updatePool(p: JointPool): Promise<JointPool> {
    const row: DbPool = { id: p.id, name: p.name, target: p.target, icon: p.icon, sort_order: p.order };
    check(await supabase.from('joint_pools').update(row).eq('id', p.id));
    return p;
  },
  async deletePool(id: string): Promise<void> {
    check(await supabase.from('joint_pools').delete().eq('id', id));
  },

  // ── Pledges ──
  async getPledges(): Promise<Pledge[]> {
    await initPromise;
    const rows = check(await supabase.from('pledges').select('*'));
    return (rows as DbPledge[]).map(mapPledge);
  },
  async addPledge(p: Omit<Pledge, 'id'>): Promise<Pledge> {
    const row: DbPledge = {
      id: uuid(), user_id: p.userId, pool_id: p.poolId ?? null,
      amount: p.amount, date: p.date,
      recurring: p.recurring ?? null, recurring_period: p.recurringPeriod ?? null,
    };
    check(await supabase.from('pledges').insert(row));
    return mapPledge(row);
  },
  async deletePledge(id: string): Promise<void> {
    check(await supabase.from('pledges').delete().eq('id', id));
  },

  // ── Budgets ──
  async getBudgets(): Promise<Budget[]> {
    await initPromise;
    const rows = check(await supabase.from('budgets').select('*'));
    return (rows as DbBudget[]).map(mapBudget);
  },
  async addBudget(b: Omit<Budget, 'id'>): Promise<Budget> {
    const row: DbBudget = {
      id: uuid(), user_id: b.userId, category_id: b.categoryId,
      budget_limit: b.limit, period: b.period,
    };
    check(await supabase.from('budgets').insert(row));
    return mapBudget(row);
  },
  async updateBudget(b: Budget): Promise<Budget> {
    const row: DbBudget = {
      id: b.id, user_id: b.userId, category_id: b.categoryId,
      budget_limit: b.limit, period: b.period,
    };
    check(await supabase.from('budgets').update(row).eq('id', b.id));
    return b;
  },
  async deleteBudget(id: string): Promise<void> {
    check(await supabase.from('budgets').delete().eq('id', id));
  },

  // ── Users ──
  async getUsers(): Promise<UserProfile[]> {
    await initPromise;
    const rows = check(await supabase.from('profiles').select('*'));
    return (rows as DbProfile[]).map(mapProfile);
  },
  async updateUser(u: UserProfile): Promise<UserProfile> {
    const row: DbProfile = { id: u.id, name: u.name, avatar: u.avatar };
    check(await supabase.from('profiles').update(row).eq('id', u.id));
    return u;
  },

  // ── Reset to seed data ──
  async resetAllData(): Promise<void> {
    // Delete in reverse-dependency order
    await Promise.all([
      supabase.from('transactions').delete().neq('id', ''),
      supabase.from('pledges').delete().neq('id', ''),
      supabase.from('budgets').delete().neq('id', ''),
    ]);
    await Promise.all([
      supabase.from('accounts').delete().neq('id', ''),
    ]);
    await Promise.all([
      supabase.from('account_groups').delete().neq('id', ''),
      supabase.from('joint_pools').delete().neq('id', ''),
      supabase.from('categories').delete().neq('id', ''),
      supabase.from('profiles').delete().neq('id', ''),
    ]);

    const transactions = makeSeedTransactions();
    await Promise.all([
      supabase.from('profiles').upsert(seedUsers),
      supabase.from('categories').upsert(seedCategories),
      supabase.from('account_groups').upsert(seedAccountGroups),
      supabase.from('joint_pools').upsert(seedPools),
    ]);
    await Promise.all([
      supabase.from('accounts').upsert(seedAccounts),
      supabase.from('pledges').upsert(seedPledges),
      supabase.from('budgets').upsert(seedBudgets),
      supabase.from('transactions').upsert(transactions),
    ]);
  },
};
