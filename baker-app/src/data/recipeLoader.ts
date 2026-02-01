import type { Recipe } from '../types/recipe';

// Dynamically import all recipe JSON files from the recipes directory
const recipeModules = import.meta.glob<{ default: Recipe }>('./recipes/*.json', { eager: true });

// Extract and export all recipes as an array
export const recipes: Recipe[] = Object.values(recipeModules).map(mod => mod.default);

// Helper to find a recipe by ID
export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find(recipe => recipe.id === id);
}
