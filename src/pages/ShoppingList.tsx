import { useApp } from '../context/AppContext';

export default function ShoppingList() {
  const { shoppingItems, toggleShoppingItem, removeShoppingItem, removeCheckedShoppingItems } = useApp();

  const unchecked = shoppingItems.filter((s) => !s.checked);
  const checked = shoppingItems.filter((s) => s.checked);

  // Group by recipe
  const groups = shoppingItems.reduce<Record<string, typeof shoppingItems>>((acc, item) => {
    if (!acc[item.recipeTitle]) acc[item.recipeTitle] = [];
    acc[item.recipeTitle].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">買い物リスト</h1>
        {checked.length > 0 && (
          <button
            onClick={removeCheckedShoppingItems}
            className="text-sm text-red-400 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50"
          >
            完了分を削除 ({checked.length})
          </button>
        )}
      </div>

      {shoppingItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🛒</div>
          <p>買い物リストは空です</p>
          <p className="text-xs mt-1">レシピ詳細から「これを買う」を押すと追加されます</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-orange-50 rounded-xl p-3 flex justify-between text-sm">
            <span className="text-orange-700 font-medium">未購入: {unchecked.length}品</span>
            <span className="text-gray-400">完了: {checked.length}品</span>
          </div>

          {/* Grouped by recipe */}
          {Object.entries(groups).map(([title, items]) => (
            <div key={title} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-600">🍽️ {title}</span>
              </div>
              <ul className="divide-y divide-gray-50">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleShoppingItem(item.id)}
                      className="w-5 h-5 accent-orange-500 rounded cursor-pointer shrink-0"
                    />
                    <div className={`flex-1 min-w-0 ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      <span className="font-medium">{item.name}</span>
                      {item.amount && (
                        <span className="text-sm text-gray-400 ml-2">{item.amount}</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeShoppingItem(item.id)}
                      className="text-gray-300 hover:text-red-400 shrink-0"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
