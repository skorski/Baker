import type { Recipe, Ingredient, CalculatedIngredient, ValidationResult, Preferment, PrefermentContribution, CalculatedIngredientWithPreferment } from '../types/recipe';

/** Sum all baker's percentages (excludes hint-only items). */
export function sumTotalPercentage(ingredients: Ingredient[]): number {
  return ingredients.reduce(
    (sum, ing) => ing.amountHint ? sum : sum + ing.percentage,
    0
  );
}

/** Sum baker's percentages for final-mix ingredients only (excludes preferments and hint-only items). */
export function sumDoughPercentage(ingredients: Ingredient[]): number {
  return ingredients.reduce(
    (sum, ing) => (ing.amountHint || ing.isPreferment) ? sum : sum + ing.percentage,
    0
  );
}

export function calculateFlourWeight(
  recipe: Recipe,
  desiredTotalWeight: number | null,
  originalTotalPercentage?: number
): number {
  // Total percentage INCLUDES preferment — levain is part of the total dough weight
  const currentTotalPercentage = sumTotalPercentage(recipe.ingredients);

  if (desiredTotalWeight === null) {
    const baselinePercentage = originalTotalPercentage ?? currentTotalPercentage;
    const defaultTotalWeight = (recipe.baseFlourWeight * baselinePercentage) / 100;
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
  const hasRecipePreferments = ingredients.some(i => i.isPreferment);
  
  if (hasRecipePreferments) {
    return calculateWithRecipePreferments(ingredients, flourWeight, preferment);
  }
  return calculateWithStandalonePreferment(ingredients, flourWeight, preferment);
}

/** Map ingredients to calculated results, applying flour/water deductions. */
function mapIngredients(
  ingredients: Ingredient[],
  flourWeight: number,
  flourDeduction: number,
  waterDeduction: number,
  prefermentOverride?: { ingredient: Ingredient; weight: number }
): CalculatedIngredientWithPreferment[] {
  const firstFlourIndex = ingredients.findIndex(i => i.type === 'flour' && !i.amountHint && !i.isPreferment);
  const firstLiquidIndex = ingredients.findIndex(i => i.type === 'liquid' && !i.amountHint && !i.isPreferment);

  return ingredients.map((ingredient, index) => {
    if (ingredient.amountHint) {
      return {
        ...ingredient,
        weight: 0, displayWeight: ingredient.amountHint,
        finalWeight: 0, finalDisplayWeight: ingredient.amountHint
      };
    }

    const roundedWeight = roundIngredientAmount(calculateIngredientWeight(flourWeight, ingredient.percentage));

    if (prefermentOverride && ingredient.isPreferment) {
      const fw = roundIngredientAmount(prefermentOverride.weight);
      return {
        ...ingredient,
        weight: roundedWeight, displayWeight: `${roundedWeight}g`,
        finalWeight: fw, finalDisplayWeight: `${fw}g`
      };
    }

    let deduction = 0;
    if (index === firstFlourIndex) deduction = flourDeduction;
    else if (index === firstLiquidIndex) deduction = waterDeduction;

    const finalWeight = roundIngredientAmount(Math.max(0, roundedWeight - deduction));
    return {
      ...ingredient,
      weight: roundedWeight, displayWeight: `${roundedWeight}g`,
      prefermentDeduction: deduction !== 0 ? deduction : undefined,
      finalWeight, finalDisplayWeight: `${finalWeight}g`
    };
  });
}

// Recipe has isPreferment ingredients. The recipe's flour% and water% assume the full target
// preferment amount. When the user has a different amount, adjust flour/water to compensate:
//   - Less than target → add extra flour/water to the mix (negative deduction)
//   - More than target → reduce flour/water from the mix (positive deduction)
//   - Equal to target or null (default) → no adjustment
function calculateWithRecipePreferments(
  ingredients: Ingredient[],
  flourWeight: number,
  preferment: Preferment | null
): CalculatedIngredientWithPreferment[] {
  // Compute the recipe's target preferment
  let targetWeight = 0;
  let targetHydration = 100;
  for (const ing of ingredients) {
    if (!ing.isPreferment || ing.amountHint) continue;
    targetWeight += roundIngredientAmount(calculateIngredientWeight(flourWeight, ing.percentage));
    targetHydration = ing.prefermentHydration ?? 100;
  }

  // Determine the user's preferment amount (null = use target, no adjustment)
  const userWeight = preferment !== null ? preferment.weight : targetWeight;
  const userHydration = preferment !== null ? preferment.hydration : targetHydration;

  // Adjustment = difference between what user has vs what recipe expects
  const delta = userWeight - targetWeight;

  let flourDeduction = 0;
  let waterDeduction = 0;
  if (delta !== 0) {
    // Positive delta: user has more preferment → reduce mix flour/water
    // Negative delta: user has less preferment → increase mix flour/water (deduction goes negative)
    const deltaFlour = roundIngredientAmount(Math.abs(delta) / (1 + userHydration / 100));
    const deltaWater = roundIngredientAmount(deltaFlour * (userHydration / 100));
    flourDeduction = delta > 0 ? deltaFlour : -deltaFlour;
    waterDeduction = delta > 0 ? deltaWater : -deltaWater;
  }

  return mapIngredients(ingredients, flourWeight, flourDeduction, waterDeduction, {
    ingredient: ingredients.find(i => i.isPreferment)!,
    weight: userWeight
  });
}

// No recipe preferments: standalone preferment deduction (legacy behavior)
function calculateWithStandalonePreferment(
  ingredients: Ingredient[],
  flourWeight: number,
  preferment: Preferment | null
): CalculatedIngredientWithPreferment[] {
  const contribution = calculatePrefermentContribution(preferment);
  return mapIngredients(ingredients, flourWeight, contribution.flour, contribution.water);
}

export function getPrefermentTarget(ingredients: Ingredient[], flourWeight: number): number {
  return ingredients
    .filter(i => i.isPreferment && !i.amountHint)
    .reduce((sum, i) => sum + roundIngredientAmount(calculateIngredientWeight(flourWeight, i.percentage)), 0);
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
