# Component Interfaces

**Feature**: 001-bread-recipe-scaling
**Date**: 2025-01-21
**Purpose**: Defines React component props and contracts

## Component Props

### RecipeCard

Displays a summary card for a recipe in the recipe list.

```typescript
interface RecipeCardProps {
  /** Recipe data to display */
  recipe: {
    id: string;
    name: string;
    hydrationHint?: string;
    baseFlourWeight: number;
  };
  
  /** Callback when card is clicked */
  onClick: (recipeId: string) => void;
}
```

**Usage**:
```tsx
<RecipeCard 
  recipe={recipe} 
  onClick={(id) => navigate(`/recipe/${id}`)} 
/>
```

### RecipeList

Displays a grid of recipe cards.

```typescript
interface RecipeListProps {
  /** Array of recipes to display */
  recipes: Recipe[];
}
```

**Usage**:
```tsx
<RecipeList recipes={allRecipes} />
```

### RecipeDetail

Main container for recipe detail view with scaling functionality.

```typescript
interface RecipeDetailProps {
  /** Recipe ID from URL parameter */
  recipeId: string;
}
```

**Internal State**:
```typescript
const [desiredTotalWeight, setDesiredTotalWeight] = useState<number | null>(null);
const [calculatedFlourWeight, setCalculatedFlourWeight] = useState<number>(
  recipe.baseFlourWeight
);
```

**Usage**:
```tsx
<RecipeDetail recipeId="white-sandwich-bread" />
```

### ScalingCalculator

Input control for desired total dough weight with real-time calculation.

```typescript
interface ScalingCalculatorProps {
  /** Current desired total weight (null = using default) */
  desiredTotalWeight: number | null;
  
  /** Calculated flour weight based on current settings */
  flourWeight: number;
  
  /** Total percentage sum for the recipe */
  totalPercentage: number;
  
  /** Callback when user enters new total weight */
  onTotalWeightChange: (weight: number | null) => void;
  
  /** Whether calculation is using default or scaled */
  isScaled: boolean;
}
```

**Usage**:
```tsx
<ScalingCalculator
  desiredTotalWeight={desiredTotalWeight}
  flourWeight={calculatedFlourWeight}
  totalPercentage={169}
  onTotalWeightChange={setDesiredTotalWeight}
  isScaled={desiredTotalWeight !== null}
/>
```

### IngredientList

Displays all ingredients with calculated weights and percentages.

```typescript
interface IngredientListProps {
  /** Ingredients with calculated weights */
  ingredients: CalculatedIngredient[];
  
  /** Current flour weight for reference */
  flourWeight: number;
}
```

**Usage**:
```tsx
<IngredientList 
  ingredients={calculatedIngredients} 
  flourWeight={calculatedFlourWeight}
/>
```

### IngredientRow

Single ingredient display with weight and percentage.

```typescript
interface IngredientRowProps {
  /** Ingredient data with calculated weight */
  ingredient: CalculatedIngredient;
  
  /** Whether this is the flour row (highlight differently) */
  isFlour: boolean;
}
```

**Usage**:
```tsx
<IngredientRow 
  ingredient={calculatedIngredient} 
  isFlour={ingredient.type === '\''flour'\''} 
/>
```

### StepList

Displays ordered list of recipe steps.

```typescript
interface StepListProps {
  /** Array of steps to display */
  steps: Step[];
}
```

**Usage**:
```tsx
<StepList steps={recipe.steps} />
```

### StepCard

Single step display with timing and dependencies.

```typescript
interface StepCardProps {
  /** Step data to display */
  step: Step;
  
  /** Step number for display (1-indexed) */
  stepNumber: number;
  
  /** Whether all dependencies are complete (for highlighting) */
  canStart: boolean;
}
```

**Usage**:
```tsx
<StepCard 
  step={step} 
  stepNumber={index + 1}
  canStart={true}
/>
```

## Utility Function Contracts

### calculateFlourWeight

Calculates flour weight from desired total dough weight.

```typescript
function calculateFlourWeight(
  recipe: Recipe,
  desiredTotalWeight: number | null
): number;
```

**Parameters**:
- `recipe`: Recipe with ingredients containing percentages
- `desiredTotalWeight`: Desired total dough weight, or null for default

**Returns**: Calculated flour weight in grams

**Example**:
```typescript
const flourWeight = calculateFlourWeight(recipe, 1000);
// For recipe with total 169%, returns 591.7g
```

### calculateIngredients

Calculates all ingredient weights from flour weight.

```typescript
function calculateIngredients(
  ingredients: Ingredient[],
  flourWeight: number
): CalculatedIngredient[];
```

**Parameters**:
- `ingredients`: Array of ingredients with percentages
- `flourWeight`: Current flour weight in grams

