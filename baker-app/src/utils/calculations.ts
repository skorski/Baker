import type { Recipe, Ingredient, CalculatedIngredient, ValidationResult, Preferment, PrefermentContribution, CalculatedIngredientWithPreferment } from '../types/recipe';

export function calculateFlourWeight(
  recipe: Recipe,
  desiredTotalWeight: number | null,
  originalTotalPercentage?: number
): number {
  const currentTotalPercentage = recipe.ingredients.reduce(
    (sum, ingredient) => {
      if (ingredient.amountHint) return sum;
      return sum + ingredient.percentage;
    },
    0
  );

  if (desiredTotalWeight === null) {
    // Use the original total percentage to determine the baseline total dough weight
    const baselinePercentage = originalTotalPercentage ?? currentTotalPercentage;
    const defaultTotalWeight = (recipe.baseFlourWeight * baselinePercentage) / 100;
    // Recalculate flour weight to maintain this total with current percentages
    return (defaultTotalWeight * 100) / currentTotalPercentage;
  }

  return (desiredTotalWeight * 100) / currentTotalPercentage;
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

export function calculatePrefermentContribution(preferment: Preferment | null): PrefermentContribution {
  if (!preferment || preferment.weight <= 0) {
    return { flour: 0, water: 0 };
  }
  
  const flour = preferment.weight / (1 + preferment.hydration / 100);
  const water = flour * (preferment.hydration / 100);
  
  return {
    flour: roundIngredientAmount(flour),
    water: roundIngredientAmount(water)
  };
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

export function calculateIngredientsWithPreferment(
  ingredients: Ingredient[],
  flourWeight: number,
  preferment: Preferment | null
): CalculatedIngredientWithPreferment[] {
  const contribution = calculatePrefermentContribution(preferment);
  
  const firstFlourIndex = ingredients.findIndex(i => i.type === 'flour' && !i.amountHint);
  const firstLiquidIndex = ingredients.findIndex(i => i.type === 'liquid' && !i.amountHint);
  
  return ingredients.map((ingredient, index) => {
    if (ingredient.amountHint) {
      return {
        ...ingredient,
        weight: 0,
        displayWeight: ingredient.amountHint,
        finalWeight: 0,
        finalDisplayWeight: ingredient.amountHint
      };
    }

    const rawWeight = calculateIngredientWeight(flourWeight, ingredient.percentage);
    const roundedWeight = roundIngredientAmount(rawWeight);
    
    let deduction = 0;
    if (index === firstFlourIndex && contribution.flour > 0) {
      deduction = contribution.flour;
    } else if (index === firstLiquidIndex && contribution.water > 0) {
      deduction = contribution.water;
    }
    
    const finalWeight = roundIngredientAmount(Math.max(0, roundedWeight - deduction));

    return {
      ...ingredient,
      weight: roundedWeight,
      displayWeight: `${roundedWeight}g`,
      prefermentDeduction: deduction > 0 ? deduction : undefined,
      finalWeight,
      finalDisplayWeight: `${finalWeight}g`
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
