import { describe, it, expect } from 'vitest';
import {
  calculateFlourWeight,
  calculateIngredientWeight,
  roundIngredientAmount,
  calculatePrefermentContribution,
  calculateIngredients,
  calculateIngredientsWithPreferment,
  getPrefermentTarget,
  validateTotalWeight
} from '../utils/calculations';
import type { Recipe, Ingredient, Preferment } from '../types/recipe';

// Helper: basic bread recipe (flour=100%, water=65%, salt=2%, yeast=2% → total=169%)
const basicIngredients: Ingredient[] = [
  { id: 'flour', name: 'Bread Flour', percentage: 100, type: 'flour' },
  { id: 'water', name: 'Water', percentage: 65, type: 'liquid' },
  { id: 'salt', name: 'Salt', percentage: 2, type: 'seasoning' },
  { id: 'yeast', name: 'Yeast', percentage: 2, type: 'leavening' },
];

const basicRecipe: Recipe = {
  id: 'basic-bread',
  name: 'Basic Bread',
  baseFlourWeight: 500,
  ingredients: basicIngredients,
  steps: [],
};

describe('calculateFlourWeight', () => {
  it('returns baseFlourWeight when desiredTotalWeight is null and no overrides', () => {
    const result = calculateFlourWeight(basicRecipe, null);
    expect(result).toBe(500);
  });

  it('scales flour correctly when desiredTotalWeight is provided', () => {
    // totalPercentage = 169, so flour = 1690 * 100 / 169 = 1000
    const result = calculateFlourWeight(basicRecipe, 1690);
    expect(result).toBeCloseTo(1000, 1);
  });

  it('scales flour for a smaller desired weight', () => {
    // flour = 845 * 100 / 169 = 500 (same as base)
    const result = calculateFlourWeight(basicRecipe, 845);
    expect(result).toBeCloseTo(500, 1);
  });

  it('scales flour for arbitrary desired weight', () => {
    // flour = 1000 * 100 / 169 ≈ 591.72
    const result = calculateFlourWeight(basicRecipe, 1000);
    expect(result).toBeCloseTo(591.72, 0);
  });

  it('preserves total dough weight when percentages change and desiredTotalWeight is null', () => {
    // Original total % = 169, so default total = 500 * 169/100 = 845
    // New ingredients with water at 70% → new total % = 174
    const modifiedIngredients: Ingredient[] = [
      { id: 'flour', name: 'Bread Flour', percentage: 100, type: 'flour' },
      { id: 'water', name: 'Water', percentage: 70, type: 'liquid' },
      { id: 'salt', name: 'Salt', percentage: 2, type: 'seasoning' },
      { id: 'yeast', name: 'Yeast', percentage: 2, type: 'leavening' },
    ];
    const modifiedRecipe = { ...basicRecipe, ingredients: modifiedIngredients };
    // Pass originalTotalPercentage=169 so total dough stays at 845
    // flour = 845 * 100 / 174 ≈ 485.63
    const result = calculateFlourWeight(modifiedRecipe, null, 169);
    expect(result).toBeCloseTo(485.63, 0);
  });

  it('scales correctly with modified percentages and explicit weight', () => {
    const modifiedIngredients: Ingredient[] = [
      { id: 'flour', name: 'Bread Flour', percentage: 100, type: 'flour' },
      { id: 'water', name: 'Water', percentage: 70, type: 'liquid' },
      { id: 'salt', name: 'Salt', percentage: 2, type: 'seasoning' },
      { id: 'yeast', name: 'Yeast', percentage: 2, type: 'leavening' },
    ];
    const modifiedRecipe = { ...basicRecipe, ingredients: modifiedIngredients };
    // totalPercentage = 174, flour = 1740 * 100 / 174 = 1000
    const result = calculateFlourWeight(modifiedRecipe, 1740);
    expect(result).toBeCloseTo(1000, 1);
  });

  it('includes isPreferment ingredients in flour weight calculation (levain is part of total dough)', () => {
    const sourdoughRecipe: Recipe = {
      id: 'sourdough',
      name: 'Sourdough',
      baseFlourWeight: 480,
      ingredients: [
        { id: 'flour', name: 'Bread flour', percentage: 100, type: 'flour' },
        { id: 'water', name: 'Water', percentage: 65, type: 'liquid' },
        { id: 'levain', name: 'Levain', percentage: 40, type: 'leavening', isPreferment: true, prefermentHydration: 100 },
        { id: 'salt', name: 'Salt', percentage: 2.5, type: 'salt' },
      ],
      steps: [],
    };
    // Total % including levain = 100 + 65 + 40 + 2.5 = 207.5
    // Default total = 480 * 207.5/100 = 996g
    const defaultFlour = calculateFlourWeight(sourdoughRecipe, null);
    expect(defaultFlour).toBe(480);

    // Scaling: 996g target → flour = 996 * 100/207.5 = 480
    const scaledFlour = calculateFlourWeight(sourdoughRecipe, 996);
    expect(scaledFlour).toBeCloseTo(480, 0);

    // Scaling to 1000g: flour = 1000 * 100/207.5 ≈ 482
    // Levain target = 482 * 40/100 ≈ 193g (close to recipe's 195g)
    const biggerFlour = calculateFlourWeight(sourdoughRecipe, 1000);
    expect(biggerFlour).toBeCloseTo(482, 0);
  });
});

