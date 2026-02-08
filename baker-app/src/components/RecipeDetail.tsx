import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowCounterClockwise, CheckCircle, CaretDown } from '@phosphor-icons/react';
import type { Recipe, Preferment, Ingredient } from '../types/recipe';
import { calculateFlourWeight, calculateIngredientsWithPreferment, getPrefermentTarget, sumTotalPercentage, sumDoughPercentage } from '../utils/calculations';
import { loadRecipeProgress, saveRecipeProgress, clearRecipeProgress, loadRecipeHistory, saveToHistory, loadRecipeVersions, formatShortDate, type RecipeProgress, type ProductQuantity, type ScaleMode, type HistoryEntry, type VersionEntry, type BakingOverrides } from '../utils/localStorage';
import { doughProducts } from '../data/doughProducts';
import ScalingCalculator from './ScalingCalculator';
import PrefermentCalculator from './PrefermentCalculator';
import IngredientList from './IngredientList';
import BakingInfo from './BakingInfo';
import RecipeTree from './RecipeTree';
import { getRecipeById } from '../data/recipeLoader';
import BakingLog from './BakingLog';

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

const defaultProductQuantities = (): ProductQuantity[] => 
  doughProducts.map(p => ({ productId: p.id, quantity: 0 }));

function mergeProductQuantities(saved: ProductQuantity[]): ProductQuantity[] {
  return doughProducts.map(p => {
    const existing = saved.find(pq => pq.productId === p.id);
    return existing ?? { productId: p.id, quantity: 0 };
  });
}

