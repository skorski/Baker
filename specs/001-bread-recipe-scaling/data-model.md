# Data Model: Bread Recipe Scaling Calculator

**Feature**: 001-bread-recipe-scaling
**Date**: 2025-01-21
**Status**: Complete

## Overview

This document defines the data structures, entities, and their relationships for the bread recipe scaling calculator. All data structures use TypeScript interfaces for type safety.

## Core Entities

### Recipe

Represents a complete bread recipe with all necessary information for display and scaling calculations.

**TypeScript Interface**:
```typescript
interface Recipe {
  /** Unique identifier for the recipe (kebab-case) */
  id: string;
  
  /** Display name of the recipe */
  name: string;
  
  /** Base flour weight in grams for default calculations */
  baseFlourWeight: number;
  
  /** Human-readable hint about hydration level (e.g., "65% hydration") */
  hydrationHint?: string;
  
  /** List of ingredients with percentages */
  ingredients: Ingredient[];
  
  /** Ordered list of preparation steps */
  steps: Step[];
  
  /** Additional notes or tips */
  notes?: string;
  
  /** Source attribution (e.g., "Adapted from King Arthur Baking") */
  source?: string;
}
```

**Field Descriptions**:
- `id`: Used for routing and referencing (e.g., "white-sandwich-bread")
- `name`: Displayed in recipe cards and detail header
- `baseFlourWeight`: Default flour amount used when user hasn'\''t specified custom total weight
- `hydrationHint`: Optional display-only hint, not used in calculations
- `ingredients`: Must include at least one flour ingredient at 100%
- `steps`: Can be empty for simple recipes
- `notes`: Optional additional context or tips
- `source`: Optional attribution for recipe origin

**Validation Rules**:
- `id` must be unique across all recipes
- `baseFlourWeight` must be positive (> 0)
- `ingredients` must contain at least one ingredient with `type: "flour"` and `percentage: 100`
- Total of all `ingredients[].percentage` must be > 100 (flour + other ingredients)

**Example**:
```json
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
  "steps": [],
  "notes": "A simple, reliable recipe for beginners",
  "source": "Traditional"
}
```

### Ingredient

Represents a single ingredient within a recipe, defined by its baker'\''s percentage.

**TypeScript Interface**:
```typescript
interface Ingredient {
  /** Unique identifier within the recipe */
  id: string;
  
  /** Display name of the ingredient */
  name: string;
  
  /** Baker'\''s percentage (flour is always 100) */
  percentage: number;
  
  /** Category for display grouping */
  type: IngredientType;
  
  /** Optional hint for special handling (e.g., "as needed", "for dusting") */
  amountHint?: string;
}

type IngredientType = 
  | "flour" 
  | "liquid" 
  | "fat" 
  | "seasoning" 
  | "leavening" 
  | "enrichment" 
  | "mix-in";
```

**Field Descriptions**:
- `id`: Unique within recipe (e.g., "flour", "water", "salt")
- `name`: Human-readable name displayed to user
- `percentage`: Baker'\''s percentage relative to flour (flour = 100)
- `type`: Used for grouping and display order
- `amountHint`: When present, overrides weight calculation (e.g., "as needed")

**Validation Rules**:
- `id` must be unique within recipe
- `percentage` must be positive (> 0)
- `type` must be one of the defined IngredientType values
- If `amountHint` is present, weight calculation is skipped

**Baker'\''s Percentage Reference**:
- Flour: Always 100%
- Water: 60-80% (typical for bread)
- Salt: 1.8-2.5% (typical range)
- Yeast: 0.5-3% (depending on rise time)
- Fat: 0-10% (enriched breads)
- Sugar: 0-15% (sweet breads)

### Step

Represents a single preparation step in the recipe with timing and dependencies.

