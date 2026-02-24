import { useApp } from '../../context/AppContext';
import type { UserId } from '../../types';

export default function UserSwitcher() {
  const { currentUser, switchUser, users } = useApp();

  return (
    <div className="flex items-center bg-gray-100 rounded-full p-1 gap-1">
      {users.map((u) => {
        const active = currentUser === u.id;
        return (
          <button
            key={u.id}
            onClick={() => switchUser(u.id as UserId)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              active
                ? u.id === 'husband'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-pink-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{u.avatar}</span>
            <span>{u.name}</span>
          </button>
        );
      })}
    </div>
  );
}