export type PercentageOverrides = Record<string, number>;

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const recipe = id ? getRecipeById(id) : undefined;

  const [desiredTotalWeight, setDesiredTotalWeight] = useState<number | null>(null);
  const [preferment, setPreferment] = useState<Preferment | null>(null);
  const [percentageOverrides, setPercentageOverrides] = useState<PercentageOverrides>({});
  const [wholeWheatPercent, setWholeWheatPercent] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [productQuantities, setProductQuantities] = useState<ProductQuantity[]>(defaultProductQuantities);
  const [scaleMode, setScaleMode] = useState<ScaleMode>('products');
  const [gramsInput, setGramsInput] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [bakingOverrides, setBakingOverrides] = useState<BakingOverrides>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [versionEntries, setVersionEntries] = useState<VersionEntry[]>([]);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);

  const applyProgress = useCallback((progress: RecipeProgress) => {
    setCompletedSteps(progress.completedSteps || []);
    setPercentageOverrides(progress.percentageOverrides || {});
    setWholeWheatPercent(progress.wholeWheatPercent ?? null);
    setPreferment(progress.preferment ?? null);
    setDesiredTotalWeight(progress.desiredTotalWeight ?? null);
    setProductQuantities(progress.productQuantities?.length ? mergeProductQuantities(progress.productQuantities) : defaultProductQuantities());
    setScaleMode(progress.scaleMode || 'products');
    setGramsInput(progress.gramsInput || '');
    setManualInput(progress.manualInput || '');
    setBakingOverrides(progress.bakingOverrides || {});
  }, []);

  const buildProgress = useCallback((): RecipeProgress => ({
    completedSteps,
    percentageOverrides,
    wholeWheatPercent,
    preferment,
    desiredTotalWeight,
    productQuantities,
    scaleMode,
    gramsInput,
    manualInput,
    bakingOverrides
  }), [completedSteps, percentageOverrides, wholeWheatPercent, preferment, desiredTotalWeight, productQuantities, scaleMode, gramsInput, manualInput, bakingOverrides]);

  // Load saved progress from localStorage
  useEffect(() => {
    if (!id) return;
    const saved = loadRecipeProgress(id);
    if (saved) applyProgress(saved);
    const versions = loadRecipeVersions(id);
    setVersionEntries(versions.entries);
    const history = loadRecipeHistory(id);
    setHistoryEntries(history.entries);
    setIsLoaded(true);
  }, [id]);

  // Save progress to localStorage when state changes
  useEffect(() => {
    if (!id || !isLoaded) return;
    saveRecipeProgress(id, buildProgress());
  }, [id, isLoaded, buildProgress]);

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
    setProductQuantities(defaultProductQuantities());
    setScaleMode('products');
    setGramsInput('');
    setManualInput('');
    setBakingOverrides({});
    clearRecipeProgress(id);
  }, [id]);

  const handleMadeIt = useCallback(() => {
    if (!id) return;
    const entry = saveToHistory(id, buildProgress());
    setHistoryEntries(prev => [...prev, entry]);
  }, [id, buildProgress]);

  const handleLoadVersionEntry = useCallback((entry: VersionEntry) => {
    applyProgress(entry.progress);
    setShowVersionDropdown(false);
  }, [applyProgress]);

  const handleLoadHistoryEntry = useCallback((entry: HistoryEntry) => {
    applyProgress(entry.progress);
  }, [applyProgress]);

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
    () => recipe ? sumTotalPercentage(recipe.ingredients) : 0,
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

  const prefermentTarget = useMemo(
    () => getPrefermentTarget(adjustedIngredients, flourWeight),
    [adjustedIngredients, flourWeight]
  );

  const prefermentName = useMemo(
    () => adjustedIngredients.find(i => i.isPreferment)?.name,
    [adjustedIngredients]
  );

  const totalPercentage = useMemo(
    () => sumDoughPercentage(adjustedIngredients),
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
    desiredTotalWeight !== null ||
    productQuantities.some(pq => pq.quantity > 0) ||
    gramsInput !== '' ||
    manualInput !== '' ||
    Object.keys(bakingOverrides).length > 0;

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
          ← Back to recipes
        </Link>
        
        <div className="flex items-center gap-2">
          {versionEntries.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                <span>Versions ({versionEntries.length})</span>
                <CaretDown size={14} className={`transition-transform ${showVersionDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showVersionDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  {versionEntries.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
                    <button
                      key={entry.version}
                      onClick={() => handleLoadVersionEntry(entry)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50 border-b border-stone-100 last:border-b-0"
                    >
                      <span className="font-medium">v{entry.version}</span>
                      <span className="text-stone-400 ml-2">{formatShortDate(entry.date)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
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
            productQuantities={productQuantities}
            onProductQuantitiesChange={setProductQuantities}
            scaleMode={scaleMode}
            onScaleModeChange={setScaleMode}
            gramsInput={gramsInput}
            onGramsInputChange={setGramsInput}
            manualInput={manualInput}
            onManualInputChange={setManualInput}
          />
          <PrefermentCalculator
            preferment={preferment}
            onPrefermentChange={setPreferment}
            targetWeight={prefermentTarget > 0 ? prefermentTarget : undefined}
          />
        </div>

        <div className="lg:col-span-2">
          <IngredientList
            ingredients={calculatedIngredients}
            onPercentageChange={handlePercentageChange}
            onResetPercentage={handleResetPercentage}
            getOriginalPercentage={getOriginalPercentage}
            primaryFlourId={primaryFlourId}
            wholeWheatPercent={wholeWheatPercent}
            onWholeWheatChange={setWholeWheatPercent}
            prefermentTarget={prefermentTarget > 0 ? prefermentTarget : undefined}
            prefermentName={prefermentName}
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
            headerContent={recipe.baking ? (
              <BakingInfo
                defaults={recipe.baking}
                overrides={bakingOverrides}
                onChange={setBakingOverrides}
              />
            ) : undefined}
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

      <div className="mt-10 pt-6 border-t border-stone-200">
          <button
            onClick={handleMadeIt}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
          >
            <CheckCircle size={20} weight="bold" />
            Made it!
          </button>
      </div>

      <BakingLog
        recipeId={id!}
        recipe={recipe}
        entries={historyEntries}
        onEntriesChange={setHistoryEntries}
        onLoadEntry={handleLoadHistoryEntry}
      />
    </div>
  );
}
