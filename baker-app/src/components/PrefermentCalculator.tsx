import { useState } from 'react';
import type { Preferment } from '../types/recipe';
import { calculatePrefermentContribution } from '../utils/calculations';

interface PrefermentCalculatorProps {
  preferment: Preferment | null;
  onPrefermentChange: (preferment: Preferment | null) => void;
  targetWeight?: number;
}

export default function PrefermentCalculator({
  preferment,
  onPrefermentChange,
  targetWeight
}: PrefermentCalculatorProps) {
  const [weightInput, setWeightInput] = useState('');
  const [hydration, setHydration] = useState(100);
  const [showDetails, setShowDetails] = useState(false);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWeightInput(value);

    if (value.trim() === '') {
      onPrefermentChange(null);
      return;
    }

    const weight = parseFloat(value);
    if (!isNaN(weight)) {
      onPrefermentChange({ weight: Math.max(0, weight), hydration });
    }
  };

  const handleHydrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setHydration(value);
      if (preferment) {
        onPrefermentChange({ ...preferment, hydration: value });
      }
    }
  };

  const handleUseTarget = () => {
    if (targetWeight && targetWeight > 0) {
      const rounded = Math.round(targetWeight);
      setWeightInput(String(rounded));
      onPrefermentChange({ weight: rounded, hydration });
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-stone-200 mt-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-stone-500 uppercase tracking-wide whitespace-nowrap">
          Preferment
        </label>
        <div className="flex-1">
          <input
            type="text"
            inputMode="decimal"
            value={weightInput}
            onChange={handleWeightChange}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent text-sm"
            placeholder={targetWeight ? `${Math.round(targetWeight)}g needed` : 'grams'}
          />
        </div>
      </div>

      {(targetWeight !== undefined && targetWeight > 0 || preferment) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {targetWeight !== undefined && targetWeight > 0 && (
            <>
              <span className="text-stone-400">Recipe needs {Math.round(targetWeight)}g</span>
              {(!preferment || preferment.weight !== Math.round(targetWeight)) && (
                <button
                  onClick={handleUseTarget}
                  className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  Use target
                </button>
              )}
            </>
          )}
          {targetWeight !== undefined && targetWeight > 0 && preferment && (
            <span className="text-stone-200">│</span>
          )}
          {preferment && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </button>
          )}
        </div>
      )}

      {preferment && showDetails && (() => {
        const contribution = calculatePrefermentContribution(preferment);
        return (
          <div className="mt-3 pt-3 border-t border-stone-100 space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-xs text-stone-500 whitespace-nowrap">Hydration %</label>
              <input
                type="text"
                inputMode="decimal"
                value={hydration}
                onChange={handleHydrationChange}
                className="w-20 px-2 py-1 border border-stone-200 rounded text-sm text-center"
              />
            </div>
            <div className="flex gap-4 text-xs text-stone-500">
              <span>Flour: {contribution.flour}g</span>
              <span>Liquid: {contribution.water}g</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
