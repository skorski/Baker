const STORAGE_KEY_PREFIX = 'baker-app';

export interface ProductQuantity {
  productId: string;
  quantity: number;
}

export type ScaleMode = 'products' | 'grams' | 'manual';

export interface RecipeProgress {
  completedSteps: string[];
  percentageOverrides: Record<string, number>;
  wholeWheatPercent: number | null;
  preferment: { weight: number; hydration: number } | null;
  desiredTotalWeight: number | null;
  productQuantities: ProductQuantity[];
  scaleMode: ScaleMode;
  gramsInput: string;
  manualInput: string;
}

function getStorageKey(recipeId: string): string {
  return `${STORAGE_KEY_PREFIX}-recipe-${recipeId}`;
}

export function loadRecipeProgress(recipeId: string): RecipeProgress | null {
  try {
    const stored = localStorage.getItem(getStorageKey(recipeId));
    if (!stored) return null;
    return JSON.parse(stored) as RecipeProgress;
  } catch {
    return null;
  }
}

export function saveRecipeProgress(recipeId: string, progress: RecipeProgress): void {
  try {
    localStorage.setItem(getStorageKey(recipeId), JSON.stringify(progress));
  } catch {
    // Storage full or unavailable - silently fail
  }
}

export function clearRecipeProgress(recipeId: string): void {
  try {
    localStorage.removeItem(getStorageKey(recipeId));
  } catch {
    // Storage unavailable - silently fail
  }
}
