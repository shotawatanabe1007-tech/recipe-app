import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { CookedRecord } from '../types';
import { estimateCalories } from '../services/claude';
import StarRating from '../components/StarRating';
import ImageUploader from '../components/ImageUploader';

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function CookingHistory() {
  const { cookedRecords, addCookedRecord, removeCookedRecord } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showForm, setShowForm] = useState(!!searchParams.get('recipeId'));
  const [formTitle, setFormTitle] = useState(searchParams.get('title') ?? '');
  const [formRating, setFormRating] = useState(3);
  const [formNotes, setFormNotes] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formPhotoType, setFormPhotoType] = useState<'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'>('image/jpeg');
  const [formCalories, setFormCalories] = useState<number | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [error, setError] = useState('');
  const recipeId = searchParams.get('recipeId') ?? undefined;

  const handlePhotoSelect = (base64: string, mediaType: typeof formPhotoType) => {
    setFormPhoto(base64);
    setFormPhotoType(mediaType);
    setFormCalories(null);
  };

  const handleCalcCalories = async () => {
    if (!formPhoto) return;
    setCalcLoading(true);
    setError('');
    try {
      const cal = await estimateCalories(formPhoto, formPhotoType);
      setFormCalories(cal);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'カロリー計算に失敗しました');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleSave = () => {
    if (!formTitle.trim()) {
      setError('料理名を入力してください');
      return;
    }
    const record: CookedRecord = {
      id: genId(),
      recipeId,
      title: formTitle.trim(),
      cookedAt: new Date().toISOString(),
      rating: formRating,
      photoBase64: formPhoto || undefined,
      calories: formCalories ?? undefined,
      notes: formNotes || undefined,
    };
    addCookedRecord(record);
    setShowForm(false);
    setFormTitle('');
    setFormRating(3);
    setFormNotes('');
    setFormPhoto('');
    setFormCalories(null);
    navigate('/history', { replace: true });
  };

  if (showForm) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowForm(false); navigate('/history', { replace: true }); }} className="text-gray-500">
            ← 戻る
          </button>
          <h1 className="text-xl font-bold text-gray-800">作った記録を追加</h1>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">料理名</label>
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="例: 肉じゃが"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">評価</label>
          <StarRating value={formRating} onChange={setFormRating} size="lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">写真（任意）</label>
          <ImageUploader
            onImageSelect={handlePhotoSelect}
            preview={formPhoto}
            label="作った料理の写真"
          />
          {formPhoto && (
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={handleCalcCalories}
                disabled={calcLoading}
                className="text-sm bg-purple-100 text-purple-600 px-4 py-2 rounded-full font-medium hover:bg-purple-200 disabled:opacity-50"
              >
                {calcLoading ? '計算中...' : '🔢 AIでカロリー計算'}
              </button>
              {formCalories !== null && (
                <span className="text-sm font-semibold text-gray-700">
                  約 {formCalories} kcal
                </span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
          <textarea
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            placeholder="感想、次回の改善点など..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSave}
          className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600"
        >
          記録を保存
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">作ったレシピ記録</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white text-sm px-4 py-2 rounded-full font-medium hover:bg-green-600"
        >
          ＋ 追加
        </button>
      </div>

      {cookedRecords.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📖</div>
          <p>まだ記録がありません</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 text-orange-500 underline text-sm"
          >
            最初の記録を追加する
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cookedRecords.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex gap-3">
                {r.photoBase64 ? (
                  <img
                    src={`data:image/jpeg;base64,${r.photoBase64}`}
                    alt={r.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center text-2xl shrink-0">
                    🍴
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-800 truncate">{r.title}</h3>
                    <button
                      onClick={() => removeCookedRecord(r.id)}
                      className="text-gray-300 hover:text-red-400 ml-2 shrink-0 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <StarRating value={r.rating} size="sm" />
                  <div className="flex items-center gap-3 mt-1">
                    {r.calories && (
                      <span className="text-xs text-gray-500">🔥 {r.calories} kcal</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(r.cookedAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  {r.notes && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
