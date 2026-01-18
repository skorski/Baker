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
      className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
    >
      <h2 className="text-2xl font-semibold mb-2">{recipe.name}</h2>
      {recipe.hydrationHint && (
        <p className="text-gray-600 mb-2">{recipe.hydrationHint}</p>
      )}
      <p className="text-sm text-gray-500">
        Default: {recipe.baseFlourWeight}g flour
      </p>
    </Link>
  );
}
