import type { CalculatedIngredientWithPreferment } from '../types/recipe';

interface IngredientListProps {
  ingredients: CalculatedIngredientWithPreferment[];
  flourWeight: number;
}

export default function IngredientList({ ingredients }: IngredientListProps) {
  const hasPrefermentDeductions = ingredients.some(i => i.prefermentDeduction);

  return (
    <div className="bg-white p-5 rounded-lg border border-stone-200">
      <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-4">Ingredients</h2>
      <div className="divide-y divide-stone-100">
        {ingredients.map(ingredient => (
          <div
            key={ingredient.id}
            className="py-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-stone-900">{ingredient.name}</span>
              <div className="text-right">
                <span className="text-stone-900 font-medium">{ingredient.finalDisplayWeight}</span>
                <span className="text-sm text-stone-400 ml-2">
                  {ingredient.percentage}%
                </span>
              </div>
            </div>
            {ingredient.prefermentDeduction && ingredient.prefermentDeduction > 0 && (
              <div className="mt-1 text-xs text-stone-400 text-right">
                {ingredient.displayWeight} − {ingredient.prefermentDeduction}g preferment
              </div>
            )}
          </div>
        ))}
      </div>
      {hasPrefermentDeductions && (
        <div className="mt-4 pt-4 border-t border-stone-100 text-xs text-stone-400">
          Amounts adjusted for preferment contribution
        </div>
      )}
    </div>
  );
}
