import { useState } from 'react';
import { Grains } from '@phosphor-icons/react';
import type { CalculatedIngredientWithPreferment } from '../types/recipe';

interface IngredientListProps {
  ingredients: CalculatedIngredientWithPreferment[];
  flourWeight: number;
  onPercentageChange: (ingredientId: string, newPercentage: number) => void;
  onResetPercentage: (ingredientId: string) => void;
  getOriginalPercentage: (ingredientId: string) => number | undefined;
  primaryFlourId: string | null;
  wholeWheatPercent: number | null;
  onWholeWheatChange: (percent: number | null) => void;
}

export default function IngredientList({ 
  ingredients,
  onPercentageChange,
  onResetPercentage,
  getOriginalPercentage,
  primaryFlourId,
  wholeWheatPercent,
  onWholeWheatChange
}: IngredientListProps) {
  const hasPrefermentDeductions = ingredients.some(i => i.prefermentDeduction);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editingWholeWheat, setEditingWholeWheat] = useState(false);
  const [wholeWheatEditValue, setWholeWheatEditValue] = useState('20');

  const handleStartEdit = (ingredient: CalculatedIngredientWithPreferment) => {
    if (ingredient.amountHint) return;
    setEditingId(ingredient.id);
    setEditValue(String(ingredient.percentage));
  };

  const handleFinishEdit = (ingredientId: string) => {
    const value = parseFloat(editValue);
    if (!isNaN(value) && value >= 0) {
      onPercentageChange(ingredientId, value);
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, ingredientId: string) => {
    if (e.key === 'Enter') {
      handleFinishEdit(ingredientId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditValue('');
    }
  };

  const handleWholeWheatToggle = () => {
    if (wholeWheatPercent === null) {
      onWholeWheatChange(20);
      setWholeWheatEditValue('20');
    } else {
      onWholeWheatChange(null);
    }
  };

  const handleWholeWheatEditStart = () => {
    setWholeWheatEditValue(String(wholeWheatPercent || 20));
    setEditingWholeWheat(true);
  };

  const handleWholeWheatEditFinish = () => {
    const value = parseFloat(wholeWheatEditValue);
    if (!isNaN(value) && value > 0 && value <= 100) {
      onWholeWheatChange(value);
    }
    setEditingWholeWheat(false);
  };

  const handleWholeWheatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleWholeWheatEditFinish();
    } else if (e.key === 'Escape') {
      setEditingWholeWheat(false);
    }
  };

  const isWholeWheatActive = wholeWheatPercent !== null;

  return (
    <div className="bg-white p-5 rounded-lg border border-stone-200">
      <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-4">Ingredients</h2>
      <div className="divide-y divide-stone-100">
        {ingredients.map(ingredient => {
          const originalPercentage = getOriginalPercentage(ingredient.id);
          const isEditing = editingId === ingredient.id;
          const hasOverride = originalPercentage !== undefined;
          const isPrimaryFlour = ingredient.id === primaryFlourId;

          return (
            <div
              key={ingredient.id}
              className="py-3"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-stone-900">{ingredient.name}</span>
                  {isPrimaryFlour && (
                    <button
                      onClick={handleWholeWheatToggle}
                      className={`p-1 rounded transition-colors ${
                        isWholeWheatActive
                          ? 'text-amber-700 hover:text-amber-800'
                          : 'text-stone-300 hover:text-stone-500'
                      }`}
                      title={isWholeWheatActive ? 'Remove whole wheat substitution' : 'Substitute with whole wheat'}
                    >
                      <Grains size={16} weight={isWholeWheatActive ? 'fill' : 'regular'} />
                    </button>
                  )}
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-stone-900 font-medium">{ingredient.finalDisplayWeight}</span>
                  
                  {ingredient.amountHint ? (
                    <span className="text-sm text-stone-400 ml-2">—</span>
                  ) : isEditing ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleFinishEdit(ingredient.id)}
                      onKeyDown={(e) => handleKeyDown(e, ingredient.id)}
                      className="w-16 px-1 py-0.5 text-sm text-right border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-400"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => handleStartEdit(ingredient)}
                      className="text-sm text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1"
                    >
                      {hasOverride && (
                        <span className="line-through text-stone-300">{originalPercentage}%</span>
                      )}
                      <span className={hasOverride ? 'text-amber-700' : ''}>{ingredient.percentage}%</span>
                    </button>
                  )}

                  {hasOverride && !isEditing && (
                    <button
                      onClick={() => onResetPercentage(ingredient.id)}
                      className="text-xs text-stone-300 hover:text-stone-500 transition-colors ml-1"
                      title="Reset to default"
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>
              
              {/* Whole wheat substitution indicator */}
              {isPrimaryFlour && isWholeWheatActive && (
                <div className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                  <span>→</span>
                  {editingWholeWheat ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      value={wholeWheatEditValue}
                      onChange={(e) => setWholeWheatEditValue(e.target.value)}
                      onBlur={handleWholeWheatEditFinish}
                      onKeyDown={handleWholeWheatKeyDown}
                      className="w-10 px-1 py-0.5 text-center border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-400 text-xs"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={handleWholeWheatEditStart}
                      className="hover:text-amber-700"
                    >
                      {wholeWheatPercent}%
                    </button>
                  )}
                  <span>whole wheat substitution</span>
                </div>
              )}
              
              {ingredient.prefermentDeduction && ingredient.prefermentDeduction > 0 && (
                <div className="mt-1 text-xs text-stone-400 text-right">
                  {ingredient.displayWeight} − {ingredient.prefermentDeduction}g preferment
                </div>
              )}
            </div>
          );
        })}
      </div>
      {hasPrefermentDeductions && (
        <div className="mt-4 pt-4 border-t border-stone-100 text-xs text-stone-400">
          Amounts adjusted for preferment contribution
        </div>
      )}
    </div>
  );
}
