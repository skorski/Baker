export interface BakingInfo {
  temperatureF: number;
  timeMinutes: number;
  container?: string;
}

export interface Recipe {
  id: string;
  name: string;
  baseFlourWeight: number;
  targetUnit?: string;
  defaultDoughComposition?: Record<string, number>;
  ingredients: Ingredient[];
  steps: Step[];
  baking?: BakingInfo;
  tagline?: string;
  notes?: string;
  source?: string;
  sources?: Source[];
}

export interface Source {
  title: string;
  volume?: number;
  page?: number;
  url?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  percentage: number;
  type: IngredientType;
  amountHint?: string;
}

export type IngredientType =
  | 'flour'
  | 'liquid'
  | 'fat'
  | 'seasoning'
  | 'leavening'
  | 'enrichment'
  | 'mix-in'
  | 'sugar'
  | 'gluten'
  | 'salt'
  | 'yeast'
  | 'oil'
  | 'egg';

export interface Step {
  id: string;
  title: string;
  description: string;
  technique: TechniqueType;
  activeMinutes?: number;
  passiveMinutes?: number;
  temperature?: string;
  temperatureC?: number;
  dependencies?: string[];
  after?: string;
  combine?: { ingredientId: string }[];
  ingredients?: string[];
}

export type TechniqueType =
  | 'mixing'
  | 'kneading'
  | 'folding'
  | 'shaping'
  | 'proofing'
  | 'scoring'
  | 'baking'
  | 'cooling'
  | 'machine mix'
  | 'bulk ferment'
  | 'shape'
  | 'proof'
  | 'score'
  | 'bake';

export interface CalculatedIngredient extends Ingredient {
  weight: number;
  displayWeight: string;
}

export interface ScalingState {
  desiredTotalWeight: number | null;
  calculatedFlourWeight: number;
  isScaled: boolean;
}

export interface Preferment {
  weight: number;
  hydration: number;
}

export interface PrefermentContribution {
  flour: number;
  water: number;
}

export interface CalculatedIngredientWithPreferment extends CalculatedIngredient {
  prefermentDeduction?: number;
  finalWeight: number;
  finalDisplayWeight: string;
}

export type ValidationError =
  | 'empty'
  | 'non-numeric'
  | 'zero-or-negative'
  | 'too-small'
  | 'too-large';

export type ValidationResult =
  | { valid: true; value: number }
  | { valid: false; error: ValidationError };
