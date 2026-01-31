import type { CalculatedIngredient } from '../types/recipe';

interface IngredientListProps {
  ingredients: CalculatedIngredient[];
  flourWeight: number;
}

export default function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <div className="bg-white p-5 rounded-lg border border-stone-200">
      <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-4">Ingredients</h2>
      <div className="divide-y divide-stone-100">
        {ingredients.map(ingredient => (
          <div
            key={ingredient.id}
            className="flex justify-between items-center py-3"
          >
            <span className="text-stone-900">{ingredient.name}</span>
            <div className="text-right">
              <span className="text-stone-900 font-medium">{ingredient.displayWeight}</span>
              <span className="text-sm text-stone-400 ml-2">
                {ingredient.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