describe('calculateIngredientWeight', () => {
  it('calculates weight from flour weight and percentage', () => {
    expect(calculateIngredientWeight(500, 65)).toBe(325);
    expect(calculateIngredientWeight(500, 100)).toBe(500);
    expect(calculateIngredientWeight(500, 2)).toBe(10);
  });
});

describe('roundIngredientAmount', () => {
  it('rounds to 1 decimal for small amounts', () => {
    expect(roundIngredientAmount(5.67)).toBe(5.7);
    expect(roundIngredientAmount(9.99)).toBe(10);
  });

  it('rounds to whole number for larger amounts', () => {
    expect(roundIngredientAmount(325.4)).toBe(325);
    expect(roundIngredientAmount(325.6)).toBe(326);
  });
});

describe('calculatePrefermentContribution', () => {
  it('returns zeros for null preferment', () => {
    const result = calculatePrefermentContribution(null);
    expect(result.flour).toBe(0);
    expect(result.water).toBe(0);
  });

  it('returns zeros for zero-weight preferment', () => {
    const result = calculatePrefermentContribution({ weight: 0, hydration: 100 });
    expect(result.flour).toBe(0);
    expect(result.water).toBe(0);
  });

  it('calculates flour and water for 100% hydration preferment', () => {
    // 200g preferment at 100% hydration: flour = 200/2 = 100, water = 100
    const result = calculatePrefermentContribution({ weight: 200, hydration: 100 });
    expect(result.flour).toBe(100);
    expect(result.water).toBe(100);
  });

  it('calculates flour and water for 50% hydration preferment', () => {
    // 150g preferment at 50% hydration: flour = 150/1.5 = 100, water = 50
    const result = calculatePrefermentContribution({ weight: 150, hydration: 50 });
    expect(result.flour).toBe(100);
    expect(result.water).toBe(50);
  });
});

describe('calculateIngredients', () => {
  it('calculates weights for all ingredients', () => {
    const result = calculateIngredients(basicIngredients, 500);
    expect(result).toHaveLength(4);
    expect(result[0].weight).toBe(500); // flour
    expect(result[1].weight).toBe(325); // water
    expect(result[2].weight).toBe(10);  // salt
    expect(result[3].weight).toBe(10);  // yeast
  });

  it('handles amountHint ingredients', () => {
    const ingredients: Ingredient[] = [
      ...basicIngredients,
      { id: 'olive-oil', name: 'Olive Oil', percentage: 0, type: 'fat', amountHint: 'drizzle' }
    ];
    const result = calculateIngredients(ingredients, 500);
    const oilResult = result.find(i => i.id === 'olive-oil');
    expect(oilResult?.weight).toBe(0);
    expect(oilResult?.displayWeight).toBe('drizzle');
  });
});

describe('calculateIngredientsWithPreferment', () => {
  it('returns normal weights when no preferment', () => {
    const result = calculateIngredientsWithPreferment(basicIngredients, 500, null);
    expect(result[0].finalWeight).toBe(500);  // flour unchanged
    expect(result[1].finalWeight).toBe(325);  // water unchanged
    expect(result[0].prefermentDeduction).toBeUndefined();
  });

  it('deducts preferment contribution from flour and water', () => {
    const preferment: Preferment = { weight: 200, hydration: 100 };
    // contribution: flour=100, water=100
    const result = calculateIngredientsWithPreferment(basicIngredients, 500, preferment);
    
    expect(result[0].weight).toBe(500);       // total flour
    expect(result[0].prefermentDeduction).toBe(100);
    expect(result[0].finalWeight).toBe(400);   // 500 - 100
    
    expect(result[1].weight).toBe(325);       // total water
    expect(result[1].prefermentDeduction).toBe(100);
    expect(result[1].finalWeight).toBe(225);   // 325 - 100
  });

  it('works correctly when scaled up with preferment', () => {
    const preferment: Preferment = { weight: 200, hydration: 100 };
    // flour = 1000g (scaled up 2x), contribution: flour=100, water=100
    const result = calculateIngredientsWithPreferment(basicIngredients, 1000, preferment);
    
    expect(result[0].weight).toBe(1000);      // total flour
    expect(result[0].finalWeight).toBe(900);   // 1000 - 100
    expect(result[1].weight).toBe(650);       // total water
    expect(result[1].finalWeight).toBe(550);   // 650 - 100
  });

  it('clamps finalWeight to zero if preferment exceeds ingredient', () => {
    const preferment: Preferment = { weight: 1200, hydration: 100 };
    // contribution: flour=600, water=600
    const result = calculateIngredientsWithPreferment(basicIngredients, 500, preferment);
    
    expect(result[0].finalWeight).toBe(0);     // 500 - 600 clamped to 0
    expect(result[1].finalWeight).toBe(0);     // 325 - 600 clamped to 0
  });
});

