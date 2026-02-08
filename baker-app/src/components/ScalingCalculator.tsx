import { useMemo } from 'react';
import { validateTotalWeight } from '../utils/calculations';
import { doughProducts } from '../data/doughProducts';
import { loadProductWeightOverrides } from '../utils/localStorage';
import type { ProductQuantity, ScaleMode } from '../utils/localStorage';

interface ScalingCalculatorProps {
  desiredTotalWeight: number | null;
  flourWeight: number;
  totalPercentage: number;
  onTotalWeightChange: (weight: number | null) => void;
  isScaled: boolean;
  productQuantities: ProductQuantity[];
  onProductQuantitiesChange: (quantities: ProductQuantity[]) => void;
  scaleMode: ScaleMode;
  onScaleModeChange: (mode: ScaleMode) => void;
  gramsInput: string;
  onGramsInputChange: (value: string) => void;
  manualInput: string;
  onManualInputChange: (value: string) => void;
}

export default function ScalingCalculator({
  flourWeight,
  totalPercentage,
  onTotalWeightChange,
  isScaled,
  productQuantities,
  onProductQuantitiesChange,
  scaleMode,
  onScaleModeChange,
  gramsInput,
  onGramsInputChange,
  manualInput,
  onManualInputChange
}: ScalingCalculatorProps) {
  const weightOverrides = useMemo(() => loadProductWeightOverrides(), []);

  const getEffectiveWeight = (product: typeof doughProducts[0]) =>
    weightOverrides[product.id] ?? product.weightGrams;

  const computeProductTotal = (quantities: ProductQuantity[]) => {
    return quantities.reduce((sum, pq) => {
      const product = doughProducts.find(p => p.id === pq.productId);
      return sum + (product ? getEffectiveWeight(product) * pq.quantity : 0);
    }, 0);
  };

  const calculatedTotal = useMemo(
    () => computeProductTotal(productQuantities),
    [productQuantities, weightOverrides]
  );

  const hasAnyProducts = productQuantities.some(pq => pq.quantity > 0);

  const handleQuantityChange = (productId: string, delta: number) => {
    const updated = productQuantities.map(pq =>
      pq.productId === productId
        ? { ...pq, quantity: Math.max(0, pq.quantity + delta) }
        : pq
    );
    onProductQuantitiesChange(updated);
    if (scaleMode === 'products') {
      const total = computeProductTotal(updated);
      onTotalWeightChange(total > 0 ? total : null);
    }
  };

  const handleSetQuantity = (productId: string, value: string) => {
    const num = parseInt(value, 10);
    const updated = productQuantities.map(pq =>
      pq.productId === productId
        ? { ...pq, quantity: isNaN(num) ? 0 : Math.max(0, num) }
        : pq
    );
    onProductQuantitiesChange(updated);
    if (scaleMode === 'products') {
      const total = computeProductTotal(updated);
      onTotalWeightChange(total > 0 ? total : null);
    }
  };

  const handleGramsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onGramsInputChange(value);

    if (value.trim() === '') {
      onTotalWeightChange(null);
      return;
    }

    const result = validateTotalWeight(value);
    if (result.valid) {
      onTotalWeightChange(result.value);
    }
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onManualInputChange(value);

    if (value.trim() === '') {
      onTotalWeightChange(calculatedTotal > 0 ? calculatedTotal : null);
      return;
    }

    const result = validateTotalWeight(value);
    if (result.valid) {
      onTotalWeightChange(result.value);
    }
  };

  const handleModeChange = (mode: ScaleMode) => {
    onScaleModeChange(mode);
    if (mode === 'products') {
      onGramsInputChange('');
      onManualInputChange('');
      onTotalWeightChange(calculatedTotal > 0 ? calculatedTotal : null);
    } else if (mode === 'grams') {
      onManualInputChange('');
      if (gramsInput.trim()) {
        const result = validateTotalWeight(gramsInput);
        if (result.valid) onTotalWeightChange(result.value);
      } else {
        onTotalWeightChange(null);
      }
    } else if (mode === 'manual') {
      onGramsInputChange('');
      if (manualInput.trim()) {
        const result = validateTotalWeight(manualInput);
        if (result.valid) onTotalWeightChange(result.value);
      } else {
        onTotalWeightChange(calculatedTotal > 0 ? calculatedTotal : null);
      }
    }
  };

  const clearAllProducts = () => {
    onProductQuantitiesChange(productQuantities.map(pq => ({ ...pq, quantity: 0 })));
    if (scaleMode === 'products') {
      onTotalWeightChange(null);
    }
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
                    <div className="text-xs text-stone-400">{getEffectiveWeight(product)}g each</div>
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
            onChange={handleGramsChange}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
            placeholder="e.g., 1500"
          />
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
            onChange={handleManualChange}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
            placeholder="e.g., 1500"
          />
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
