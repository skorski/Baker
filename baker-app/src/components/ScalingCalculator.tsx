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

export default function ScalingCalculator({
  flourWeight,
  totalPercentage,
  onTotalWeightChange,
  isScaled
}: ScalingCalculatorProps) {
  const [productQuantities, setProductQuantities] = useState<ProductQuantity[]>(
    doughProducts.map(p => ({ productId: p.id, quantity: 0 }))
  );
  const [useManualOverride, setUseManualOverride] = useState(false);
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
    if (useManualOverride) {
      return;
    }
    if (calculatedTotal > 0) {
      onTotalWeightChange(calculatedTotal);
    } else {
      onTotalWeightChange(null);
    }
  }, [calculatedTotal, useManualOverride, onTotalWeightChange]);

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

  const handleOverrideToggle = () => {
    const newValue = !useManualOverride;
    setUseManualOverride(newValue);
    if (!newValue) {
      setManualInput('');
      setError('');
      onTotalWeightChange(calculatedTotal > 0 ? calculatedTotal : null);
    }
  };

  const clearAllProducts = () => {
    setProductQuantities(prev => prev.map(pq => ({ ...pq, quantity: 0 })));
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 rounded-2xl shadow-xl border-4 border-amber-900">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-black text-amber-900 tracking-tight">
          SCALE YOUR BAKE
        </h2>
        <p className="text-amber-700 font-semibold mt-1">
          Select products to calculate total dough weight
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {doughProducts.map((product) => {
          const pq = productQuantities.find(p => p.productId === product.id);
          const quantity = pq?.quantity || 0;
          const isActive = quantity > 0;

          return (
            <div
              key={product.id}
              className={`
                relative p-4 rounded-xl border-3 transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-900 shadow-lg transform scale-[1.02]' 
                  : 'bg-white border-amber-300 hover:border-amber-500 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{product.icon}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  isActive ? 'bg-amber-900 text-amber-100' : 'bg-amber-100 text-amber-800'
                }`}>
                  {product.weightGrams}g
                </span>
              </div>
              
              <h3 className={`font-black text-lg ${isActive ? 'text-white' : 'text-amber-900'}`}>
                {product.name}
              </h3>
              <p className={`text-xs mb-3 ${isActive ? 'text-amber-100' : 'text-amber-600'}`}>
                {product.description}
              </p>

              {/* Quantity Controls */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleQuantityChange(product.id, -1)}
                  disabled={quantity === 0}
                  className={`
                    w-10 h-10 rounded-lg font-black text-xl transition-all
                    ${quantity === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-amber-900 text-white hover:bg-amber-800 active:scale-95 shadow-md'
                    }
                  `}
                  aria-label={`Decrease ${product.name} quantity`}
                >
                  −
                </button>
                
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => handleSetQuantity(product.id, e.target.value)}
                  className={`
                    w-14 h-10 text-center font-black text-xl rounded-lg border-3
                    ${isActive
                      ? 'bg-white text-amber-900 border-amber-900'
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                    }
                  `}
                  aria-label={`${product.name} quantity`}
                />
                
                <button
                  onClick={() => handleQuantityChange(product.id, 1)}
                  className="w-10 h-10 rounded-lg font-black text-xl bg-amber-900 text-white hover:bg-amber-800 active:scale-95 shadow-md transition-all"
                  aria-label={`Increase ${product.name} quantity`}
                >
                  +
                </button>
              </div>

              {/* Weight contribution */}
              {isActive && (
                <div className="mt-2 text-center">
                  <span className="text-sm font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
                    = {product.weightGrams * quantity}g
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Calculated Total */}
      {hasAnyProducts && (
        <div className="mb-4 p-4 bg-gradient-to-r from-amber-900 to-orange-800 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">CALCULATED TOTAL</span>
            <span className="text-3xl font-black">{calculatedTotal}g</span>
          </div>
          <button
            onClick={clearAllProducts}
            className="mt-2 text-sm text-amber-200 hover:text-white underline transition-colors"
          >
            Clear all products
          </button>
        </div>
      )}

      {/* Manual Override Section */}
      <div className={`
        p-4 rounded-xl border-3 transition-all
        ${useManualOverride 
          ? 'bg-gradient-to-r from-violet-100 to-purple-100 border-violet-900' 
          : 'bg-white border-dashed border-amber-300'
        }
      `}>
        <label className="flex items-center gap-3 cursor-pointer mb-3">
          <div className="relative">
            <input
              type="checkbox"
              checked={useManualOverride}
              onChange={handleOverrideToggle}
              className="sr-only peer"
            />
            <div className="w-12 h-7 bg-gray-300 rounded-full peer-checked:bg-violet-600 transition-colors"></div>
            <div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
          </div>
          <span className={`font-bold ${useManualOverride ? 'text-violet-900' : 'text-amber-800'}`}>
            MANUAL OVERRIDE
          </span>
        </label>

        {useManualOverride && (
          <div>
            <label htmlFor="manual-weight" className="block text-sm font-bold text-violet-800 mb-2">
              Enter exact dough weight (grams)
            </label>
            <input
              id="manual-weight"
              type="text"
              value={manualInput}
              onChange={handleManualInputChange}
              className="w-full px-4 py-3 text-xl font-bold border-3 border-violet-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-violet-300 bg-white"
              placeholder="e.g., 1500"
            />
            {error && (
              <p className="mt-2 text-sm font-bold text-red-600 bg-red-100 px-3 py-2 rounded-lg">
                ⚠️ {error}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 pt-4 border-t-3 border-amber-900">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-amber-100 rounded-lg p-3">
            <p className="text-xs font-bold text-amber-600 uppercase">Flour</p>
            <p className="text-lg font-black text-amber-900">{Math.round(flourWeight)}g</p>
          </div>
          <div className="bg-amber-100 rounded-lg p-3">
            <p className="text-xs font-bold text-amber-600 uppercase">Total %</p>
            <p className="text-lg font-black text-amber-900">{totalPercentage}%</p>
          </div>
          <div className={`rounded-lg p-3 ${isScaled ? 'bg-green-100' : 'bg-gray-100'}`}>
            <p className={`text-xs font-bold uppercase ${isScaled ? 'text-green-600' : 'text-gray-500'}`}>Status</p>
            <p className={`text-lg font-black ${isScaled ? 'text-green-700' : 'text-gray-600'}`}>
              {isScaled ? '✓ Scaled' : 'Default'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
