import { useState } from 'react';
import { Gear } from '@phosphor-icons/react';
import type { Recipe } from '../types/recipe';
import RecipeCard from './RecipeCard';
import SettingsModal from './SettingsModal';

interface RecipeListProps {
  recipes: Recipe[];
}

export default function RecipeList({ recipes }: RecipeListProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-light tracking-tight text-stone-900">Recipes</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          title="Settings"
        >
          <Gear size={24} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
      
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}
