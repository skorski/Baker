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
    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
      <h2 className="text-lg font-bold text-amber-900 mb-3">Scale Your Bake</h2>

      {/* Mode Selector */}
      <div className="flex gap-1 mb-4 bg-amber-100 p-1 rounded-lg">
        {[
          { mode: 'products' as ScaleMode, label: 'By Product' },
          { mode: 'grams' as ScaleMode, label: 'By Grams' },
          { mode: 'manual' as ScaleMode, label: 'Override' }
        ].map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => handleModeChange(mode)}
            className={`flex-1 py-1.5 px-2 text-sm font-medium rounded transition-colors ${
              scaleMode === mode
                ? 'bg-amber-900 text-white'
                : 'text-amber-700 hover:bg-amber-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Products Mode */}
      {scaleMode === 'products' && (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {doughProducts.map((product) => {
              const pq = productQuantities.find(p => p.productId === product.id);
              const quantity = pq?.quantity || 0;
              const isActive = quantity > 0;

              return (
                <div
                  key={product.id}
                  className={`p-2 rounded-lg border text-center ${
                    isActive ? 'bg-amber-200 border-amber-400' : 'bg-white border-amber-200'
                  }`}
                >
                  <div className="text-xs font-semibold text-amber-900">{product.name}</div>
                  <div className="text-xs text-amber-600 mb-1">{product.weightGrams}g</div>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleQuantityChange(product.id, -1)}
                      disabled={quantity === 0}
                      className="w-6 h-6 rounded bg-amber-100 text-amber-900 font-bold text-sm disabled:opacity-40"
                    >
                      −
                    </button>
                    <input
                      type="text"
                      value={quantity}
                      onChange={(e) => handleSetQuantity(product.id, e.target.value)}
                      className="w-8 h-6 text-center text-sm font-semibold border border-amber-300 rounded"
                    />
                    <button
                      onClick={() => handleQuantityChange(product.id, 1)}
                      className="w-6 h-6 rounded bg-amber-900 text-white font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {hasAnyProducts && (
            <div className="flex items-center justify-between bg-amber-900 text-white px-3 py-2 rounded-lg mb-3">
              <span className="text-sm font-medium">Total: {calculatedTotal}g</span>
              <button onClick={clearAllProducts} className="text-xs text-amber-200 hover:text-white underline">
                Clear
              </button>
            </div>
          )}
        </>
      )}

      {/* Grams Mode */}
      {scaleMode === 'grams' && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-amber-800 mb-1">
            Total dough weight (grams)
          </label>
          <input
            type="text"
            value={gramsInput}
            onChange={handleGramsInputChange}
            className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="e.g., 1500"
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      )}

      {/* Manual Override Mode */}
      {scaleMode === 'manual' && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-amber-800 mb-1">
            Override weight (grams)
          </label>
          <input
            type="text"
            value={manualInput}
            onChange={handleManualInputChange}
            className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="e.g., 1500"
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-amber-100 rounded p-2">
          <div className="text-amber-600">Flour</div>
          <div className="font-bold text-amber-900">{Math.round(flourWeight)}g</div>
        </div>
        <div className="bg-amber-100 rounded p-2">
          <div className="text-amber-600">Total %</div>
          <div className="font-bold text-amber-900">{totalPercentage}%</div>
        </div>
        <div className={`rounded p-2 ${isScaled ? 'bg-green-100' : 'bg-gray-100'}`}>
          <div className={isScaled ? 'text-green-600' : 'text-gray-500'}>Status</div>
          <div className={`font-bold ${isScaled ? 'text-green-700' : 'text-gray-600'}`}>
            {isScaled ? 'Scaled' : 'Default'}
          </div>
        </div>
      </div>
    </div>
  );
}
