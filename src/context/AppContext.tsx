import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Recipe, CookedRecord, ShoppingItem } from '../types';
import * as storage from '../services/storage';

interface AppContextType {
  recipes: Recipe[];
  cookedRecords: CookedRecord[];
  shoppingItems: ShoppingItem[];
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  removeRecipe: (id: string) => void;
  addCookedRecord: (record: CookedRecord) => void;
  updateCookedRecord: (record: CookedRecord) => void;
  removeCookedRecord: (id: string) => void;
  addShoppingItem: (item: ShoppingItem) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  removeCheckedShoppingItems: () => void;
  removeShoppingItemsByRecipe: (recipeId: string) => void;
  addIngredientToShopping: (recipeId: string, recipeTitle: string, name: string, amount: string) => void;
  refreshAll: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [cookedRecords, setCookedRecords] = useState<CookedRecord[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);

  const refreshAll = useCallback(() => {
    setRecipes(storage.getRecipes());
    setCookedRecords(storage.getCookedRecords());
    setShoppingItems(storage.getShoppingItems());
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const addRecipe = useCallback((recipe: Recipe) => {
    storage.saveRecipe(recipe);
    setRecipes(storage.getRecipes());
  }, []);

  const updateRecipe = useCallback((recipe: Recipe) => {
    storage.saveRecipe(recipe);
    setRecipes(storage.getRecipes());
  }, []);

  const removeRecipe = useCallback((id: string) => {
    storage.deleteRecipe(id);
    storage.removeShoppingItemsByRecipe(id);
    setRecipes(storage.getRecipes());
    setShoppingItems(storage.getShoppingItems());
  }, []);

  const addCookedRecord = useCallback((record: CookedRecord) => {
    storage.saveCookedRecord(record);
    setCookedRecords(storage.getCookedRecords());
  }, []);

  const updateCookedRecord = useCallback((record: CookedRecord) => {
    storage.saveCookedRecord(record);
    setCookedRecords(storage.getCookedRecords());
  }, []);

  const removeCookedRecord = useCallback((id: string) => {
    storage.deleteCookedRecord(id);
    setCookedRecords(storage.getCookedRecords());
  }, []);

  const addShoppingItem = useCallback((item: ShoppingItem) => {
    storage.saveShoppingItem(item);
    setShoppingItems(storage.getShoppingItems());
  }, []);

  const toggleShoppingItem = useCallback((id: string) => {
    const items = storage.getShoppingItems().map((s) =>
      s.id === id ? { ...s, checked: !s.checked } : s
    );
    storage.updateShoppingItems(items);
    setShoppingItems(items);
  }, []);

  const removeShoppingItem = useCallback((id: string) => {
    storage.deleteShoppingItem(id);
    setShoppingItems(storage.getShoppingItems());
  }, []);

  const removeCheckedShoppingItems = useCallback(() => {
    const items = storage.getShoppingItems().filter((s) => !s.checked);
    storage.updateShoppingItems(items);
    setShoppingItems(items);
  }, []);

  const removeShoppingItemsByRecipe = useCallback((recipeId: string) => {
    storage.removeShoppingItemsByRecipe(recipeId);
    setShoppingItems(storage.getShoppingItems());
  }, []);

  const addIngredientToShopping = useCallback(
    (recipeId: string, recipeTitle: string, name: string, amount: string) => {
      const existing = storage.getShoppingItems().find(
        (s) => s.recipeId === recipeId && s.name === name
      );
      if (existing) return;

      const item: ShoppingItem = {
        id: `${recipeId}-${name}-${Date.now()}`,
        name,
        amount,
        checked: false,
        recipeTitle,
        recipeId,
      };
      storage.saveShoppingItem(item);
      setShoppingItems(storage.getShoppingItems());
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        recipes,
        cookedRecords,
        shoppingItems,
        addRecipe,
        updateRecipe,
        removeRecipe,
        addCookedRecord,
        updateCookedRecord,
        removeCookedRecord,
        addShoppingItem,
        toggleShoppingItem,
        removeShoppingItem,
        removeCheckedShoppingItems,
        removeShoppingItemsByRecipe,
        addIngredientToShopping,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
