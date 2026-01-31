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
  const [hydrationInput, setHydrationInput] = useState('100');
  const [isExpanded, setIsExpanded] = useState(false);

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
      const hydration = parseFloat(hydrationInput) || 100;
      onPrefermentChange({ weight, hydration });
    }
  };

  const handleHydrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHydrationInput(value);

    if (weightInput.trim() === '') return;

    const hydration = parseFloat(value);
    const weight = parseFloat(weightInput);
    if (!isNaN(hydration) && hydration > 0 && !isNaN(weight) && weight > 0) {
      onPrefermentChange({ weight, hydration });
    }
  };

  const handleClear = () => {
    setWeightInput('');
    setHydrationInput('100');
    onPrefermentChange(null);
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-stone-200 mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wide">
          Preferment
        </h2>
        <span className="text-stone-400 text-sm">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm text-stone-600 mb-2">
              Preferment weight (grams)
            </label>
            <input
              type="text"
              value={weightInput}
              onChange={handleWeightChange}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
              placeholder="e.g., 200"
            />
          </div>

          <div>
            <label className="block text-sm text-stone-600 mb-2">
              Hydration (%)
            </label>
            <input
              type="text"
              value={hydrationInput}
              onChange={handleHydrationChange}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
              placeholder="100"
            />
          </div>

          {preferment && preferment.weight > 0 && (
            <>
              <div className="pt-4 border-t border-stone-100">
                <div className="text-xs text-stone-400 mb-2">Preferment contains:</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-stone-50 rounded">
                    <div className="text-xs text-stone-400">Flour</div>
                    <div className="text-sm font-medium text-stone-900">{contribution.flour}g</div>
                  </div>
                  <div className="text-center p-2 bg-stone-50 rounded">
                    <div className="text-xs text-stone-400">Water</div>
                    <div className="text-sm font-medium text-stone-900">{contribution.water}g</div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClear}
                className="w-full text-sm text-stone-400 hover:text-stone-600 transition-colors"
              >
                Clear preferment
              </button>
            </>
          )}
        </div>
      )}

      {!isExpanded && preferment && preferment.weight > 0 && (
        <div className="mt-2 text-sm text-stone-500">
          {preferment.weight}g at {preferment.hydration}% hydration
        </div>
      )}
    </div>
  );
}
