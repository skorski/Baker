import { Link } from 'react-router-dom';

interface RecipeCardProps {
  recipe: {
    id: string;
    name: string;
    hydrationHint?: string;
    baseFlourWeight: number;
  };
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="block p-5 bg-white rounded-lg border border-stone-200 hover:border-stone-300 transition-colors"
    >
      <h2 className="text-lg font-medium text-stone-900 mb-1">{recipe.name}</h2>
      {recipe.hydrationHint && (
        <p className="text-sm text-stone-500 mb-2">{recipe.hydrationHint}</p>
      )}
      <p className="text-sm text-stone-400">
        {recipe.baseFlourWeight}g flour
      </p>
    </Link>
  );
}
