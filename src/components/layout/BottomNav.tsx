import { useApp } from '../../context/AppContext';
import type { TabId } from '../../types';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'ledger', label: 'Ledger', icon: '📒' },
  { id: 'budgets', label: 'Budgets', icon: '📊' },
  { id: 'pools', label: 'Pools', icon: '🤝' },
  { id: 'balances', label: 'Balances', icon: '💰' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function BottomNav() {
  const { activeTab, setActiveTab, currentUser } = useApp();
  const accent = currentUser === 'husband' ? 'text-blue-600' : 'text-pink-600';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="max-w-lg mx-auto flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors ${
              activeTab === tab.id ? accent : 'text-gray-400'
            }`}
          >
            <span className="text-xl mb-0.5">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