describe('validateTotalWeight', () => {
  it('rejects empty string', () => {
    const result = validateTotalWeight('');
    expect(result.valid).toBe(false);
  });

  it('rejects non-numeric input', () => {
    const result = validateTotalWeight('abc');
    expect(result.valid).toBe(false);
  });

  it('rejects zero', () => {
    const result = validateTotalWeight('0');
    expect(result.valid).toBe(false);
  });

  it('rejects values below 100', () => {
    const result = validateTotalWeight('50');
    expect(result.valid).toBe(false);
  });

  it('rejects values above 10000', () => {
    const result = validateTotalWeight('15000');
    expect(result.valid).toBe(false);
  });

  it('accepts valid weight', () => {
    const result = validateTotalWeight('1500');
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.value).toBe(1500);
  });
});

describe('end-to-end scaling flow', () => {
  it('produces correct ingredient weights for scaled recipe', () => {
    const desiredTotalWeight = 1690; // 2x the default ~845g
    const flourWeight = calculateFlourWeight(basicRecipe, desiredTotalWeight);
    expect(flourWeight).toBeCloseTo(1000, 0);
    
    const ingredients = calculateIngredientsWithPreferment(basicIngredients, flourWeight, null);
    expect(ingredients[0].finalWeight).toBeCloseTo(1000, 0); // flour
    expect(ingredients[1].finalWeight).toBeCloseTo(650, 0);  // water
    expect(ingredients[2].finalWeight).toBeCloseTo(20, 0);   // salt
    expect(ingredients[3].finalWeight).toBeCloseTo(20, 0);   // yeast
  });

  it('scaling + preferment produces correct final weights', () => {
    const desiredTotalWeight = 1690;
    const flourWeight = calculateFlourWeight(basicRecipe, desiredTotalWeight);
    const preferment: Preferment = { weight: 200, hydration: 100 };
    
    const ingredients = calculateIngredientsWithPreferment(basicIngredients, flourWeight, preferment);
    // flour: 1000 - 100 = 900, water: 650 - 100 = 550
    expect(ingredients[0].finalWeight).toBeCloseTo(900, 0);
    expect(ingredients[1].finalWeight).toBeCloseTo(550, 0);
  });

  it('clearing preferment (setting to null) restores original weights', () => {
    const flourWeight = calculateFlourWeight(basicRecipe, 1690);
    
    // With preferment
    const withPreferment = calculateIngredientsWithPreferment(
      basicIngredients, flourWeight, { weight: 200, hydration: 100 }
    );
    expect(withPreferment[0].finalWeight).toBeCloseTo(900, 0);
    
    // After clearing preferment (null)
    const withoutPreferment = calculateIngredientsWithPreferment(
      basicIngredients, flourWeight, null
    );
    expect(withoutPreferment[0].finalWeight).toBeCloseTo(1000, 0);
    expect(withoutPreferment[0].prefermentDeduction).toBeUndefined();
  });

  it('clearing preferment by setting weight to 0 produces zero contribution', () => {
    const contribution = calculatePrefermentContribution({ weight: 0, hydration: 100 });
    expect(contribution.flour).toBe(0);
    expect(contribution.water).toBe(0);
  });
});

// Sourdough-style recipe with isPreferment ingredient
const sourdoughIngredients: Ingredient[] = [
  { id: 'bread_flour', name: 'Bread flour', percentage: 100, type: 'flour' },
  { id: 'water', name: 'Water', percentage: 65, type: 'liquid' },
  { id: 'levain', name: 'Liquid levain', percentage: 40, type: 'leavening', isPreferment: true, prefermentHydration: 100 },
  { id: 'salt', name: 'Salt', percentage: 2, type: 'salt' },
];

