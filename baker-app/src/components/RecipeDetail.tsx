import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowCounterClockwise } from '@phosphor-icons/react';
import type { Recipe, Preferment, Ingredient } from '../types/recipe';
import { calculateFlourWeight, calculateIngredientsWithPreferment } from '../utils/calculations';
import { loadRecipeProgress, saveRecipeProgress, clearRecipeProgress, type RecipeProgress } from '../utils/localStorage';
import ScalingCalculator from './ScalingCalculator';
import PrefermentCalculator from './PrefermentCalculator';
import IngredientList from './IngredientList';
import RecipeTree from './RecipeTree';
import recipesData from '../data/recipes.json';

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

export type PercentageOverrides = Record<string, number>;

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const recipe = (recipesData.recipes as unknown as Recipe[]).find(r => r.id === id);

  const [desiredTotalWeight, setDesiredTotalWeight] = useState<number | null>(null);
  const [preferment, setPreferment] = useState<Preferment | null>(null);
  const [percentageOverrides, setPercentageOverrides] = useState<PercentageOverrides>({});
  const [wholeWheatPercent, setWholeWheatPercent] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved progress from localStorage
  useEffect(() => {
    if (!id) return;
    const saved = loadRecipeProgress(id);
    if (saved) {
      setCompletedSteps(saved.completedSteps || []);
      setPercentageOverrides(saved.percentageOverrides || {});
      setWholeWheatPercent(saved.wholeWheatPercent ?? null);
      setPreferment(saved.preferment ?? null);
      setDesiredTotalWeight(saved.desiredTotalWeight ?? null);
    }
    setIsLoaded(true);
  }, [id]);

  // Save progress to localStorage when state changes
  useEffect(() => {
    if (!id || !isLoaded) return;
    const progress: RecipeProgress = {
      completedSteps,
      percentageOverrides,
      wholeWheatPercent,
      preferment,
      desiredTotalWeight
    };
    saveRecipeProgress(id, progress);
  }, [id, isLoaded, completedSteps, percentageOverrides, wholeWheatPercent, preferment, desiredTotalWeight]);

  const handleStepToggle = useCallback((stepId: string) => {
    setCompletedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(s => s !== stepId)
        : [...prev, stepId]
    );
  }, []);

  const handleResetRecipe = useCallback(() => {
    if (!id) return;
    setCompletedSteps([]);
    setPercentageOverrides({});
    setWholeWheatPercent(null);
    setPreferment(null);
    setDesiredTotalWeight(null);
    clearRecipeProgress(id);
  }, [id]);

  // Find the primary bread flour ingredient (first flour type, or one with 'bread' in name)
  const primaryFlourId = useMemo(() => {
    if (!recipe) return null;
    const breadFlour = recipe.ingredients.find(
      ing => ing.type === 'flour' && ing.name.toLowerCase().includes('bread')
    );
    if (breadFlour) return breadFlour.id;
    const firstFlour = recipe.ingredients.find(ing => ing.type === 'flour');
    return firstFlour?.id ?? null;
  }, [recipe]);

  const adjustedIngredients = useMemo((): Ingredient[] => {
    if (!recipe) return [];
    
    let ingredients = recipe.ingredients.map(ing => ({
      ...ing,
      percentage: percentageOverrides[ing.id] ?? ing.percentage
    }));

    // Handle whole wheat substitution
    if (wholeWheatPercent !== null && primaryFlourId) {
      const primaryFlour = ingredients.find(i => i.id === primaryFlourId);
      if (primaryFlour) {
        const originalPercent = primaryFlour.percentage;
        const wwAmount = (originalPercent * wholeWheatPercent) / 100;
        const newBreadFlourPercent = originalPercent - wwAmount;

        // Check if whole wheat already exists
        const existingWW = ingredients.find(i => i.id === 'whole_wheat_sub');
        
        if (existingWW) {
          // Update existing
          ingredients = ingredients.map(ing => {
            if (ing.id === primaryFlourId) {
              return { ...ing, percentage: newBreadFlourPercent };
            }
            if (ing.id === 'whole_wheat_sub') {
              return { ...ing, percentage: wwAmount };
            }
            return ing;
          });
        } else {
          // Add new whole wheat and reduce bread flour
          ingredients = ingredients.map(ing => {
            if (ing.id === primaryFlourId) {
              return { ...ing, percentage: newBreadFlourPercent };
            }
            return ing;
          });
          
          // Insert whole wheat after primary flour
          const primaryIdx = ingredients.findIndex(i => i.id === primaryFlourId);
          const wwIngredient: Ingredient = {
            id: 'whole_wheat_sub',
            name: 'Whole wheat flour',
            percentage: wwAmount,
            type: 'flour'
          };
          ingredients.splice(primaryIdx + 1, 0, wwIngredient);
        }
      }
    } else {
      // Remove whole wheat substitution if disabled
      ingredients = ingredients.filter(i => i.id !== 'whole_wheat_sub');
    }

    return ingredients;
  }, [recipe, percentageOverrides, wholeWheatPercent, primaryFlourId]);

  // Calculate original total percentage from unmodified recipe
  const originalTotalPercentage = useMemo(
    () => recipe ? recipe.ingredients.reduce(
      (sum, ing) => ing.amountHint ? sum : sum + ing.percentage, 0
    ) : 0,
    [recipe]
  );

  const flourWeight = useMemo(
    () => recipe ? calculateFlourWeight({ ...recipe, ingredients: adjustedIngredients }, desiredTotalWeight, originalTotalPercentage) : 0,
    [recipe, adjustedIngredients, desiredTotalWeight, originalTotalPercentage]
  );

  const calculatedIngredients = useMemo(
    () => recipe ? calculateIngredientsWithPreferment(adjustedIngredients, flourWeight, preferment) : [],
    [recipe, adjustedIngredients, flourWeight, preferment]
  );

  const totalPercentage = useMemo(
    () => adjustedIngredients.reduce(
      (sum, ing) => ing.amountHint ? sum : sum + ing.percentage, 0
    ),
    [adjustedIngredients]
  );

  const hydrationPercentage = useMemo(() => {
    const totalFlour = adjustedIngredients
      .filter(ing => ing.type === 'flour' && !ing.amountHint)
      .reduce((sum, ing) => sum + ing.percentage, 0);
    const totalLiquid = adjustedIngredients
      .filter(ing => ing.type === 'liquid' && !ing.amountHint)
      .reduce((sum, ing) => sum + ing.percentage, 0);
    if (totalFlour === 0) return 0;
    return Math.round((totalLiquid / totalFlour) * 100);
  }, [adjustedIngredients]);

  const handlePercentageChange = (ingredientId: string, newPercentage: number) => {
    setPercentageOverrides(prev => ({
      ...prev,
      [ingredientId]: newPercentage
    }));
  };

  const handleResetPercentage = (ingredientId: string) => {
    setPercentageOverrides(prev => {
      const next = { ...prev };
      delete next[ingredientId];
      return next;
    });
  };

  const getOriginalPercentage = (ingredientId: string): number | undefined => {
    if (!recipe) return undefined;
    const original = recipe.ingredients.find(i => i.id === ingredientId);
    if (!original) return undefined;
    if (percentageOverrides[ingredientId] !== undefined && 
        percentageOverrides[ingredientId] !== original.percentage) {
      return original.percentage;
    }
    return undefined;
  };

  if (!recipe) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <p className="text-stone-500">Recipe not found</p>
      </div>
    );
  }

  const sourceDisplay = formatSource(recipe);

  const hasProgress = completedSteps.length > 0 || 
    Object.keys(percentageOverrides).length > 0 || 
    wholeWheatPercent !== null || 
    preferment !== null || 
    desiredTotalWeight !== null;

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <Link to="/" className="text-sm text-stone-400 hover:text-stone-600 transition-colors mb-6 inline-block">
        ← Back to recipes
      </Link>
      
      <header className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-stone-900">{recipe.name}</h1>
          <p className="text-stone-500 mt-1">{hydrationPercentage}% hydration</p>
        </div>
        {hasProgress && (
          <button
            onClick={handleResetRecipe}
            className="flex items-center gap-2 px-3 py-2 text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            title="Reset all progress and customizations"
          >
            <ArrowCounterClockwise size={16} />
            <span className="hidden sm:inline">Reset</span>
          </button>
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
            onPercentageChange={handlePercentageChange}
            onResetPercentage={handleResetPercentage}
            getOriginalPercentage={getOriginalPercentage}
            primaryFlourId={primaryFlourId}
            wholeWheatPercent={wholeWheatPercent}
            onWholeWheatChange={setWholeWheatPercent}
          />
        </div>
      </div>

      {recipe.steps.length > 0 && (
        <div className="mt-12">
          <RecipeTree 
            ingredients={calculatedIngredients} 
            steps={recipe.steps}
            completedSteps={completedSteps}
            onStepToggle={handleStepToggle}
          />
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
