import { useState, useEffect, useMemo } from 'react';
import { validateTotalWeight } from '../utils/calculations';
import { doughProducts } from '../data/doughProducts';

interface ScalingCalculatorProps {
  desiredTotalWeight: number | null;
  flourWeight: number;
  totalPercentage: number;
  onTotalWeightChange: (weight: number | null) => void;
  isScaled: boolean;
}

interface ProductQuantity {
  productId: string;
  quantity: number;
}

type ScaleMode = 'products' | 'grams' | 'manual';

export default function ScalingCalculator({
  flourWeight,
  totalPercentage,
  onTotalWeightChange,
  isScaled
}: ScalingCalculatorProps) {
  const [productQuantities, setProductQuantities] = useState<ProductQuantity[]>(
    doughProducts.map(p => ({ productId: p.id, quantity: 0 }))
  );
  const [scaleMode, setScaleMode] = useState<ScaleMode>('products');
  const [gramsInput, setGramsInput] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string>('');

  const calculatedTotal = useMemo(() => {
    return productQuantities.reduce((sum, pq) => {
      const product = doughProducts.find(p => p.id === pq.productId);
      return sum + (product ? product.weightGrams * pq.quantity : 0);
    }, 0);
  }, [productQuantities]);

  const hasAnyProducts = productQuantities.some(pq => pq.quantity > 0);

  useEffect(() => {
    if (scaleMode === 'manual' || scaleMode === 'grams') {
      return;
    }
    if (calculatedTotal > 0) {
      onTotalWeightChange(calculatedTotal);
    } else {
      onTotalWeightChange(null);
    }
  }, [calculatedTotal, scaleMode, onTotalWeightChange]);

  const handleQuantityChange = (productId: string, delta: number) => {
    setProductQuantities(prev =>
      prev.map(pq =>
        pq.productId === productId
          ? { ...pq, quantity: Math.max(0, pq.quantity + delta) }
          : pq
      )
    );
  };

  const handleSetQuantity = (productId: string, value: string) => {
    const num = parseInt(value, 10);
    setProductQuantities(prev =>
      prev.map(pq =>
        pq.productId === productId
          ? { ...pq, quantity: isNaN(num) ? 0 : Math.max(0, num) }
          : pq
      )
    );
  };

  const handleGramsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGramsInput(value);

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
        'zero-or-negative': 'Weight must be greater than 0',
        'too-small': 'Warning: Very small batch',
        'too-large': 'Warning: Very large batch'
      };
      setError(errorMessages[result.error]);
    }
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualInput(value);

    if (value.trim() === '') {
      onTotalWeightChange(calculatedTotal > 0 ? calculatedTotal : null);
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
        'zero-or-negative': 'Weight must be greater than 0',
        'too-small': 'Warning: Very small batch',
        'too-large': 'Warning: Very large batch'
      };
      setError(errorMessages[result.error]);
    }
  };

  const handleModeChange = (mode: ScaleMode) => {
    setScaleMode(mode);
    setError('');
    if (mode === 'products') {
      setGramsInput('');
      setManualInput('');
      onTotalWeightChange(calculatedTotal > 0 ? calculatedTotal : null);
    } else if (mode === 'grams') {
      setManualInput('');
      if (gramsInput.trim()) {
        const result = validateTotalWeight(gramsInput);
        if (result.valid) onTotalWeightChange(result.value);
      } else {
        onTotalWeightChange(null);
      }
    } else if (mode === 'manual') {
      setGramsInput('');
      if (manualInput.trim()) {
        const result = validateTotalWeight(manualInput);
        if (result.valid) onTotalWeightChange(result.value);
      } else {
        onTotalWeightChange(calculatedTotal > 0 ? calculatedTotal : null);
      }
    }
  };

  const clearAllProducts = () => {
    setProductQuantities(prev => prev.map(pq => ({ ...pq, quantity: 0 })));
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-stone-200">
      <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-4">Scale Recipe</h2>

      {/* Mode Selector */}
      <div className="flex gap-1 mb-5 bg-stone-100 p-1 rounded-lg">
        {[
          { mode: 'products' as ScaleMode, label: 'By Product' },
          { mode: 'grams' as ScaleMode, label: 'By Weight' },
          { mode: 'manual' as ScaleMode, label: 'Override' }
        ].map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => handleModeChange(mode)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              scaleMode === mode
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Products Mode */}
      {scaleMode === 'products' && (
        <>
          <div className="space-y-2 mb-4">
            {doughProducts.map((product) => {
              const pq = productQuantities.find(p => p.productId === product.id);
              const quantity = pq?.quantity || 0;

              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-stone-200"
                >
                  <div>
                    <div className="text-sm font-medium text-stone-900">{product.name}</div>
                    <div className="text-xs text-stone-400">{product.weightGrams}g each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(product.id, -1)}
                      disabled={quantity === 0}
                      className="w-8 h-8 rounded-md border border-stone-200 text-stone-500 font-medium text-sm disabled:opacity-30 hover:bg-stone-50 transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={quantity}
                      onChange={(e) => handleSetQuantity(product.id, e.target.value)}
                      className="w-10 h-8 text-center text-sm font-medium border border-stone-200 rounded-md"
                    />
                    <button
                      onClick={() => handleQuantityChange(product.id, 1)}
                      className="w-8 h-8 rounded-md bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {hasAnyProducts && (
            <div className="flex items-center justify-between bg-stone-900 text-white px-4 py-3 rounded-lg mb-4">
              <span className="text-sm font-medium">Total: {calculatedTotal}g</span>
              <button onClick={clearAllProducts} className="text-xs text-stone-400 hover:text-white transition-colors">
                Clear
              </button>
            </div>
          )}
        </>
      )}

      {/* Grams Mode */}
      {scaleMode === 'grams' && (
        <div className="mb-4">
          <label className="block text-sm text-stone-600 mb-2">
            Total dough weight (grams)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={gramsInput}
            onChange={handleGramsInputChange}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
            placeholder="e.g., 1500"
          />
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}

      {/* Manual Override Mode */}
      {scaleMode === 'manual' && (
        <div className="mb-4">
          <label className="block text-sm text-stone-600 mb-2">
            Override weight (grams)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={manualInput}
            onChange={handleManualInputChange}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
            placeholder="e.g., 1500"
          />
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-100">
        <div className="text-center">
          <div className="text-xs text-stone-400 mb-1">Flour</div>
          <div className="text-sm font-medium text-stone-900">{Math.round(flourWeight)}g</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-stone-400 mb-1">Total %</div>
          <div className="text-sm font-medium text-stone-900">{Math.round(totalPercentage)}%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-stone-400 mb-1">Status</div>
          <div className={`text-sm font-medium ${isScaled ? 'text-amber-700' : 'text-stone-400'}`}>
            {isScaled ? 'Scaled' : 'Default'}
          </div>
        </div>
      </div>
    </div>
  );
}