**TypeScript Interface**:
```typescript
interface Step {
  /** Unique identifier within the recipe */
  id: string;
  
  /** Short title for the step (e.g., "Autolyse", "Shape Loaf") */
  title: string;
  
  /** Detailed instructions */
  description: string;
  
  /** Technique category for grouping */
  technique: TechniqueType;
  
  /** Active working time in minutes */
  activeMinutes: number;
  
  /** Passive waiting time in minutes */
  passiveMinutes: number;
  
  /** Temperature requirement (optional) */
  temperature?: string;
  
  /** Step IDs that must be completed first */
  dependencies: string[];
}

type TechniqueType = 
  | "mixing" 
  | "kneading" 
  | "folding" 
  | "shaping" 
  | "proofing" 
  | "scoring" 
  | "baking" 
  | "cooling";
```

**Field Descriptions**:
- `id`: Unique within recipe, used for dependencies
- `title`: Displayed as step header
- `description`: Full instructions for the step
- `technique`: Category for filtering/grouping
- `activeMinutes`: Time user is actively working (hands-on)
- `passiveMinutes`: Time waiting (rest, proof, bake)
- `temperature`: Optional string like "75°F ambient" or "450°F oven"
- `dependencies`: Empty array if first step, or IDs of prerequisite steps

**Validation Rules**:
- `id` must be unique within recipe
- `activeMinutes` and `passiveMinutes` must be non-negative (≥ 0)
- All `dependencies` must reference valid step IDs in the same recipe
- No circular dependencies allowed

**Example**:
```json
{
  "id": "mix",
  "title": "Mix Ingredients",
  "description": "Combine flour, water, yeast, and salt in a large bowl. Mix until no dry flour remains.",
  "technique": "mixing",
  "activeMinutes": 5,
  "passiveMinutes": 0,
  "temperature": null,
  "dependencies": []
}
```

### Calculated Ingredient (Runtime)

Represents an ingredient with its calculated weight based on current flour amount. This is a derived entity created at runtime, not stored in JSON.

**TypeScript Interface**:
```typescript
interface CalculatedIngredient extends Ingredient {
  /** Calculated weight in grams based on current flour weight */
  weight: number;
  
  /** Display-formatted weight (e.g., "385g", "2.3g", "as needed") */
  displayWeight: string;
}
```

**Calculation Logic**:
```typescript
function calculateIngredient(
  ingredient: Ingredient,
  flourWeight: number
): CalculatedIngredient {
  // Skip calculation if amount hint is present
  if (ingredient.amountHint) {
    return {
      ...ingredient,
      weight: 0,
      displayWeight: ingredient.amountHint
    };
  }
  
  // Calculate weight from baker'\''s percentage
  const weight = (flourWeight * ingredient.percentage) / 100;
  const roundedWeight = roundIngredientAmount(weight);
  
  return {
    ...ingredient,
    weight: roundedWeight,
    displayWeight: `${roundedWeight}g`
  };
}

function roundIngredientAmount(weight: number): number {
  if (weight < 10) {
    return Math.round(weight * 10) / 10;  // 1 decimal place
  }
  return Math.round(weight);  // whole number
}
```

### Scaling State (Runtime)

Represents the user'\''s current scaling preferences. This is component state, not persisted.

**TypeScript Interface**:
```typescript
interface ScalingState {
  /** User'\''s desired total dough weight in grams */
  desiredTotalWeight: number | null;
  
  /** Calculated flour weight based on desired total */
  calculatedFlourWeight: number;
  
  /** Whether user has entered custom total (vs using default) */
  isScaled: boolean;
}
```

**Calculation Logic**:
```typescript
function calculateFlourWeight(
  recipe: Recipe,
  desiredTotalWeight: number | null
): number {
  // Use default if no custom total specified
  if (desiredTotalWeight === null) {
    return recipe.baseFlourWeight;
  }
  
  // Calculate total percentage (sum of all ingredient percentages)
  const totalPercentage = recipe.ingredients.reduce(
    (sum, ingredient) => {
      // Skip ingredients with amount hints
      if (ingredient.amountHint) return sum;
      return sum + ingredient.percentage;
    },
    0
  );
  
  // Calculate flour weight from desired total
  return (desiredTotalWeight * 100) / totalPercentage;
}
```

