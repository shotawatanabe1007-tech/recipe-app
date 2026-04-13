import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Recipe, Ingredient } from '../types';
import { extractRecipeFromImage, extractRecipeFromUrl } from '../services/claude';
import ImageUploader from '../components/ImageUploader';
import StepEditor from '../components/StepEditor';

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function AddRecipe() {
  const { addRecipe } = useApp();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imageMediaType, setImageMediaType] = useState<'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'>('image/jpeg');
  const [url, setUrl] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'image' | 'url' | 'manual'>('image');

  const handleImageSelect = (base64: string, mediaType: typeof imageMediaType) => {
    setImageBase64(base64);
    setImageMediaType(mediaType);
  };

  const handleExtract = async () => {
    setError('');
    setLoading(true);
    try {
      let result;
      if (tab === 'image' && imageBase64) {
        result = await extractRecipeFromImage(imageBase64, imageMediaType);
      } else if (tab === 'url' && url) {
        result = await extractRecipeFromUrl(url);
      } else {
        setError('画像またはURLを入力してください');
        return;
      }
      setTitle(result.title);
      setIngredients(
        result.ingredients.map((ing) => ({
          id: genId(),
          name: ing.name,
          amount: ing.amount,
          inShoppingList: false,
        }))
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { id: genId(), name: '', amount: '', inShoppingList: false }]);
  };

  const updateIngredient = (idx: number, field: 'name' | 'amount', value: string) => {
    const next = [...ingredients];
    next[idx] = { ...next[idx], [field]: value };
    setIngredients(next);
  };

  const removeIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('料理名を入力してください');
      return;
    }
    const recipe: Recipe = {
      id: genId(),
      title: title.trim(),
      sourceUrl: url || undefined,
      sourceImageBase64: imageBase64 || undefined,
      ingredients: ingredients.filter((i) => i.name.trim()),
      steps: steps.filter(Boolean),
      scheduledDate: scheduledDate || undefined,
      createdAt: new Date().toISOString(),
    };
    addRecipe(recipe);
    navigate(`/recipe/${recipe.id}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          ← 戻る
        </button>
        <h1 className="text-xl font-bold text-gray-800">レシピを追加</h1>
      </div>

      {/* Tab selector */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {(['image', 'url', 'manual'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'
            }`}
          >
            {t === 'image' ? '📷 画像' : t === 'url' ? '🔗 URL' : '✏️ 手動'}
          </button>
        ))}
      </div>

      {/* Image tab */}
      {tab === 'image' && (
        <div className="space-y-3">
          <ImageUploader
            onImageSelect={handleImageSelect}
            preview={imageBase64}
            label="レシピのスクショをアップロード"
          />
          {imageBase64 && (
            <button
              onClick={handleExtract}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? '解析中...' : '✨ AIで食材を自動抽出'}
            </button>
          )}
        </div>
      )}

      {/* URL tab */}
      {tab === 'url' && (
        <div className="space-y-3">
          <input
            type="url"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          {url && (
            <button
              onClick={handleExtract}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? '解析中...' : '✨ AIで食材を自動抽出'}
            </button>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Recipe title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">料理名</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 肉じゃが"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {/* Scheduled date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">予定日（任意）</label>
        <input
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {/* Ingredients */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">食材・調味料</label>
          <button
            type="button"
            onClick={addIngredient}
            className="text-xs text-orange-500 font-medium"
          >
            ＋ 追加
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ing, idx) => (
            <div key={ing.id} className="flex gap-2">
              <input
                value={ing.name}
                onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                placeholder="食材名"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <input
                value={ing.amount}
                onChange={(e) => updateIngredient(idx, 'amount', e.target.value)}
                placeholder="分量"
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button
                type="button"
                onClick={() => removeIngredient(idx)}
                className="text-gray-400 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
          {ingredients.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-2">食材がありません</p>
          )}
        </div>
      </div>

      {/* Steps */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">調理手順</label>
        <StepEditor steps={steps} onChange={setSteps} />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-base hover:bg-orange-600 transition-colors"
      >
        レシピを保存
      </button>
    </div>
  );
}
