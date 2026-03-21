import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  UserId,
  UserProfile,
  Transaction,
  Category,
  Account,
  AccountGroup,
  JointPool,
  Pledge,
  Budget,
  TabId,
} from '../types';
import { api } from '../services/mockData';
import { useAuth } from './AuthContext';

interface AppState {
  currentUser: UserId;
  users: UserProfile[];
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  accountGroups: AccountGroup[];
  pools: JointPool[];
  pledges: Pledge[];
  budgets: Budget[];
  activeTab: TabId;
  selectedMonth: Date;
  loading: boolean;
  error: string | null;
}

interface AppContextType extends AppState {
  switchUser: (id: UserId) => void;
  setActiveTab: (tab: TabId) => void;
  setSelectedMonth: (date: Date) => void;

  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addCategory: (c: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (c: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addAccount: (a: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (a: Account) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  addAccountGroup: (g: Omit<AccountGroup, 'id'>) => Promise<void>;
  updateAccountGroup: (g: AccountGroup) => Promise<void>;
  deleteAccountGroup: (id: string) => Promise<void>;

  addPool: (p: Omit<JointPool, 'id'>) => Promise<void>;
  updatePool: (p: JointPool) => Promise<void>;
  deletePool: (id: string) => Promise<void>;

  addPledge: (p: Omit<Pledge, 'id'>) => Promise<void>;
  deletePledge: (id: string) => Promise<void>;

  addBudget: (b: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (b: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  updateUser: (u: UserProfile) => Promise<void>;

  refreshData: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { userRole } = useAuth();

  const [state, setState] = useState<AppState>({
    currentUser: (userRole as UserId) || 'husband',
    users: [],
    transactions: [],
    categories: [],
    accounts: [],
    accountGroups: [],
    pools: [],
    pledges: [],
    budgets: [],
    activeTab: 'ledger',
    selectedMonth: new Date(2026, 1, 1), // Feb 2026
    loading: true,
    error: null,
  });

  // Sync currentUser with auth role
  useEffect(() => {
    if (userRole) {
      setState((s) => ({ ...s, currentUser: userRole }));
    }
  }, [userRole]);

  const refreshData = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [users, transactions, categories, accounts, accountGroups, pools, pledges, budgets] =
        await Promise.all([
          api.getUsers(),
          api.getTransactions(),
          api.getCategories(),
          api.getAccounts(),
          api.getAccountGroups(),
          api.getPools(),
          api.getPledges(),
          api.getBudgets(),
        ]);
      setState((s) => ({
        ...s,
        users,
        transactions,
        categories,
        accounts,
        accountGroups,
        pools,
        pledges,
        budgets,
        loading: false,
        error: null,
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const switchUser = (id: UserId) => setState((s) => ({ ...s, currentUser: id }));
  const setActiveTab = (tab: TabId) => setState((s) => ({ ...s, activeTab: tab }));
  const setSelectedMonth = (date: Date) => setState((s) => ({ ...s, selectedMonth: date }));

  const addTransaction = async (t: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx = await api.addTransaction(t);
    setState((s) => ({ ...s, transactions: [...s.transactions, newTx] }));
  };
  const updateTransaction = async (t: Transaction) => {
    await api.updateTransaction(t);
    setState((s) => ({ ...s, transactions: s.transactions.map((x) => (x.id === t.id ? t : x)) }));
  };
  const deleteTransaction = async (id: string) => {
    await api.deleteTransaction(id);
    setState((s) => ({ ...s, transactions: s.transactions.filter((x) => x.id !== id) }));
  };

  const addCategory = async (c: Omit<Category, 'id'>) => {
    const n = await api.addCategory(c);
    setState((s) => ({ ...s, categories: [...s.categories, n] }));
  };
  const updateCategory = async (c: Category) => {
    await api.updateCategory(c);
    setState((s) => ({ ...s, categories: s.categories.map((x) => (x.id === c.id ? c : x)) }));
  };
  const deleteCategory = async (id: string) => {
    await api.deleteCategory(id);
    setState((s) => ({ ...s, categories: s.categories.filter((x) => x.id !== id) }));
  };

  const addAccount = async (a: Omit<Account, 'id'>) => {
    const n = await api.addAccount(a);
    setState((s) => ({ ...s, accounts: [...s.accounts, n] }));
  };
  const updateAccount = async (a: Account) => {
    await api.updateAccount(a);
    setState((s) => ({ ...s, accounts: s.accounts.map((x) => (x.id === a.id ? a : x)) }));
  };
  const deleteAccount = async (id: string) => {
    await api.deleteAccount(id);
    setState((s) => ({ ...s, accounts: s.accounts.filter((x) => x.id !== id) }));
  };

  const addAccountGroup = async (g: Omit<AccountGroup, 'id'>) => {
    const n = await api.addAccountGroup(g);
    setState((s) => ({ ...s, accountGroups: [...s.accountGroups, n] }));
  };
  const updateAccountGroup = async (g: AccountGroup) => {
    await api.updateAccountGroup(g);
    setState((s) => ({ ...s, accountGroups: s.accountGroups.map((x) => (x.id === g.id ? g : x)) }));
  };
  const deleteAccountGroup = async (id: string) => {
    await api.deleteAccountGroup(id);
    setState((s) => ({ ...s, accountGroups: s.accountGroups.filter((x) => x.id !== id) }));
  };

  const addPool = async (p: Omit<JointPool, 'id'>) => {
    const n = await api.addPool(p);
    setState((s) => ({ ...s, pools: [...s.pools, n] }));
  };
  const updatePool = async (p: JointPool) => {
    await api.updatePool(p);
    setState((s) => ({ ...s, pools: s.pools.map((x) => (x.id === p.id ? p : x)) }));
  };
  const deletePool = async (id: string) => {
    await api.deletePool(id);
    setState((s) => ({ ...s, pools: s.pools.filter((x) => x.id !== id) }));
  };

  const addPledge = async (p: Omit<Pledge, 'id'>) => {
    const n = await api.addPledge(p);
    setState((s) => ({ ...s, pledges: [...s.pledges, n] }));
  };
  const deletePledge = async (id: string) => {
    await api.deletePledge(id);
    setState((s) => ({ ...s, pledges: s.pledges.filter((x) => x.id !== id) }));
  };

  const addBudget = async (b: Omit<Budget, 'id'>) => {
    const n = await api.addBudget(b);
    setState((s) => ({ ...s, budgets: [...s.budgets, n] }));
  };
  const updateBudget = async (b: Budget) => {
    await api.updateBudget(b);
    setState((s) => ({ ...s, budgets: s.budgets.map((x) => (x.id === b.id ? b : x)) }));
  };
  const deleteBudget = async (id: string) => {
    await api.deleteBudget(id);
    setState((s) => ({ ...s, budgets: s.budgets.filter((x) => x.id !== id) }));
  };

  const updateUser = async (u: UserProfile) => {
    await api.updateUser(u);
    setState((s) => ({ ...s, users: s.users.map((x) => (x.id === u.id ? u : x)) }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        switchUser,
        setActiveTab,
        setSelectedMonth,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addAccount,
        updateAccount,
        deleteAccount,
        addAccountGroup,
        updateAccountGroup,
        deleteAccountGroup,
        addPool,
        updatePool,
        deletePool,
        addPledge,
        deletePledge,
        addBudget,
        updateBudget,
        deleteBudget,
        updateUser,
        refreshData,
        resetAllData: async () => {
          await api.resetAllData();
          await refreshData();
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
