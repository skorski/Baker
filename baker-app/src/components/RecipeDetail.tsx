import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { Recipe } from '../types/recipe';
import { calculateFlourWeight, calculateIngredients } from '../utils/calculations';
import ScalingCalculator from './ScalingCalculator';
import IngredientList from './IngredientList';
import StepList from './StepList';
import recipesData from '../data/recipes.json';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const recipe = recipesData.recipes.find(r => r.id === id) as Recipe | undefined;

  const [desiredTotalWeight, setDesiredTotalWeight] = useState<number | null>(null);

  const flourWeight = useMemo(
    () => recipe ? calculateFlourWeight(recipe, desiredTotalWeight) : 0,
    [recipe, desiredTotalWeight]
  );

  const calculatedIngredients = useMemo(
    () => recipe ? calculateIngredients(recipe.ingredients, flourWeight) : [],
    [recipe, flourWeight]
  );

  const totalPercentage = useMemo(
    () => recipe ? recipe.ingredients.reduce(
      (sum, ing) => ing.amountHint ? sum : sum + ing.percentage, 0
    ) : 0,
    [recipe]
  );

  if (!recipe) {
    return <div className="container mx-auto px-4 py-8">Recipe not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{recipe.name}</h1>
      {recipe.hydrationHint && (
        <p className="text-xl text-gray-600 mb-8">{recipe.hydrationHint}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ScalingCalculator
            desiredTotalWeight={desiredTotalWeight}
            flourWeight={flourWeight}
            totalPercentage={totalPercentage}
            onTotalWeightChange={setDesiredTotalWeight}
            isScaled={desiredTotalWeight !== null}
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
        <div className="mt-8 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Notes:</h3>
          <p>{recipe.notes}</p>
        </div>
      )}

      {recipe.source && (
        <p className="mt-4 text-sm text-gray-500">Source: {recipe.source}</p>
      )}
    </div>
  );
}
