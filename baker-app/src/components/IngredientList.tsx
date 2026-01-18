import type { CalculatedIngredient } from '../types/recipe';

interface IngredientListProps {
  ingredients: CalculatedIngredient[];
  flourWeight: number;
}

export default function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
      <div className="space-y-2">
        {ingredients.map(ingredient => (
          <div
            key={ingredient.id}
            className="flex justify-between items-center py-2 border-b last:border-b-0"
          >
            <span className="font-medium">{ingredient.name}</span>
            <div className="text-right">
              <span className="text-lg">{ingredient.displayWeight}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({ingredient.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
