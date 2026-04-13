import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';

type SortKey = 'createdAt' | 'scheduledDate' | 'title';

export default function PlanList() {
  const { recipes } = useApp();
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortKey>('createdAt');
  const [search, setSearch] = useState('');

  const sorted = [...recipes]
    .filter((r) => r.title.includes(search))
    .sort((a, b) => {
      if (sort === 'scheduledDate') {
        const da = a.scheduledDate ?? '9999';
        const db = b.scheduledDate ?? '9999';
        return da.localeCompare(db);
      }
      if (sort === 'title') return a.title.localeCompare(b.title);
      return b.createdAt.localeCompare(a.createdAt);
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">作るレシピ一覧</h1>
        <button
          onClick={() => navigate('/add-recipe')}
          className="bg-orange-500 text-white text-sm px-4 py-2 rounded-full font-medium hover:bg-orange-600"
        >
          ＋ 追加
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="レシピ名で検索..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
      />

      {/* Sort */}
      <div className="flex gap-2">
        {(['createdAt', 'scheduledDate', 'title'] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              sort === key ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {key === 'createdAt' ? '追加順' : key === 'scheduledDate' ? '予定日順' : '名前順'}
          </button>
        ))}
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📋</div>
          <p>{search ? '検索結果がありません' : 'レシピがまだありません'}</p>
          {!search && (
            <button
              onClick={() => navigate('/add-recipe')}
              className="mt-3 text-orange-500 underline text-sm"
            >
              最初のレシピを追加する
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((r) => (
            <RecipeCard key={r.id} recipe={r} showDate />
          ))}
        </div>
      )}
    </div>
  );
}
