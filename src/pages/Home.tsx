import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';

export default function Home() {
  const { recipes, cookedRecords, shoppingItems } = useApp();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const todayRecipes = recipes.filter((r) => r.scheduledDate === today);
  const upcoming = recipes
    .filter((r) => r.scheduledDate && r.scheduledDate > today)
    .sort((a, b) => a.scheduledDate!.localeCompare(b.scheduledDate!))
    .slice(0, 3);

  const recentCooked = cookedRecords.slice(0, 3);
  const unchecked = shoppingItems.filter((s) => !s.checked).length;

  return (
    <div className="space-y-6">
      {/* Today's recipes */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">今日の予定</h2>
        {todayRecipes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center text-gray-400 text-sm">
            今日の予定レシピはありません
            <br />
            <button
              onClick={() => navigate('/plan')}
              className="text-orange-500 mt-1 underline text-xs"
            >
              レシピを追加する
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {todayRecipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">近日の予定</h2>
          <div className="space-y-2">
            {upcoming.map((r) => (
              <RecipeCard key={r.id} recipe={r} showDate />
            ))}
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        <div
          className="bg-white rounded-xl border border-gray-100 p-4 text-center cursor-pointer hover:shadow-sm"
          onClick={() => navigate('/plan')}
        >
          <div className="text-3xl font-bold text-orange-500">{recipes.length}</div>
          <div className="text-xs text-gray-500 mt-1">作る予定</div>
        </div>
        <div
          className="bg-white rounded-xl border border-gray-100 p-4 text-center cursor-pointer hover:shadow-sm"
          onClick={() => navigate('/history')}
        >
          <div className="text-3xl font-bold text-orange-500">{cookedRecords.length}</div>
          <div className="text-xs text-gray-500 mt-1">作った記録</div>
        </div>
        <div
          className="bg-white rounded-xl border border-gray-100 p-4 text-center cursor-pointer hover:shadow-sm"
          onClick={() => navigate('/shopping')}
        >
          <div className="text-3xl font-bold text-orange-500">{unchecked}</div>
          <div className="text-xs text-gray-500 mt-1">買うもの</div>
        </div>
      </section>

      {/* Recent cooked */}
      {recentCooked.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">最近作った料理</h2>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-orange-500"
            >
              すべて見る
            </button>
          </div>
          <div className="space-y-2">
            {recentCooked.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                {r.photoBase64 ? (
                  <img
                    src={`data:image/jpeg;base64,${r.photoBase64}`}
                    alt={r.title}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-xl shrink-0">
                    🍴
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{r.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-yellow-400 text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    {r.calories && <span className="text-xs text-gray-400">{r.calories}kcal</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick add button */}
      <button
        onClick={() => navigate('/add-recipe')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg text-2xl flex items-center justify-center hover:bg-orange-600 transition-colors z-30"
      >
        ＋
      </button>
    </div>
  );
}