describe('recipe-aware preferment (isPreferment ingredients)', () => {
  // At flourWeight=500: levain target = 500*40/100 = 200g
  // Levain at 100% hydration: 200g = 100g flour + 100g water
  // Flour and water percentages are TOTAL amounts (recipe assumes full target preferment)
  
  it('with full target preferment, no adjustment to flour/water', () => {
    const preferment: Preferment = { weight: 200, hydration: 100 };
    const result = calculateIngredientsWithPreferment(sourdoughIngredients, 500, preferment);
    
    const flour = result.find(i => i.id === 'bread_flour')!;
    const water = result.find(i => i.id === 'water')!;
    const levain = result.find(i => i.id === 'levain')!;
    
    // At target: no adjustment needed
    expect(levain.weight).toBe(200);
    expect(levain.finalWeight).toBe(200);
    expect(flour.weight).toBe(500);
    expect(flour.finalWeight).toBe(500);
    expect(flour.prefermentDeduction).toBeUndefined();
    expect(water.weight).toBe(325);
    expect(water.finalWeight).toBe(325);
  });

  it('with null preferment (default), assumes full target — no adjustment', () => {
    const result = calculateIngredientsWithPreferment(sourdoughIngredients, 500, null);
    
    const flour = result.find(i => i.id === 'bread_flour')!;
    const water = result.find(i => i.id === 'water')!;
    const levain = result.find(i => i.id === 'levain')!;
    
    // Default = target, no adjustment
    expect(levain.finalWeight).toBe(200);
    expect(flour.finalWeight).toBe(500);
    expect(water.finalWeight).toBe(325);
    expect(flour.prefermentDeduction).toBeUndefined();
  });

  it('with zero preferment, adds missing flour/water to compensate', () => {
    const preferment: Preferment = { weight: 0, hydration: 100 };
    const result = calculateIngredientsWithPreferment(sourdoughIngredients, 500, preferment);
    
    const flour = result.find(i => i.id === 'bread_flour')!;
    const water = result.find(i => i.id === 'water')!;
    const levain = result.find(i => i.id === 'levain')!;
    
    // Missing 200g: 100g flour + 100g water added to mix
    expect(levain.finalWeight).toBe(0);
    expect(flour.finalWeight).toBe(600); // 500 + 100
    expect(water.finalWeight).toBe(425); // 325 + 100
    expect(flour.prefermentDeduction).toBe(-100); // negative = addition
  });

  it('with partial preferment, adds shortfall to flour/water', () => {
    // User has 100g out of 200g target — missing 100g
    const preferment: Preferment = { weight: 100, hydration: 100 };
    const result = calculateIngredientsWithPreferment(sourdoughIngredients, 500, preferment);
    
    const flour = result.find(i => i.id === 'bread_flour')!;
    const water = result.find(i => i.id === 'water')!;
    const levain = result.find(i => i.id === 'levain')!;
    
    expect(levain.finalWeight).toBe(100);
    // Missing 100g at 100% hydration: 50g flour + 50g water added
    expect(flour.finalWeight).toBe(550); // 500 + 50
    expect(water.finalWeight).toBe(375); // 325 + 50
  });

  it('excess preferment reduces flour/water from mix', () => {
    // User has 300g but recipe calls for 200g — 100g excess
    const preferment: Preferment = { weight: 300, hydration: 100 };
    const result = calculateIngredientsWithPreferment(sourdoughIngredients, 500, preferment);
    
    const levain = result.find(i => i.id === 'levain')!;
    const flour = result.find(i => i.id === 'bread_flour')!;
    const water = result.find(i => i.id === 'water')!;
    
    expect(levain.finalWeight).toBe(300);
    // Excess 100g at 100% hydration: 50g flour, 50g water deducted
    expect(flour.finalWeight).toBe(450); // 500 - 50
    expect(water.finalWeight).toBe(275); // 325 - 50
    expect(flour.prefermentDeduction).toBe(50);
  });
});

describe('getPrefermentTarget', () => {
  it('returns target weight for recipe with preferment ingredient', () => {
    const target = getPrefermentTarget(sourdoughIngredients, 500);
    expect(target).toBe(200); // 500 * 40 / 100
  });

  it('returns 0 for recipe without preferment ingredients', () => {
    const target = getPrefermentTarget(basicIngredients, 500);
    expect(target).toBe(0);
  });

  it('scales target with flour weight', () => {
    const target = getPrefermentTarget(sourdoughIngredients, 1000);
    expect(target).toBe(400); // 1000 * 40 / 100
  });
});

describe('legacy standalone preferment (no isPreferment ingredients)', () => {
  it('still deducts from flour and water for recipes without isPreferment', () => {
    const preferment: Preferment = { weight: 200, hydration: 100 };
    const result = calculateIngredientsWithPreferment(basicIngredients, 500, preferment);
    
    // Legacy behavior: deduct contribution from first flour and first liquid
    expect(result[0].finalWeight).toBe(400);  // flour: 500 - 100
    expect(result[1].finalWeight).toBe(225);  // water: 325 - 100
  });
});
