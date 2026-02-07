import { Link } from 'react-router-dom';
import { Thermometer, Timer, Drop } from '@phosphor-icons/react';
import type { Recipe } from '../types/recipe';
import { bakingContainers } from '../data/bakingContainers';

interface RecipeCardProps {
  recipe: Recipe;
}

function getHydration(recipe: Recipe): number {
  const totalFlour = recipe.ingredients
    .filter(i => i.type === 'flour' && !i.amountHint)
    .reduce((sum, i) => sum + i.percentage, 0);
  const totalLiquid = recipe.ingredients
    .filter(i => i.type === 'liquid' && !i.amountHint)
    .reduce((sum, i) => sum + i.percentage, 0);
  if (totalFlour === 0) return 0;
  return Math.round((totalLiquid / totalFlour) * 100);
}

function getIngredientCount(recipe: Recipe): number {
  return recipe.ingredients.filter(i => i.percentage > 0 || i.amountHint).length;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const hydration = getHydration(recipe);
  const ingredientCount = getIngredientCount(recipe);
  const containerLabel = recipe.baking?.container
    ? bakingContainers.find(c => c.id === recipe.baking!.container)?.label
    : undefined;

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="recipe-card block rounded-xl overflow-hidden"
      style={{
        background: 'var(--color-flour)',
        border: '1px solid rgba(139,105,20,0.12)',
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-1.5"
        style={{ background: 'linear-gradient(90deg, var(--color-crust), #C4922A)' }}
      />

      <div className="p-5 pb-4">
        <h2
          className="text-xl mb-1"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--color-char)', fontWeight: 600 }}
        >
          {recipe.name}
        </h2>

        {recipe.tagline && (
          <p className="text-xs tracking-wide mb-4" style={{ color: 'var(--color-warmgray)', fontStyle: 'italic' }}>
            {recipe.tagline}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Drop size={14} weight="fill" style={{ color: 'var(--color-crust)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-char)' }}>
              {hydration}%
            </span>
            <span className="text-xs" style={{ color: 'var(--color-warmgray)' }}>hydration</span>
          </div>
          <span style={{ color: 'rgba(139,105,20,0.2)' }}>·</span>
          <span className="text-xs" style={{ color: 'var(--color-warmgray)' }}>
            {ingredientCount} ingredients
          </span>
        </div>

        {/* Baking info pills */}
        {recipe.baking && (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(139,105,20,0.08)', color: 'var(--color-crust)' }}
            >
              <Thermometer size={13} weight="bold" />
              {recipe.baking.temperatureF}°F
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(139,105,20,0.08)', color: 'var(--color-crust)' }}
            >
              <Timer size={13} weight="bold" />
              {recipe.baking.timeMinutes} min
            </span>
            {containerLabel && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                style={{ background: 'rgba(139,105,20,0.05)', color: 'var(--color-warmgray)' }}
              >
                {containerLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
