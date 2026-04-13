import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { AISuggestedRecipe, Recipe, Ingredient } from '../types';
import { suggestRecipes } from '../services/claude';

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function AISuggestions() {
  const { cookedRecords, shoppingItems, addRecipe } = useApp();
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestedRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<number | null>(null);

  const shoppingIngredients: Ingredient[] = shoppingItems.map((s) => ({
    id: s.id,
    name: s.name,
    amount: s.amount,
    inShoppingList: true,
  }));

  const handleSuggest = async () => {
    setError('');
    setLoading(true);
    setSuggestions([]);
    setRegistered(new Set());
    setExpanded(null);
    try {
      const results = await suggestRecipes(keyword, cookedRecords, shoppingIngredients);
      setSuggestions(results);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'レシピ提案の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (idx: number, suggestion: AISuggestedRecipe) => {
    const recipe: Recipe = {
      id: genId(),
      title: suggestion.title,
      ingredients: suggestion.ingredients.map((ing) => ({
        id: genId(),
        name: ing.name,
        amount: ing.amount,
        inShoppingList: false,
      })),
      steps: suggestion.steps,
      createdAt: new Date().toISOString(),
    };
    addRecipe(recipe);
    setRegistered((prev) => new Set(prev).add(idx));
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800">AIレシピ提案</h1>

      <div className="bg-orange-50 rounded-2xl p-4 text-sm text-orange-700">
        最近作った料理の履歴や買い物リストの食材をもとに、AIがレシピを提案します
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="キーワード（例: 和食、簡単、鶏肉）"
          onKeyDown={(e) => e.key === 'Enter' && handleSuggest()}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <button
          onClick={handleSuggest}
          disabled={loading}
          className="bg-orange-500 text-white px-5 py-3 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 shrink-0"
        >
          {loading ? '提案中...' : '提案する'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {loading && (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-2 animate-bounce">✨</div>
          <p className="text-sm">AIがレシピを考えています...</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-3">{suggestions.length}件のレシピを提案しました</p>
          <div className="space-y-3">
            {suggestions.map((s, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div
                  className="p-4 cursor-pointer flex items-start justify-between"
                  onClick={() => setExpanded(expanded === idx ? null : idx)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800">{s.title}</h3>
                    {s.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{s.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      食材 {s.ingredients.length}品目 / {s.steps.length}ステップ
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegister(idx, s);
                      }}
                      disabled={registered.has(idx)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                        registered.has(idx)
                          ? 'bg-green-100 text-green-600 cursor-default'
                          : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                      }`}
                    >
                      {registered.has(idx) ? '✓ 登録済み' : '＋ 登録'}
                    </button>
                    <span className="text-gray-400 text-xs">{expanded === idx ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expanded === idx && (
                  <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">食材・調味料</h4>
                      <ul className="space-y-1">
                        {s.ingredients.map((ing, i) => (
                          <li key={i} className="flex justify-between text-sm">
                            <span className="text-gray-700">{ing.name}</span>
                            <span className="text-gray-400">{ing.amount}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">調理手順</h4>
                      <ol className="space-y-1">
                        {s.steps.map((step, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-700">
                            <span className="text-orange-500 font-bold shrink-0">{i + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && suggestions.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">✨</div>
          <p className="text-sm">キーワードを入力して提案ボタンを押してください</p>
          <p className="text-xs mt-1">空白のまま提案すると最近の履歴からおすすめします</p>
        </div>
      )}
    </div>
  );
}
