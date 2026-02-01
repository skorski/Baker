import type { CalculatedIngredientWithPreferment, Step } from '../types/recipe';

interface RecipeTreeProps {
  ingredients: CalculatedIngredientWithPreferment[];
  steps: Step[];
}

function formatStepTime(step: Step): string | undefined {
  const parts: string[] = [];
  if (step.activeMinutes && step.activeMinutes > 0) {
    parts.push(`${step.activeMinutes} min`);
  }
  if (step.passiveMinutes && step.passiveMinutes > 0) {
    parts.push(`${step.passiveMinutes} min wait`);
  }
  if (step.temperature) {
    parts.push(step.temperature);
  }
  if (step.temperatureC) {
    parts.push(`${step.temperatureC}°C`);
  }
  return parts.length > 0 ? parts.join(', ') : undefined;
}

export default function RecipeTree({ ingredients, steps }: RecipeTreeProps) {
  if (steps.length === 0) {
    return null;
  }

  const activeIngredients = ingredients.filter(ing => ing.percentage > 0 || ing.amountHint);
  
  // Build a map of ingredient ID to the step index where it's first used
  const ingredientToStep = new Map<string, number>();
  steps.forEach((step, stepIdx) => {
    if (step.ingredients) {
      step.ingredients.forEach(ingId => {
        if (!ingredientToStep.has(ingId)) {
          ingredientToStep.set(ingId, stepIdx);
        }
      });
    }
  });
  
  // Assign unassigned ingredients to step 0
  activeIngredients.forEach(ing => {
    if (!ingredientToStep.has(ing.id)) {
      ingredientToStep.set(ing.id, 0);
    }
  });

  // Order ingredients by the step they first appear in
  const orderedIngredients = [...activeIngredients].sort((a, b) => {
    const stepA = ingredientToStep.get(a.id) ?? 0;
    const stepB = ingredientToStep.get(b.id) ?? 0;
    return stepA - stepB;
  });

  // Create a map from ingredient ID to row index
  const ingredientToRow = new Map<string, number>();
  orderedIngredients.forEach((ing, idx) => {
    ingredientToRow.set(ing.id, idx);
  });

  const numRows = orderedIngredients.length;
  const numSteps = steps.length;

  // For each step, calculate which rows it spans
  // A step spans from the minimum row of its ingredients to the maximum row of all ingredients added so far
  type CellType = 'render' | 'empty' | 'spanned';
  interface CellInfo {
    type: CellType;
    step?: Step;
    rowSpan?: number;
  }

  const cellMap: CellInfo[][] = [];
  for (let r = 0; r < numRows; r++) {
    cellMap[r] = [];
    for (let c = 0; c < numSteps; c++) {
      cellMap[r][c] = { type: 'empty' };
    }
  }

  // Track which rows have been "merged" into the dough so far
  let maxMergedRow = -1;

  for (let stepIdx = 0; stepIdx < numSteps; stepIdx++) {
    const step = steps[stepIdx];
    
    // Find rows for ingredients in this step
    const stepIngredientRows: number[] = [];
    if (step.ingredients && step.ingredients.length > 0) {
      step.ingredients.forEach(ingId => {
        const row = ingredientToRow.get(ingId);
        if (row !== undefined) {
          stepIngredientRows.push(row);
        }
      });
    }

    let startRow: number;
    let endRow: number;

    if (stepIngredientRows.length > 0) {
      // This step introduces new ingredients
      const minRow = Math.min(...stepIngredientRows);
      const maxRow = Math.max(...stepIngredientRows);
      
      // Start from the minimum of: previous merge point or new ingredients
      startRow = maxMergedRow >= 0 ? Math.min(maxMergedRow, minRow) : minRow;
      // End at the maximum row of new ingredients (they merge)
      endRow = Math.max(maxMergedRow, maxRow);
      
      // Update merged row tracker
      maxMergedRow = endRow;
    } else {
      // This step doesn't add ingredients, it continues from the merged dough
      if (maxMergedRow < 0) {
        // No ingredients merged yet, span all rows
        startRow = 0;
        endRow = numRows - 1;
        maxMergedRow = endRow;
      } else {
        // Continue from previous merge
        startRow = 0; // Merged dough starts from row 0
        endRow = maxMergedRow;
      }
    }

    const rowSpan = endRow - startRow + 1;
    
    if (rowSpan > 0 && startRow < numRows) {
      cellMap[startRow][stepIdx] = {
        type: 'render',
        step,
        rowSpan
      };
      
      // Mark cells below as spanned
      for (let r = startRow + 1; r <= endRow && r < numRows; r++) {
        cellMap[r][stepIdx] = { type: 'spanned' };
      }
    }
  }

  return (
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
      <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wide p-5 pb-3">
        Instructions
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {orderedIngredients.map((ing, rowIndex) => (
              <tr key={ing.id}>
                {/* Ingredient column */}
                <td className="p-2 px-4 border-t border-r border-stone-200 bg-stone-50 whitespace-nowrap align-middle min-w-[160px]">
                  <div className="text-stone-900 text-sm">{ing.name}</div>
                  <div className="text-xs text-stone-400">{ing.finalDisplayWeight}</div>
                </td>
                
                {/* Action columns */}
                {steps.map((_, colIndex) => {
                  const cell = cellMap[rowIndex][colIndex];
                  
                  if (cell.type === 'spanned') {
                    return null;
                  }
                  
                  if (cell.type === 'empty') {
                    return (
                      <td 
                        key={colIndex} 
                        className="p-2 border-t border-r border-stone-200 last:border-r-0 min-w-[100px]"
                      />
                    );
                  }
                  
                  // Render the action cell
                  const { step, rowSpan } = cell;
                  if (!step) return null;
                  
                  const time = formatStepTime(step);
                  
                  return (
                    <td
                      key={step.id}
                      rowSpan={rowSpan}
                      className="p-2 px-3 border-t border-r border-stone-200 last:border-r-0 align-middle text-center bg-white min-w-[100px]"
                    >
                      <div className="font-medium text-stone-700 text-sm">{step.title}</div>
                      {time && (
                        <div className="text-xs text-stone-400 mt-0.5">{time}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Step descriptions below */}
      <div className="border-t border-stone-200 p-5 space-y-3">
        <div className="text-xs text-stone-400 uppercase tracking-wide mb-3">Step Details</div>
        {steps.map((step, index) => (
          <div key={step.id} className="text-sm">
            <span className="font-medium text-stone-700">{index + 1}. {step.title}:</span>
            <span className="text-stone-600 ml-2">{step.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
