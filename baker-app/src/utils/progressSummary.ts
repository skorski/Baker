import type { RecipeProgress } from './localStorage';
import type { Recipe } from '../types/recipe';
import { doughProducts } from '../data/doughProducts';
import { bakingContainers } from '../data/bakingContainers';

export function summarizeProgress(progress: RecipeProgress, recipe: Recipe): string {
  const parts: string[] = [];

  const products = progress.productQuantities
    ?.filter(pq => pq.quantity > 0)
    .map(pq => {
      const product = doughProducts.find(p => p.id === pq.productId);
      if (!product) return null;
      const name = pq.quantity === 1 ? product.name.toLowerCase() : `${product.name.toLowerCase()}s`;
      return `${pq.quantity} ${name}`;
    })
    .filter(Boolean);

  if (products && products.length > 0) {
    parts.push(products.join(', '));
  }

  if (progress.desiredTotalWeight) {
    parts.push(`${Math.round(progress.desiredTotalWeight)}g total`);
  }

  const ingredients = recipe.ingredients.map(ing => ({
    ...ing,
    percentage: progress.percentageOverrides[ing.id] ?? ing.percentage,
  }));
  const totalFlour = ingredients
    .filter(i => i.type === 'flour' && !i.amountHint)
    .reduce((s, i) => s + i.percentage, 0);
  const totalLiquid = ingredients
    .filter(i => i.type === 'liquid' && !i.amountHint)
    .reduce((s, i) => s + i.percentage, 0);
  if (totalFlour > 0) {
    const hydration = Math.round((totalLiquid / totalFlour) * 100);
    parts.push(`${hydration}% hydration`);
  }

  const tempF = progress.bakingOverrides?.temperatureF;
  if (tempF) {
    parts.push(`${tempF}°F`);
  } else if (recipe.baking?.temperatureF) {
    parts.push(`${recipe.baking.temperatureF}°F`);
  }

  return parts.length > 0 ? parts.join(' · ') : '';
}

export function describeChanges(progress: RecipeProgress, recipe: Recipe): string[] {
  const changes: string[] = [];

  const overrides = progress.percentageOverrides;
  if (overrides && Object.keys(overrides).length > 0) {
    for (const [id, pct] of Object.entries(overrides)) {
      const orig = recipe.ingredients.find(i => i.id === id);
      if (orig && pct !== orig.percentage) {
        changes.push(`${orig.name} ${orig.percentage}% → ${pct}%`);
      }
    }
  }

  if (progress.wholeWheatPercent !== null && progress.wholeWheatPercent !== undefined) {
    changes.push(`${progress.wholeWheatPercent}% whole wheat sub`);
  }

  if (progress.preferment) {
    changes.push(`Preferment ${progress.preferment.weight}g @ ${progress.preferment.hydration}% hydration`);
  }

  const baking = progress.bakingOverrides;
  if (baking) {
    if (baking.timeMinutes && baking.timeMinutes !== recipe.baking?.timeMinutes) {
      changes.push(`Bake time ${baking.timeMinutes} min`);
    }
    if (baking.container && baking.container !== recipe.baking?.container) {
      const label = bakingContainers.find(c => c.id === baking.container)?.label ?? baking.container;
      changes.push(`Container: ${label}`);
    }
  }

  return changes;
}