## Entity Relationships

```
Recipe (1)
  ├── ingredients (*) → Ingredient
  └── steps (*) → Step
        └── dependencies (*) → Step (references)

Runtime transformations:
  Recipe + ScalingState → CalculatedIngredient[]
```

**Cardinality**:
- One Recipe has many Ingredients (minimum 1 flour)
- One Recipe has many Steps (minimum 0)
- One Step can depend on many other Steps
- At runtime, Ingredients are transformed to CalculatedIngredients based on ScalingState

## State Transitions

### Scaling Workflow

```
Initial State:
  - Recipe loaded with baseFlourWeight
  - desiredTotalWeight = null
  - All ingredients calculated from baseFlourWeight

User enters desired total:
  - desiredTotalWeight = user input
  - calculatedFlourWeight = calculateFlourWeight(recipe, desiredTotalWeight)
  - All ingredients recalculated from calculatedFlourWeight

User clears input:
  - desiredTotalWeight = null
  - calculatedFlourWeight = recipe.baseFlourWeight
  - All ingredients reset to default
```

### Validation States

**Input Validation**:
```typescript
type ValidationState = 
  | { valid: true; value: number }
  | { valid: false; error: ValidationError };

type ValidationError =
  | "empty"           // Input is empty or whitespace
  | "non-numeric"     // Input contains non-numeric characters
  | "zero-or-negative" // Input is <= 0
  | "too-small"       // Input < 100g (warning, not error)
  | "too-large";      // Input > 10000g (warning, not error)
```

## Data Storage

### JSON File Structure

All recipes stored in `/src/data/recipes.json`:

```json
{
  "recipes": [
    {
      "id": "white-sandwich-bread",
      "name": "White Sandwich Bread",
      "baseFlourWeight": 500,
      "hydrationHint": "65% hydration",
      "ingredients": [...],
      "steps": [...],
      "notes": "...",
      "source": "..."
    },
    {
      "id": "sourdough-country-loaf",
      "name": "Sourdough Country Loaf",
      ...
    }
  ]
}
```

**Loading Strategy**:
- Import JSON file directly in React components
- No async loading needed (bundled with app)
- TypeScript validates structure at compile time

### Type Safety

**TypeScript Type Guard**:
```typescript
function isValidRecipe(obj: any): obj is Recipe {
  return (
    typeof obj.id === '\''string'\'' &&
    typeof obj.name === '\''string'\'' &&
    typeof obj.baseFlourWeight === '\''number'\'' &&
    obj.baseFlourWeight > 0 &&
    Array.isArray(obj.ingredients) &&
    obj.ingredients.length > 0 &&
    Array.isArray(obj.steps)
  );
}
```

## Performance Considerations

### Memory Usage

**Per Recipe**:
- JSON size: ~2-5 KB (typical recipe)
- Runtime objects: ~10-20 KB (with calculated weights)
- Total for 50 recipes: ~500 KB - ~1 MB (negligible)

### Calculation Performance

**Per Calculation**:
- Flour weight calculation: O(n) where n = number of ingredients
- Ingredient weight calculation: O(1) per ingredient
- Total update: O(n) - very fast for typical recipe sizes (< 20 ingredients)

**Expected Performance**:
- 10 ingredients: < 1ms
- 50 ingredients: < 5ms
- Well within 500ms requirement

## Summary

The data model consists of three primary entities (**Recipe**, **Ingredient**, **Step**) stored in JSON format, plus two runtime entities (**CalculatedIngredient**, **ScalingState**) created during user interaction. All calculations follow baker'\''s percentage formulas with context-sensitive rounding. Type safety is enforced via TypeScript interfaces, and performance is more than adequate for the expected scale (< 50 recipes, < 20 ingredients per recipe).

**Key Design Decisions**:
1. Simple, flat JSON structure for easy maintenance
2. Baker'\''s percentages as source of truth (not absolute weights)
3. Calculated weights derived at runtime, not stored
4. Type-safe interfaces prevent common errors
5. Validation rules documented and enforceable
