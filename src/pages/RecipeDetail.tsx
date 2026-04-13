import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Ingredient } from '../types';
import IngredientList from '../components/IngredientList';
import StepEditor from '../components/StepEditor';

const STEP_NUMBERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮'];

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { recipes, updateRecipe, removeRecipe, shoppingItems, addIngredientToShopping } = useApp();
  const navigate = useNavigate();

  const recipe = recipes.find((r) => r.id === id);
  const [editing, setEditing] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editIngredients, setEditIngredients] = useState<Ingredient[]>([]);
  const [editSteps, setEditSteps] = useState<string[]>([]);
  const [editDate, setEditDate] = useState('');

  if (!recipe) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>レシピが見つかりません</p>
        <button onClick={() => navigate('/plan')} className="mt-2 text-orange-500 underline text-sm">
          一覧に戻る
        </button>
      </div>
    );
  }

  const inShoppingIds = new Set(
    shoppingItems.filter((s) => s.recipeId === recipe.id).map((s) => {
      // match by name
      const ing = recipe.ingredients.find((i) => i.name === s.name);
      return ing?.id ?? '';
    })
  );

  const startEdit = () => {
    setEditTitle(recipe.title);
    setEditIngredients(recipe.ingredients.map((i) => ({ ...i })));
    setEditSteps(recipe.steps.length > 0 ? [...recipe.steps] : ['']);
    setEditDate(recipe.scheduledDate ?? '');
    setEditing(true);
  };

  const saveEdit = () => {
    updateRecipe({
      ...recipe,
      title: editTitle.trim() || recipe.title,
      ingredients: editIngredients.filter((i) => i.name.trim()),
      steps: editSteps.filter(Boolean),
      scheduledDate: editDate || undefined,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`「${recipe.title}」を削除しますか？`)) {
      removeRecipe(recipe.id);
      navigate('/plan');
    }
  };

  if (editing) {
    const addIng = () =>
      setEditIngredients([...editIngredients, { id: genId(), name: '', amount: '', inShoppingList: false }]);
    const updateIng = (idx: number, field: 'name' | 'amount', value: string) => {
      const next = [...editIngredients];
      next[idx] = { ...next[idx], [field]: value };
      setEditIngredients(next);
    };

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(false)} className="text-gray-500">← キャンセル</button>
          <h1 className="text-xl font-bold text-gray-800">編集</h1>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">料理名</label>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">予定日</label>
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">食材・調味料</label>
            <button onClick={addIng} className="text-xs text-orange-500 font-medium">＋ 追加</button>
          </div>
          <div className="space-y-2">
            {editIngredients.map((ing, idx) => (
              <div key={ing.id} className="flex gap-2">
                <input
                  value={ing.name}
                  onChange={(e) => updateIng(idx, 'name', e.target.value)}
                  placeholder="食材名"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <input
                  value={ing.amount}
                  onChange={(e) => updateIng(idx, 'amount', e.target.value)}
                  placeholder="分量"
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <button
                  type="button"
                  onClick={() => setEditIngredients(editIngredients.filter((_, i) => i !== idx))}
                  className="text-gray-400 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">調理手順</label>
          <StepEditor steps={editSteps} onChange={setEditSteps} />
        </div>

        <button
          onClick={saveEdit}
          className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600"
        >
          保存する
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-500 mt-1">← 戻る</button>
        <div className="flex gap-2">
          <button onClick={startEdit} className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
            編集
          </button>
          <button onClick={handleDelete} className="text-sm text-red-400 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
            削除
          </button>
        </div>
      </div>

      {/* Image */}
      {recipe.sourceImageBase64 && (
        <img
          src={`data:image/jpeg;base64,${recipe.sourceImageBase64}`}
          alt={recipe.title}
          className="w-full max-h-56 object-cover rounded-2xl"
        />
      )}

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{recipe.title}</h1>
        {recipe.scheduledDate && (
          <p className="text-orange-500 text-sm mt-1">📅 {recipe.scheduledDate} 予定</p>
        )}
        {recipe.sourceUrl && (
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 text-xs underline mt-1 block truncate"
          >
            🔗 {recipe.sourceUrl}
          </a>
        )}
      </div>

      {/* Ingredients */}
      <div>
        <h2 className="text-base font-bold text-gray-700 mb-2">食材・調味料</h2>
        {recipe.ingredients.length === 0 ? (
          <p className="text-gray-400 text-sm">食材が登録されていません</p>
        ) : (
          <IngredientList
            ingredients={recipe.ingredients}
            recipeId={recipe.id}
            recipeTitle={recipe.title}
            onAddToShopping={(name, amount) =>
              addIngredientToShopping(recipe.id, recipe.title, name, amount)
            }
            inShoppingIds={inShoppingIds}
          />
        )}
        <button
          onClick={() => {
            recipe.ingredients.forEach((ing) =>
              addIngredientToShopping(recipe.id, recipe.title, ing.name, ing.amount)
            );
          }}
          className="mt-3 text-sm text-orange-500 border border-orange-300 px-4 py-2 rounded-full hover:bg-orange-50 font-medium"
        >
          🛒 全部買い物リストに追加
        </button>
      </div>

      {/* Steps */}
      {recipe.steps.filter(Boolean).length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-700 mb-3">調理手順</h2>
          <ol className="space-y-3">
            {recipe.steps.filter(Boolean).map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-orange-500 font-bold text-lg w-6 shrink-0">
                  {STEP_NUMBERS[idx] ?? `${idx + 1}`}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Mark as cooked button */}
      <button
        onClick={() => navigate(`/history/add?recipeId=${recipe.id}&title=${encodeURIComponent(recipe.title)}`)}
        className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors"
      >
        ✓ 作った！記録する
      </button>
    </div>
  );
}
