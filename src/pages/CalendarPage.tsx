import { useState } from 'react';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CalendarPage() {
  const { recipes } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Date>(new Date());

  const scheduledDates = new Set(recipes.filter((r) => r.scheduledDate).map((r) => r.scheduledDate!));

  const selectedDateStr = selected.toLocaleDateString('sv-SE'); // YYYY-MM-DD
  const recipesOnDate = recipes.filter((r) => r.scheduledDate === selectedDateStr);

  const tileClassName = ({ date }: { date: Date }) => {
    const ds = date.toLocaleDateString('sv-SE');
    return scheduledDates.has(ds) ? 'has-recipe' : null;
  };

  const handleChange = (value: Value) => {
    if (value instanceof Date) setSelected(value);
    else if (Array.isArray(value) && value[0] instanceof Date) setSelected(value[0]);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800">カレンダー</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <Calendar
          onChange={handleChange}
          value={selected}
          tileClassName={tileClassName}
          locale="ja-JP"
        />
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <span className="inline-block w-3 h-3 rounded bg-yellow-200 border border-yellow-300"></span>
          <span>レシピ予定あり</span>
        </div>
      </div>

      {/* Selected date recipes */}
      <div>
        <h2 className="text-sm font-semibold text-gray-600 mb-2">
          {selectedDateStr} のレシピ
        </h2>
        {recipesOnDate.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4 text-center text-gray-400 text-sm">
            この日のレシピはありません
            <br />
            <button
              onClick={() => navigate(`/add-recipe?date=${selectedDateStr}`)}
              className="text-orange-500 mt-1 underline text-xs"
            >
              レシピを追加する
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recipesOnDate.map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(`/recipe/${r.id}`)}
                className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 cursor-pointer hover:shadow-sm"
              >
                {r.sourceImageBase64 ? (
                  <img
                    src={`data:image/jpeg;base64,${r.sourceImageBase64}`}
                    alt={r.title}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-xl shrink-0">
                    🍽️
                  </div>
                )}
                <span className="font-medium text-gray-800">{r.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
