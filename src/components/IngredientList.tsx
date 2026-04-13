import type { Ingredient } from '../types';

interface Props {
  ingredients: Ingredient[];
  recipeId: string;
  recipeTitle: string;
  onAddToShopping: (name: string, amount: string) => void;
  inShoppingIds?: Set<string>;
}

export default function IngredientList({
  ingredients,
  onAddToShopping,
  inShoppingIds,
}: Props) {
  return (
    <ul className="space-y-2">
      {ingredients.map((ing) => {
        const isAdded = inShoppingIds?.has(ing.id) ?? ing.inShoppingList;
        return (
          <li key={ing.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <div>
              <span className="font-medium text-gray-800">{ing.name}</span>
              {ing.amount && (
                <span className="text-gray-500 text-sm ml-2">{ing.amount}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => onAddToShopping(ing.name, ing.amount)}
              disabled={isAdded}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                isAdded
                  ? 'bg-green-100 text-green-600 cursor-default'
                  : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
              }`}
            >
              {isAdded ? '✓ 追加済み' : '🛒 これを買う'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
