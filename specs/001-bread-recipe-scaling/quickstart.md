# Quickstart Guide: Bread Recipe Scaling Calculator

**Feature**: 001-bread-recipe-scaling
**Date**: 2025-01-21
**Audience**: Developers implementing this feature

## Overview

This guide walks you through setting up and implementing the bread recipe scaling calculator from scratch. Follow these steps in order to build a working application.

## Prerequisites

- Node.js 18+ installed
- Basic familiarity with React and TypeScript
- Code editor (VS Code recommended)
- Git for version control

## Step 1: Project Setup

### Initialize Vite + React + TypeScript

```bash
# Create new project
npm create vite@latest baker-app -- --template react-ts

# Navigate to project directory
cd baker-app

# Install dependencies
npm install
```

### Install Additional Dependencies

```bash
# Routing
npm install react-router-dom

# Styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# E2E Testing (optional)
npm install -D cypress
```

### Configure Tailwind CSS

Edit `tailwind.config.js`:
```javascript
/** @type {import('\''tailwindcss'\'').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Edit `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Configure Vitest

Edit `vite.config.ts`:
```typescript
import { defineConfig } from '\''vite'\'';
import react from '\''@vitejs/plugin-react'\'';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: '\''jsdom'\'',
    setupFiles: '\''./src/test/setup.ts'\'',
  },
});
```

Create `src/test/setup.ts`:
```typescript
import '\''@testing-library/jest-dom'\'';
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Step 2: Create Type Definitions

Create `src/types/recipe.ts`:
```typescript
export interface Recipe {
  id: string;
  name: string;
  baseFlourWeight: number;
  hydrationHint?: string;
  ingredients: Ingredient[];
  steps: Step[];
  notes?: string;
  source?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  percentage: number;
  type: IngredientType;
  amountHint?: string;
}

export type IngredientType =
  | '\''flour'\''
  | '\''liquid'\''
  | '\''fat'\''
  | '\''seasoning'\''
  | '\''leavening'\''
  | '\''enrichment'\''
  | '\''mix-in'\'';

export interface Step {
  id: string;
  title: string;
  description: string;
  technique: TechniqueType;
  activeMinutes: number;
  passiveMinutes: number;
  temperature?: string;
  dependencies: string[];
}

export type TechniqueType =
  | '\''mixing'\''
  | '\''kneading'\''
  | '\''folding'\''
  | '\''shaping'\''
  | '\''proofing'\''
  | '\''scoring'\''
  | '\''baking'\''
  | '\''cooling'\'';

export interface CalculatedIngredient extends Ingredient {
  weight: number;
  displayWeight: string;
}

export interface ScalingState {
  desiredTotalWeight: number | null;
  calculatedFlourWeight: number;
  isScaled: boolean;
}

export type ValidationError =
  | '\''empty'\''
  | '\''non-numeric'\''
  | '\''zero-or-negative'\''
  | '\''too-small'\''
  | '\''too-large'\'';

export type ValidationResult =
  | { valid: true; value: number }
  | { valid: false; error: ValidationError };
```

## Step 3: Implement Calculation Functions

Create `src/utils/calculations.ts`:
```typescript
import { Recipe, Ingredient, CalculatedIngredient, ValidationResult } from '\''../types/recipe'\'';

export function calculateFlourWeight(
  recipe: Recipe,
  desiredTotalWeight: number | null
): number {
  if (desiredTotalWeight === null) {
    return recipe.baseFlourWeight;
  }

  const totalPercentage = recipe.ingredients.reduce(
    (sum, ingredient) => {
      if (ingredient.amountHint) return sum;
      return sum + ingredient.percentage;
    },
    0
  );

  return (desiredTotalWeight * 100) / totalPercentage;
}

export function calculateIngredientWeight(
  flourWeight: number,
  percentage: number
): number {
  return (flourWeight * percentage) / 100;
}

export function roundIngredientAmount(weight: number): number {
  if (weight < 10) {
    return Math.round(weight * 10) / 10;
  }
  return Math.round(weight);
}

export function calculateIngredients(
  ingredients: Ingredient[],
  flourWeight: number
): CalculatedIngredient[] {
  return ingredients.map(ingredient => {
    if (ingredient.amountHint) {
      return {
        ...ingredient,
        weight: 0,
        displayWeight: ingredient.amountHint
      };
    }

    const rawWeight = calculateIngredientWeight(flourWeight, ingredient.percentage);
    const roundedWeight = roundIngredientAmount(rawWeight);

    return {
      ...ingredient,
      weight: roundedWeight,
      displayWeight: `${roundedWeight}g`
    };
  });
}

