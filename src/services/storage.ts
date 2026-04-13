import type { Recipe, CookedRecord, ShoppingItem } from '../types';

const KEYS = {
  recipes: 'recipes',
  cookedRecords: 'cookedRecords',
  shoppingItems: 'shoppingItems',
};

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---- Recipes ----

export function getRecipes(): Recipe[] {
  return load<Recipe>(KEYS.recipes);
}

export function saveRecipe(recipe: Recipe): void {
  const list = getRecipes();
  const idx = list.findIndex((r) => r.id === recipe.id);
  if (idx >= 0) {
    list[idx] = recipe;
  } else {
    list.unshift(recipe);
  }
  save(KEYS.recipes, list);
}

export function deleteRecipe(id: string): void {
  const list = getRecipes().filter((r) => r.id !== id);
  save(KEYS.recipes, list);
}

// ---- Cooked Records ----

export function getCookedRecords(): CookedRecord[] {
  return load<CookedRecord>(KEYS.cookedRecords);
}

export function saveCookedRecord(record: CookedRecord): void {
  const list = getCookedRecords();
  const idx = list.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    list[idx] = record;
  } else {
    list.unshift(record);
  }
  save(KEYS.cookedRecords, list);
}

export function deleteCookedRecord(id: string): void {
  const list = getCookedRecords().filter((r) => r.id !== id);
  save(KEYS.cookedRecords, list);
}

// ---- Shopping Items ----

export function getShoppingItems(): ShoppingItem[] {
  return load<ShoppingItem>(KEYS.shoppingItems);
}

export function saveShoppingItem(item: ShoppingItem): void {
  const list = getShoppingItems();
  const idx = list.findIndex((s) => s.id === item.id);
  if (idx >= 0) {
    list[idx] = item;
  } else {
    list.push(item);
  }
  save(KEYS.shoppingItems, list);
}

export function updateShoppingItems(items: ShoppingItem[]): void {
  save(KEYS.shoppingItems, items);
}

export function deleteShoppingItem(id: string): void {
  const list = getShoppingItems().filter((s) => s.id !== id);
  save(KEYS.shoppingItems, list);
}

export function removeShoppingItemsByRecipe(recipeId: string): void {
  const list = getShoppingItems().filter((s) => s.recipeId !== recipeId);
  save(KEYS.shoppingItems, list);
}
