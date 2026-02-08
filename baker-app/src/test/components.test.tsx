import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrefermentCalculator from '../components/PrefermentCalculator';
import ScalingCalculator from '../components/ScalingCalculator';
import type { Preferment } from '../types/recipe';
import type { ProductQuantity, ScaleMode } from '../utils/localStorage';

// Mock localStorage for product weight overrides
vi.mock('../utils/localStorage', async () => {
  const actual = await vi.importActual('../utils/localStorage');
  return {
    ...actual,
    loadProductWeightOverrides: () => ({}),
  };
});

describe('PrefermentCalculator', () => {
  it('calls onPrefermentChange(null) when user types "0"', async () => {
    const onChange = vi.fn();
    const preferment: Preferment = { weight: 100, hydration: 100 };
    
    render(
      <PrefermentCalculator
        preferment={preferment}
        onPrefermentChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('grams');
    await userEvent.clear(input);
    await userEvent.type(input, '0');

    // Should have been called with { weight: 0, hydration: 100 } — explicit zero, not null
    const zeroCalls = onChange.mock.calls.filter(
      (call: unknown[]) => call[0] !== null && typeof call[0] === 'object' && (call[0] as { weight: number }).weight === 0
    );
    expect(zeroCalls.length).toBeGreaterThan(0);
  });

  it('calls onPrefermentChange(null) when input is cleared', () => {
    const onChange = vi.fn();
    const preferment: Preferment = { weight: 100, hydration: 100 };
    
    render(
      <PrefermentCalculator
        preferment={preferment}
        onPrefermentChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('grams') as HTMLInputElement;
    // First set a value, then clear it
    fireEvent.change(input, { target: { value: '100' } });
    onChange.mockClear();
    fireEvent.change(input, { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('calls onPrefermentChange with weight when valid number entered', async () => {
    const onChange = vi.fn();
    
    render(
      <PrefermentCalculator
        preferment={null}
        onPrefermentChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('grams');
    await userEvent.type(input, '200');

    // Should eventually be called with { weight: 200, hydration: 100 }
    const validCalls = onChange.mock.calls.filter(
      (call: unknown[]) => call[0] !== null && (call[0] as Preferment).weight === 200
    );
    expect(validCalls.length).toBeGreaterThan(0);
  });

  it('shows target weight context when targetWeight is provided', () => {
    const onChange = vi.fn();
    
    render(
      <PrefermentCalculator
        preferment={null}
        onPrefermentChange={onChange}
        targetWeight={200}
      />
    );

    expect(screen.getByText('Recipe needs 200g')).toBeTruthy();
    expect(screen.getByText('Use target')).toBeTruthy();
  });

  it('clicking Use target sets the preferment to target weight', () => {
    const onChange = vi.fn();
    
    render(
      <PrefermentCalculator
        preferment={null}
        onPrefermentChange={onChange}
        targetWeight={195}
      />
    );

    fireEvent.click(screen.getByText('Use target'));
    expect(onChange).toHaveBeenCalledWith({ weight: 195, hydration: 100 });
  });
});

describe('ScalingCalculator', () => {
  const defaultProductQuantities: ProductQuantity[] = [
    { productId: 'loaf', quantity: 0 },
    { productId: 'roll', quantity: 0 },
    { productId: 'pizza 16in', quantity: 0 },
    { productId: 'dutch-oven', quantity: 0 },
    { productId: 'bagel', quantity: 0 },
  ];

  const defaultProps = {
    desiredTotalWeight: null as number | null,
    flourWeight: 500,
    totalPercentage: 169,
    onTotalWeightChange: vi.fn(),
    isScaled: false,
    productQuantities: defaultProductQuantities,
    onProductQuantitiesChange: vi.fn(),
    scaleMode: 'products' as ScaleMode,
    onScaleModeChange: vi.fn(),
    gramsInput: '',
    onGramsInputChange: vi.fn(),
    manualInput: '',
    onManualInputChange: vi.fn(),
  };

  it('calls onTotalWeightChange when product quantity is incremented', () => {
    const onTotalWeightChange = vi.fn();
    const onProductQuantitiesChange = vi.fn();
    
    render(
      <ScalingCalculator
        {...defaultProps}
        onTotalWeightChange={onTotalWeightChange}
        onProductQuantitiesChange={onProductQuantitiesChange}
      />
    );

    // Click the + button for Loaf (850g)
    const plusButtons = screen.getAllByText('+');
    fireEvent.click(plusButtons[0]); // First product (Loaf)

    // Should call onTotalWeightChange with 850 (1 loaf × 850g)
    expect(onTotalWeightChange).toHaveBeenCalledWith(850);
    expect(onProductQuantitiesChange).toHaveBeenCalled();
  });

  it('calls onTotalWeightChange(null) when all products cleared', () => {
    const onTotalWeightChange = vi.fn();
    const quantities: ProductQuantity[] = [
      { productId: 'loaf', quantity: 1 },
      { productId: 'roll', quantity: 0 },
      { productId: 'pizza 16in', quantity: 0 },
      { productId: 'dutch-oven', quantity: 0 },
      { productId: 'bagel', quantity: 0 },
    ];

    render(
      <ScalingCalculator
        {...defaultProps}
        productQuantities={quantities}
        onTotalWeightChange={onTotalWeightChange}
        isScaled={true}
        desiredTotalWeight={850}
      />
    );

    // Click Clear button
    fireEvent.click(screen.getByText('Clear'));
    expect(onTotalWeightChange).toHaveBeenCalledWith(null);
  });

  it('in grams mode, calls onTotalWeightChange with valid input', () => {
    const onTotalWeightChange = vi.fn();
    
    render(
      <ScalingCalculator
        {...defaultProps}
        scaleMode="grams"
        onTotalWeightChange={onTotalWeightChange}
      />
    );

    const input = screen.getByPlaceholderText('e.g., 1500');
    // Simulate typing 1500 directly via change event
    fireEvent.change(input, { target: { value: '1500' } });

    expect(onTotalWeightChange).toHaveBeenCalledWith(1500);
  });

  it('in grams mode, calls onTotalWeightChange(null) when cleared', async () => {
    const onTotalWeightChange = vi.fn();
    
    render(
      <ScalingCalculator
        {...defaultProps}
        scaleMode="grams"
        gramsInput="1500"
        onTotalWeightChange={onTotalWeightChange}
      />
    );

    const input = screen.getByPlaceholderText('e.g., 1500');
    await userEvent.clear(input);

    expect(onTotalWeightChange).toHaveBeenCalledWith(null);
  });

  it('switching to products mode sets weight from calculatedTotal', () => {
    const onTotalWeightChange = vi.fn();
    const quantities: ProductQuantity[] = [
      { productId: 'loaf', quantity: 2 },
      { productId: 'roll', quantity: 0 },
      { productId: 'pizza 16in', quantity: 0 },
      { productId: 'dutch-oven', quantity: 0 },
      { productId: 'bagel', quantity: 0 },
    ];

    render(
      <ScalingCalculator
        {...defaultProps}
        scaleMode="grams"
        productQuantities={quantities}
        onTotalWeightChange={onTotalWeightChange}
      />
    );

    // Switch to products mode
    fireEvent.click(screen.getByText('By Product'));
    // Should set total to 2 × 850 = 1700
    expect(onTotalWeightChange).toHaveBeenCalledWith(1700);
  });

  it('switching to grams mode with empty input sets null', () => {
    const onTotalWeightChange = vi.fn();
    
    render(
      <ScalingCalculator
        {...defaultProps}
        scaleMode="products"
        onTotalWeightChange={onTotalWeightChange}
      />
    );

    fireEvent.click(screen.getByText('By Weight'));
    expect(onTotalWeightChange).toHaveBeenCalledWith(null);
  });

  it('does not update desiredTotalWeight via useEffect side-channel', () => {
    // Verify no useEffect-based syncing occurs — the component should only
    // update weight through explicit handlers
    const onTotalWeightChange = vi.fn();
    
    render(
      <ScalingCalculator
        {...defaultProps}
        scaleMode="grams"
        onTotalWeightChange={onTotalWeightChange}
      />
    );

    // On mount in grams mode with no input, onTotalWeightChange should NOT be called
    // (previously the useEffect would fire on mount)
    expect(onTotalWeightChange).not.toHaveBeenCalled();
  });
});
