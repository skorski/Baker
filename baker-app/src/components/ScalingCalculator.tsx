import { useState } from 'react';
import { validateTotalWeight } from '../utils/calculations';

interface ScalingCalculatorProps {
  desiredTotalWeight: number | null;
  flourWeight: number;
  totalPercentage: number;
  onTotalWeightChange: (weight: number | null) => void;
  isScaled: boolean;
}

export default function ScalingCalculator({
  desiredTotalWeight,
  flourWeight,
  totalPercentage,
  onTotalWeightChange,
  isScaled
}: ScalingCalculatorProps) {
  const [inputValue, setInputValue] = useState(desiredTotalWeight?.toString() || '');
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim() === '') {
      onTotalWeightChange(null);
      setError('');
      return;
    }

    const result = validateTotalWeight(value);
    if (result.valid) {
      onTotalWeightChange(result.value);
      setError('');
    } else {
      const errorMessages = {
        empty: 'Please enter a dough weight',
        'non-numeric': 'Please enter a valid number',
        'zero-or-negative': 'Dough weight must be greater than 0',
        'too-small': 'Warning: Very small batch',
        'too-large': 'Warning: Very large batch'
      };
      setError(errorMessages[result.error]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Scale Recipe</h2>

      <div className="mb-4">
        <label htmlFor="total-weight" className="block font-medium mb-2">
          Desired Total Dough Weight (g)
        </label>
        <input
          id="total-weight"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
          placeholder="e.g., 1000"
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Flour Weight:</span> {Math.round(flourWeight * 10) / 10}g
        </p>
        <p>
          <span className="font-medium">Total Percentage:</span> {totalPercentage}%
        </p>
        <p>
          <span className="font-medium">Status:</span>{' '}
          {isScaled ? 'Scaled' : 'Default'}
        </p>
      </div>
    </div>
  );
}