export function validateTotalWeight(input: string): ValidationResult {
  const trimmed = input.trim();
  if (trimmed === '\'\'\'') {
    return { valid: false, error: '\''empty'\'' };
  }

  const value = Number(trimmed);
  if (isNaN(value)) {
    return { valid: false, error: '\''non-numeric'\'' };
  }

  if (value <= 0) {
    return { valid: false, error: '\''zero-or-negative'\'' };
  }

  if (value < 100) {
    return { valid: false, error: '\''too-small'\'' };
  }

  if (value > 10000) {
    return { valid: false, error: '\''too-large'\'' };
  }

  return { valid: true, value };
}
```

## Step 4: Create Sample Recipe Data

Create `src/data/recipes.json`:
```json
{
  "recipes": [
    {
      "id": "basic-bread",
      "name": "Basic Bread",
      "baseFlourWeight": 500,
      "hydrationHint": "65% hydration",
      "ingredients": [
        {
          "id": "flour",
          "name": "Bread Flour",
          "percentage": 100,
          "type": "flour"
        },
        {
          "id": "water",
          "name": "Water",
          "percentage": 65,
          "type": "liquid"
        },
        {
          "id": "salt",
          "name": "Salt",
          "percentage": 2,
          "type": "seasoning"
        },
        {
          "id": "yeast",
          "name": "Active Dry Yeast",
          "percentage": 2,
          "type": "leavening"
        }
      ],
      "steps": [
        {
          "id": "mix",
          "title": "Mix Ingredients",
          "description": "Combine flour, water, yeast, and salt in a large bowl. Mix until no dry flour remains.",
          "technique": "mixing",
          "activeMinutes": 5,
          "passiveMinutes": 0,
          "dependencies": []
        },
        {
          "id": "knead",
          "title": "Knead Dough",
          "description": "Knead the dough on a lightly floured surface for 10 minutes until smooth and elastic.",
          "technique": "kneading",
          "activeMinutes": 10,
          "passiveMinutes": 0,
          "dependencies": ["mix"]
        },
        {
          "id": "bulk-ferment",
          "title": "Bulk Fermentation",
          "description": "Place dough in a lightly oiled bowl, cover, and let rise until doubled in size.",
          "technique": "proofing",
          "activeMinutes": 2,
          "passiveMinutes": 90,
          "temperature": "75°F ambient",
          "dependencies": ["knead"]
        },
        {
          "id": "shape",
          "title": "Shape Loaf",
          "description": "Gently deflate dough, shape into a loaf, and place in a greased 9x5 pan.",
          "technique": "shaping",
          "activeMinutes": 5,
          "passiveMinutes": 0,
          "dependencies": ["bulk-ferment"]
        },
        {
          "id": "final-proof",
          "title": "Final Proof",
          "description": "Cover and let rise until dough is about 1 inch above the rim of the pan.",
          "technique": "proofing",
          "activeMinutes": 1,
          "passiveMinutes": 45,
          "temperature": "75°F ambient",
          "dependencies": ["shape"]
        },
        {
          "id": "bake",
          "title": "Bake",
          "description": "Bake in preheated oven until golden brown and internal temperature reaches 190°F.",
          "technique": "baking",
          "activeMinutes": 5,
          "passiveMinutes": 35,
          "temperature": "375°F oven",
          "dependencies": ["final-proof"]
        }
      ],
      "notes": "This is a simple, reliable recipe perfect for beginners.",
      "source": "Traditional"
    }
  ]
}
```

Add type declaration for JSON imports. Create `src/types/json.d.ts`:
```typescript
declare module '\''*.json'\'' {
  const value: any;
  export default value;
}
```

## Step 5: Build Components

### RecipeList Component

Create `src/components/RecipeList.tsx`:
```typescript
import { Recipe } from '\''../types/recipe'\'';
import RecipeCard from '\''./RecipeCard'\'';

interface RecipeListProps {
  recipes: Recipe[];
}

