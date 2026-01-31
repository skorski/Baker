import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Recipe, Preferment } from '../types/recipe';
import { calculateFlourWeight, calculateIngredientsWithPreferment } from '../utils/calculations';
import ScalingCalculator from './ScalingCalculator';
import PrefermentCalculator from './PrefermentCalculator';
import IngredientList from './IngredientList';
import StepList from './StepList';
import recipesData from '../data/recipes.json';

function formatHydration(hint: string | number | undefined): string | null {
  if (hint === undefined) return null;
  if (typeof hint === 'number') return `${hint}% hydration`;
  return hint;
}

function formatSource(recipe: Recipe): string | null {
  if (recipe.source) return recipe.source;
  if (recipe.sources && recipe.sources.length > 0) {
    return recipe.sources.map(s => {
      let text = s.title;
      if (s.volume) text += `, Vol. ${s.volume}`;
      if (s.page) text += `, p. ${s.page}`;
      return text;
    }).join('; ');
  }
  return null;
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const recipe = recipesData.recipes.find(r => r.id === id) as Recipe | undefined;

  const [desiredTotalWeight, setDesiredTotalWeight] = useState<number | null>(null);
  const [preferment, setPreferment] = useState<Preferment | null>(null);

  const flourWeight = useMemo(
    () => recipe ? calculateFlourWeight(recipe, desiredTotalWeight) : 0,
    [recipe, desiredTotalWeight]
  );

  const calculatedIngredients = useMemo(
    () => recipe ? calculateIngredientsWithPreferment(recipe.ingredients, flourWeight, preferment) : [],
    [recipe, flourWeight, preferment]
  );

  const totalPercentage = useMemo(
    () => recipe ? recipe.ingredients.reduce(
      (sum, ing) => ing.amountHint ? sum : sum + ing.percentage, 0
    ) : 0,
    [recipe]
  );

  if (!recipe) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <p className="text-stone-500">Recipe not found</p>
      </div>
    );
  }

  const hydrationDisplay = formatHydration(recipe.hydrationHint);
  const sourceDisplay = formatSource(recipe);

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <Link to="/" className="text-sm text-stone-400 hover:text-stone-600 transition-colors mb-6 inline-block">
        ← Back to recipes
      </Link>
      
      <header className="mb-10">
        <h1 className="text-3xl font-light tracking-tight text-stone-900 mb-2">{recipe.name}</h1>
        {hydrationDisplay && (
          <p className="text-stone-500">{hydrationDisplay}</p>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ScalingCalculator
            desiredTotalWeight={desiredTotalWeight}
            flourWeight={flourWeight}
            totalPercentage={totalPercentage}
            onTotalWeightChange={setDesiredTotalWeight}
            isScaled={desiredTotalWeight !== null}
          />
          <PrefermentCalculator
            preferment={preferment}
            onPrefermentChange={setPreferment}
          />
        </div>

        <div className="lg:col-span-2">
          <IngredientList
            ingredients={calculatedIngredients}
            flourWeight={flourWeight}
          />
        </div>
      </div>

      {recipe.steps.length > 0 && (
        <div className="mt-12">
          <StepList steps={recipe.steps} />
        </div>
      )}

      {recipe.notes && (
        <div className="mt-10 p-5 bg-stone-100 rounded-lg border border-stone-200">
          <h3 className="text-sm font-medium text-stone-700 mb-2">Notes</h3>
          <p className="text-stone-600">{recipe.notes}</p>
        </div>
      )}

      {sourceDisplay && (
        <p className="mt-6 text-sm text-stone-400">Source: {sourceDisplay}</p>
      )}
    </div>
  );
}