**Returns**: Array of ingredients with calculated weights

**Example**:
```typescript
const calculated = calculateIngredients(recipe.ingredients, 500);
// Returns ingredients with weight field populated
```

### validateTotalWeight

Validates user input for total dough weight.

```typescript
function validateTotalWeight(
  input: string
): { valid: true; value: number } | { valid: false; error: ValidationError };

type ValidationError = 
  | '\''empty'\''
  | '\''non-numeric'\''
  | '\''zero-or-negative'\''
  | '\''too-small'\''
  | '\''too-large'\'';
```

**Parameters**:
- `input`: Raw string input from user

**Returns**: Validation result with parsed value or error type

**Example**:
```typescript
const result = validateTotalWeight('\''1000'\'');
if (result.valid) {
  setDesiredTotalWeight(result.value);
} else {
  showError(result.error);
}
```

### roundIngredientAmount

Applies context-sensitive rounding to ingredient weights.

```typescript
function roundIngredientAmount(weight: number): number;
```

**Parameters**:
- `weight`: Raw calculated weight in grams

**Returns**: Rounded weight (1 decimal for < 10g, whole number for >= 10g)

**Example**:
```typescript
roundIngredientAmount(2.34) // => 2.3
roundIngredientAmount(384.6) // => 385
```

### formatIngredientWeight

Formats ingredient weight for display.

```typescript
function formatIngredientWeight(
  ingredient: Ingredient,
  weight: number
): string;
```

**Parameters**:
- `ingredient`: Ingredient data (may have amountHint)
- `weight`: Calculated weight in grams

**Returns**: Formatted string (e.g., "385g" or "as needed")

**Example**:
```typescript
formatIngredientWeight(waterIngredient, 325) // => "325g"
formatIngredientWeight(flourForDusting, 0) // => "for dusting"
```

## Data Flow

### Scaling Calculation Flow

```
User enters total weight
  ↓
validateTotalWeight(input)
  ↓
[valid] → setDesiredTotalWeight(value)
  ↓
calculateFlourWeight(recipe, desiredTotalWeight)
  ↓
calculateIngredients(recipe.ingredients, flourWeight)
  ↓
UI re-renders with new weights
```

### Component Data Flow

```
RecipeDetail (manages state)
  ├─→ ScalingCalculator
  │     └─→ [user input] → onTotalWeightChange → updates state
  │
  ├─→ IngredientList (receives calculated ingredients)
  │     └─→ IngredientRow (receives individual ingredient)
  │
  └─→ StepList (receives steps, no calculation)
        └─→ StepCard (receives individual step)
```

## Testing Contracts

### Unit Test Contracts

**Calculation Functions**:
```typescript
describe('\''calculateFlourWeight'\'', () => {
  it('\''should calculate flour weight from total'\'', () => {
    const recipe = createTestRecipe({ totalPercentage: 169 });
    expect(calculateFlourWeight(recipe, 1000)).toBeCloseTo(591.7, 1);
  });
  
  it('\''should return base flour weight when total is null'\'', () => {
    const recipe = createTestRecipe({ baseFlourWeight: 500 });
    expect(calculateFlourWeight(recipe, null)).toBe(500);
  });
});
```

### Integration Test Contracts

**Component Integration**:
```typescript
describe('\''RecipeDetail'\'', () => {
  it('\''should update ingredients when total weight changes'\'', async () => {
    render(<RecipeDetail recipeId="test-recipe" />);
    
    const input = screen.getByLabelText(/desired total dough weight/i);
    await userEvent.type(input, '\''1000'\'');
    
    expect(screen.getByText(/591\.7g/i)).toBeInTheDocument();
  });
});
```

### E2E Test Contracts

**User Flow**:
```typescript
describe('\''Recipe Scaling Flow'\'', () => {
  it('\''should scale recipe from browse to detail'\'', () => {
    cy.visit('\''/'\''');
    cy.contains('\''White Sandwich Bread'\'').click();
    
    cy.get('\''[data-testid="total-weight-input"]'\'').type('\''1000'\'');
    cy.contains('\''591.7g'\'').should('\''be.visible'\'');
    cy.contains('\''384.6g'\'').should('\''be.visible'\'');
  });
});
```

## Summary

Component interfaces follow React best practices with clear prop types, unidirectional data flow, and separation of concerns. State is managed in **RecipeDetail** parent component and flows down through props. User interactions bubble up through callbacks. All calculation logic is pure functions that can be unit tested independently.

**Key Principles**:
1. Props down, events up (React data flow)
2. Pure calculation functions (no side effects)
3. Type-safe interfaces (TypeScript)
4. Single source of truth (state in parent)
5. Separation of concerns (presentation vs logic)