export default function RecipeList({ recipes }: RecipeListProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Bread Recipes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
```

### RecipeCard Component

Create `src/components/RecipeCard.tsx`:
```typescript
import { Link } from '\''react-router-dom'\'';

interface RecipeCardProps {
  recipe: {
    id: string;
    name: string;
    hydrationHint?: string;
    baseFlourWeight: number;
  };
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link 
      to={`/recipe/${recipe.id}`}
      className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
    >
      <h2 className="text-2xl font-semibold mb-2">{recipe.name}</h2>
      {recipe.hydrationHint && (
        <p className="text-gray-600 mb-2">{recipe.hydrationHint}</p>
      )}
      <p className="text-sm text-gray-500">
        Default: {recipe.baseFlourWeight}g flour
      </p>
    </Link>
  );
}
```

### RecipeDetail Component

Create `src/components/RecipeDetail.tsx`:
```typescript
import { useState, useMemo } from '\''react'\'';
import { useParams } from '\''react-router-dom'\'';
import { Recipe } from '\''../types/recipe'\'';
import { calculateFlourWeight, calculateIngredients } from '\''../utils/calculations'\'';
import ScalingCalculator from '\''./ScalingCalculator'\'';
import IngredientList from '\''./IngredientList'\'';
import StepList from '\''./StepList'\'';
import recipesData from '\''../data/recipes.json'\'';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const recipe: Recipe | undefined = recipesData.recipes.find(r => r.id === id);

  const [desiredTotalWeight, setDesiredTotalWeight] = useState<number | null>(null);

  const flourWeight = useMemo(
    () => recipe ? calculateFlourWeight(recipe, desiredTotalWeight) : 0,
    [recipe, desiredTotalWeight]
  );

  const calculatedIngredients = useMemo(
    () => recipe ? calculateIngredients(recipe.ingredients, flourWeight) : [],
    [recipe, flourWeight]
  );

  const totalPercentage = useMemo(
    () => recipe ? recipe.ingredients.reduce(
      (sum, ing) => ing.amountHint ? sum : sum + ing.percentage, 0
    ) : 0,
    [recipe]
  );

  if (!recipe) {
    return <div className="container mx-auto px-4 py-8">Recipe not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{recipe.name}</h1>
      {recipe.hydrationHint && (
        <p className="text-xl text-gray-600 mb-8">{recipe.hydrationHint}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ScalingCalculator
            desiredTotalWeight={desiredTotalWeight}
            flourWeight={flourWeight}
            totalPercentage={totalPercentage}
            onTotalWeightChange={setDesiredTotalWeight}
            isScaled={desiredTotalWeight !== null}
          />
        </div>

        <div className="lg:col-span-2">
          <IngredientList
            ingredients={calculatedIngredients}
            flourWeight={flourWeight}
          />
        </div>
      </div>

      {recipe.steps.length > 0 && (
        <div className="mt-12">
          <StepList steps={recipe.steps} />
        </div>
      )}

      {recipe.notes && (
        <div className="mt-8 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Notes:</h3>
          <p>{recipe.notes}</p>
        </div>
      )}

      {recipe.source && (
        <p className="mt-4 text-sm text-gray-500">Source: {recipe.source}</p>
      )}
    </div>
  );
}
```

### ScalingCalculator Component

Create `src/components/ScalingCalculator.tsx`:
```typescript
import { useState } from '\''react'\'';
import { validateTotalWeight } from '\''../utils/calculations'\'';

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
  const [inputValue, setInputValue] = useState(desiredTotalWeight?.toString() || '\'\'\'');
  const [error, setError] = useState<string>('\'\'\'');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim() === '\'\'\'') {
      onTotalWeightChange(null);
      setError('\'\'\'');
      return;
    }

    const result = validateTotalWeight(value);
    if (result.valid) {
      onTotalWeightChange(result.value);
      setError('\'\'\'');
    } else {
      const errorMessages = {
        empty: '\''Please enter a dough weight'\'',
        '\''non-numeric'\'': '\''Please enter a valid number'\'',
        '\''zero-or-negative'\'': '\''Dough weight must be greater than 0'\'',
        '\''too-small'\'': '\''Warning: Very small batch'\'',
        '\''too-large'\'': '\''Warning: Very large batch'\''
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
          <span className="font-medium">Status:</span>{' '\''
          '}
          {isScaled ? '\''Scaled'\'' : '\''Default'\''}
        </p>
      </div>
    </div>
  );
}
```

### IngredientList Component

Create `src/components/IngredientList.tsx`:
```typescript
import { CalculatedIngredient } from '\''../types/recipe'\'';

interface IngredientListProps {
  ingredients: CalculatedIngredient[];
  flourWeight: number;
}

export default function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
      <div className="space-y-2">
        {ingredients.map(ingredient => (
          <div
            key={ingredient.id}
            className="flex justify-between items-center py-2 border-b last:border-b-0"
          >
            <span className="font-medium">{ingredient.name}</span>
            <div className="text-right">
              <span className="text-lg">{ingredient.displayWeight}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({ingredient.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### StepList Component

Create `src/components/StepList.tsx`:
```typescript
import { Step } from '\''../types/recipe'\'';

interface StepListProps {
  steps: Step[];
}

export default function StepList({ steps }: StepListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-xl font-semibold mb-2">
              {index + 1}. {step.title}
            </h3>
            <p className="text-gray-700 mb-2">{step.description}</p>
            <div className="flex gap-4 text-sm text-gray-600">
              {step.activeMinutes > 0 && (
                <span>Active: {step.activeMinutes}min</span>
              )}
              {step.passiveMinutes > 0 && (
                <span>Passive: {step.passiveMinutes}min</span>
              )}
              {step.temperature && <span>{step.temperature}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Step 6: Setup Routing

Edit `src/App.tsx`:
```typescript
import { BrowserRouter, Routes, Route } from '\''react-router-dom'\'';
import RecipeList from '\''./components/RecipeList'\'';
import RecipeDetail from '\''./components/RecipeDetail'\'';
import recipesData from '\''./data/recipes.json'\'';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<RecipeList recipes={recipesData.recipes} />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

## Step 7: Run the Application

```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
```

## Step 8: Write Tests

Create `src/utils/calculations.test.ts`:
```typescript
import { describe, it, expect } from '\''vitest'\'';
import {
  calculateFlourWeight,
  calculateIngredientWeight,
  roundIngredientAmount,
  validateTotalWeight
} from '\''./calculations'\'';

describe('\''Baker'\''s Percentage Calculations'\'', () => {
  const mockRecipe = {
    id: '\''test'\'',
    name: '\''Test Recipe'\'',
    baseFlourWeight: 500,
    ingredients: [
      { id: '\''flour'\'', name: '\''Flour'\'', percentage: 100, type: '\''flour'\'' as const },
      { id: '\''water'\'', name: '\''Water'\'', percentage: 65, type: '\''liquid'\'' as const },
      { id: '\''salt'\'', name: '\''Salt'\'', percentage: 2, type: '\''seasoning'\'' as const },
      { id: '\''yeast'\'', name: '\''Yeast'\'', percentage: 2, type: '\''leavening'\'' as const }
    ],
    steps: []
  };

  describe('\''calculateFlourWeight'\'', () => {
    it('\''returns base flour weight when total is null'\'', () => {
      expect(calculateFlourWeight(mockRecipe, null)).toBe(500);
    });

    it('\''calculates flour weight from desired total'\'', () => {
      const result = calculateFlourWeight(mockRecipe, 1000);
      expect(result).toBeCloseTo(591.7, 1);
    });
  });

  describe('\''calculateIngredientWeight'\'', () => {
    it('\''calculates ingredient weight from flour weight and percentage'\'', () => {
      expect(calculateIngredientWeight(500, 65)).toBe(325);
      expect(calculateIngredientWeight(500, 2)).toBe(10);
    });
  });

  describe('\''roundIngredientAmount'\'', () => {
    it('\''rounds small amounts to 1 decimal place'\'', () => {
      expect(roundIngredientAmount(2.34)).toBe(2.3);
      expect(roundIngredientAmount(9.87)).toBe(9.9);
    });

    it('\''rounds large amounts to whole numbers'\'', () => {
      expect(roundIngredientAmount(384.6)).toBe(385);
      expect(roundIngredientAmount(591.7)).toBe(592);
    });
  });

  describe('\''validateTotalWeight'\'', () => {
    it('\''accepts valid numbers'\'', () => {
      const result = validateTotalWeight('\''1000'\'');
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.value).toBe(1000);
      }
    });

    it('\''rejects empty input'\'', () => {
      const result = validateTotalWeight('\'\'\'');
      expect(result.valid).toBe(false);
    });

    it('\''rejects non-numeric input'\'', () => {
      const result = validateTotalWeight('\''abc'\'');
      expect(result.valid).toBe(false);
    });
  });
});
```

Run tests:
```bash
npm test
```

## Step 9: Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

## Next Steps

1. Add more recipes to `src/data/recipes.json`
2. Enhance styling with custom Tailwind classes
3. Add loading states and error boundaries
4. Implement E2E tests with Cypress
5. Add accessibility improvements (ARIA labels, keyboard navigation)
6. Deploy to Vercel, Netlify, or similar platform

## Common Issues

### Issue: TypeScript errors with JSON imports
**Solution**: Ensure `src/types/json.d.ts` exists and `tsconfig.json` includes `"resolveJsonModule": true`

### Issue: Tailwind styles not applying
**Solution**: Check that `tailwind.config.js` content paths include your component files

### Issue: React Router not working after deployment
**Solution**: Configure your hosting provider for SPA routing (redirect all routes to `index.html`)

## Resources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vitest Guide](https://vitest.dev/guide/)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)

## Summary

You now have a fully functional bread recipe scaling calculator! The application uses React for the UI, TypeScript for type safety, Tailwind for styling, and Vitest for testing. All calculations follow baker'\''s percentage formulas with real-time updates as users scale recipes.
