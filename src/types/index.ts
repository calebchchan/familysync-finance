export type UserId = 'husband' | 'wife';

export interface UserProfile {
  id: UserId;
  name: string;
  avatar: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  userId: UserId;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  accountId: string;
  toAccountId?: string; // for transfers
  poolId?: string; // if joint
  date: string; // ISO date string
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'income' | 'expense';
}

export interface AccountGroup {
  id: string;
  name: string;
  order: number;
}

export interface Account {
  id: string;
  userId: UserId;
  name: string;
  groupId: string;
  balance: number;
  icon: string;
}

export interface JointPool {
  id: string;
  name: string;
  target: number;
  icon: string;
  order: number;
}

export interface Pledge {
  id: string;
  userId: UserId;
  poolId: string;
  amount: number;
  date: string;
  recurring?: boolean;
  recurringPeriod?: 'weekly' | 'monthly';
}

export type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Budget {
  id: string;
  userId: UserId;
  categoryId: string;
  limit: number;
  period: BudgetPeriod;
}

export interface LedgerSummary {
  personalIncome: number;
  personalExpense: number;
  netPersonal: number;
  netTotal: number;
}

export interface PoolSummary {
  poolId: string;
  totalPledged: number;
  totalSpent: number;
  available: number;
  target: number;
}

export type TabId = 'ledger' | 'budgets' | 'pools' | 'balances' | 'settings';

export interface RecurringTransaction {
  id: string;
  userId: UserId;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  poolId?: string;
  period: 'weekly' | 'monthly';
}
