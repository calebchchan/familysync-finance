import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/layout/BottomNav';
import LoginPage from './components/auth/LoginPage';
import LedgerView from './components/ledger/LedgerView';
import BudgetView from './components/budget/BudgetView';
import PoolsView from './components/pools/PoolsView';
import BalancesView from './components/balances/BalancesView';
import SettingsView from './components/settings/SettingsView';

function AppContent() {
  const { activeTab, loading, error, refreshData } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">💰</div>
          <p className="text-sm text-dark-muted">Connecting to Supabase…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-dark-bg">
        <div className="max-w-sm w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-dark-text mb-2">Database not ready</h2>
          <p className="text-sm text-dark-muted mb-4">
            Could not connect to Supabase. Make sure you've run the schema SQL in your
            Supabase dashboard (<code className="bg-dark-surface px-1 rounded">supabase-schema.sql</code>).
          </p>
          <details className="text-left mb-4">
            <summary className="text-xs text-dark-muted cursor-pointer">Error details</summary>
            <pre className="mt-2 text-xs bg-dark-surface rounded p-2 overflow-auto text-red-400 whitespace-pre-wrap">{error}</pre>
          </details>
          <button
            onClick={refreshData}
            className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <main className="max-w-lg mx-auto px-4 pt-2">
        {activeTab === 'ledger' && <LedgerView />}
        {activeTab === 'budgets' && <BudgetView />}
        {activeTab === 'pools' && <PoolsView />}
        {activeTab === 'balances' && <BalancesView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
      <BottomNav />
    </div>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">💰</div>
          <p className="text-sm text-dark-muted">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
