import { AppProvider, useApp } from './context/AppContext';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import LedgerView from './components/ledger/LedgerView';
import BudgetView from './components/budget/BudgetView';
import PoolsView from './components/pools/PoolsView';
import BalancesView from './components/balances/BalancesView';
import SettingsView from './components/settings/SettingsView';

function AppContent() {
  const { activeTab, loading, error, refreshData } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">💰</div>
          <p className="text-sm text-gray-400">Connecting to Supabase…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Database not ready</h2>
          <p className="text-sm text-gray-500 mb-4">
            Could not connect to Supabase. Make sure you've run the schema SQL in your
            Supabase dashboard (<code className="bg-gray-100 px-1 rounded">supabase-schema.sql</code>).
          </p>
          <details className="text-left mb-4">
            <summary className="text-xs text-gray-400 cursor-pointer">Error details</summary>
            <pre className="mt-2 text-xs bg-gray-100 rounded p-2 overflow-auto text-red-600 whitespace-pre-wrap">{error}</pre>
          </details>
          <button
            onClick={refreshData}
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <main className="max-w-lg mx-auto px-4 pt-4">
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

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
