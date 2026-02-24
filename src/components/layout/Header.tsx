import UserSwitcher from './UserSwitcher';

export default function Header() {
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">
          Family<span className="text-indigo-600">Sync</span>
        </h1>
        <UserSwitcher />
      </div>
    </header>
  );
}
