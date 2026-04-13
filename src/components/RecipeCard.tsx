import { useNavigate } from 'react-router-dom';
import type { Recipe } from '../types';

interface Props {
  recipe: Recipe;
  showDate?: boolean;
}

export default function RecipeCard({ recipe, showDate = false }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow flex gap-3"
    >
      {recipe.sourceImageBase64 ? (
        <img
          src={`data:image/jpeg;base64,${recipe.sourceImageBase64}`}
          alt={recipe.title}
          className="w-16 h-16 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 text-2xl">
          🍽️
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 truncate">{recipe.title}</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          食材 {recipe.ingredients.length}品目 / 手順 {recipe.steps.filter(Boolean).length}ステップ
        </p>
        {showDate && recipe.scheduledDate && (
          <p className="text-xs text-orange-500 mt-1 font-medium">
            📅 {recipe.scheduledDate}
          </p>
        )}
        {!showDate && recipe.scheduledDate && (
          <p className="text-xs text-orange-500 mt-1">
            📅 {recipe.scheduledDate} 予定
          </p>
        )}
      </div>
    </div>
  );
}
