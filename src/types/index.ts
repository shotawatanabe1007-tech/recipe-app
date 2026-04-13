export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  inShoppingList: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  sourceUrl?: string;
  sourceImageBase64?: string;
  sourceThumbnail?: string;
  ingredients: Ingredient[];
  steps: string[];
  scheduledDate?: string; // ISO date string "YYYY-MM-DD"
  createdAt: string;
}

export interface CookedRecord {
  id: string;
  recipeId?: string;
  title: string;
  cookedAt: string;
  rating: number; // 1-5
  photoBase64?: string;
  calories?: number;
  notes?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  checked: boolean;
  recipeTitle: string;
  recipeId: string;
}

export interface AISuggestedRecipe {
  title: string;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  description?: string;
}
