import { useState } from 'react';
import type { Preferment, PrefermentContribution } from '../types/recipe';
import { calculatePrefermentContribution } from '../utils/calculations';

interface PrefermentCalculatorProps {
  preferment: Preferment | null;
  onPrefermentChange: (preferment: Preferment | null) => void;
}

export default function PrefermentCalculator({
  preferment,
  onPrefermentChange
}: PrefermentCalculatorProps) {
  const [weightInput, setWeightInput] = useState('');
  const [hydration, setHydration] = useState(100);
  const [showDetails, setShowDetails] = useState(false);

  const contribution: PrefermentContribution = calculatePrefermentContribution(preferment);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWeightInput(value);

    if (value.trim() === '') {
      onPrefermentChange(null);
      return;
    }

    const weight = parseFloat(value);
    if (!isNaN(weight) && weight > 0) {
      onPrefermentChange({ weight, hydration });
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
            placeholder="grams"
          />
        </div>
      </div>

      {preferment && preferment.weight > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </button>

          {showDetails && (
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
          )}
        </div>
      )}
    </div>
  );
}
