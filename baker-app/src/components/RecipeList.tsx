import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gear, ClockCounterClockwise } from '@phosphor-icons/react';
import type { Recipe } from '../types/recipe';
import RecipeCard from './RecipeCard';
import SettingsModal from './SettingsModal';

interface RecipeListProps {
  recipes: Recipe[];
}

export default function RecipeList({ recipes }: RecipeListProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen relative grain-texture" style={{ background: 'var(--color-crumb)' }}>
      {/* Hero header */}
      <header className="pt-16 pb-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <h1
                className="animate-title text-5xl md:text-6xl tracking-wide"
                style={{ fontFamily: "'Playfair Display', serif", color: 'var(--color-char)', fontWeight: 400 }}
              >
                Baker
              </h1>
              <p
                className="mt-3 text-base tracking-wide animate-fade-up"
                style={{ color: 'var(--color-warmgray)', fontWeight: 300, animationDelay: '0.2s' }}
              >
                Precision baking, from formula to loaf.
              </p>
            </div>

            <div className="flex items-center gap-1 mt-2">
              <Link
                to="/history"
                className="p-2.5 rounded-full transition-colors"
                style={{ color: 'var(--color-warmgray)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-char)'; e.currentTarget.style.background = 'rgba(139,105,20,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-warmgray)'; e.currentTarget.style.background = 'transparent'; }}
                title="Version History"
              >
                <ClockCounterClockwise size={22} />
              </Link>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-full transition-colors"
                style={{ color: 'var(--color-warmgray)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-char)'; e.currentTarget.style.background = 'rgba(139,105,20,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-warmgray)'; e.currentTarget.style.background = 'transparent'; }}
                title="Settings"
              >
                <Gear size={22} />
              </button>
            </div>
          </div>

          {/* Wheat divider */}
          <div className="wheat-divider mt-8 animate-fade-up" style={{ animationDelay: '0.35s' }}>
            <span className="text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--color-crust)', opacity: 0.5, fontWeight: 500 }}>
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
            </span>
          </div>
        </div>
      </header>

      {/* Recipe grid */}
      <main className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, i) => (
              <div
                key={recipe.id}
                className="animate-fade-up"
                style={{ animationDelay: `${0.4 + i * 0.1}s` }}
              >
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}
