import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Layout() {
  const { shoppingItems } = useApp();
  const uncheckedCount = shoppingItems.filter((s) => !s.checked).length;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${
      isActive ? 'text-orange-500' : 'text-gray-500 hover:text-orange-400'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <span className="text-xl font-bold text-orange-500">🍳 レシピノート</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-24">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-2xl mx-auto flex justify-around">
          <NavLink to="/" end className={linkClass}>
            <span className="text-xl">🏠</span>
            <span>ホーム</span>
          </NavLink>
          <NavLink to="/plan" className={linkClass}>
            <span className="text-xl">📋</span>
            <span>作る予定</span>
          </NavLink>
          <NavLink to="/history" className={linkClass}>
            <span className="text-xl">📖</span>
            <span>記録</span>
          </NavLink>
          <NavLink to="/suggest" className={linkClass}>
            <span className="text-xl">✨</span>
            <span>AI提案</span>
          </NavLink>
          <NavLink to="/shopping" className={linkClass}>
            <span className="text-xl relative inline-block">
              🛒
              {uncheckedCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {uncheckedCount > 9 ? '9+' : uncheckedCount}
                </span>
              )}
            </span>
            <span>買い物</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
