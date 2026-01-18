import type { Recipe, Ingredient, CalculatedIngredient, ValidationResult } from '../types/recipe';

export function calculateFlourWeight(
  recipe: Recipe,
  desiredTotalWeight: number | null
): number {
  if (desiredTotalWeight === null) {
    return recipe.baseFlourWeight;
  }

  const totalPercentage = recipe.ingredients.reduce(
    (sum, ingredient) => {
      if (ingredient.amountHint) return sum;
      return sum + ingredient.percentage;
    },
    0
  );

  return (desiredTotalWeight * 100) / totalPercentage;
}

export function calculateIngredientWeight(
  flourWeight: number,
  percentage: number
): number {
  return (flourWeight * percentage) / 100;
}

export function roundIngredientAmount(weight: number): number {
  if (weight < 10) {
    return Math.round(weight * 10) / 10;
  }
  return Math.round(weight);
}

export function calculateIngredients(
  ingredients: Ingredient[],
  flourWeight: number
): CalculatedIngredient[] {
  return ingredients.map(ingredient => {
    if (ingredient.amountHint) {
      return {
        ...ingredient,
        weight: 0,
        displayWeight: ingredient.amountHint
      };
    }

    const rawWeight = calculateIngredientWeight(flourWeight, ingredient.percentage);
    const roundedWeight = roundIngredientAmount(rawWeight);

    return {
      ...ingredient,
      weight: roundedWeight,
      displayWeight: `${roundedWeight}g`
    };
  });
}

export function validateTotalWeight(input: string): ValidationResult {
  const trimmed = input.trim();
  if (trimmed === '') {
    return { valid: false, error: 'empty' };
  }

  const value = Number(trimmed);
  if (isNaN(value)) {
    return { valid: false, error: 'non-numeric' };
  }

  if (value <= 0) {
    return { valid: false, error: 'zero-or-negative' };
  }

  if (value < 100) {
    return { valid: false, error: 'too-small' };
  }

  if (value > 10000) {
    return { valid: false, error: 'too-large' };
  }

  return { valid: true, value };
}
