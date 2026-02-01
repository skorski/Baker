const STORAGE_KEY_PREFIX = 'baker-app';
const HISTORY_KEY_PREFIX = 'baker-app-history';
const VERSION_KEY_PREFIX = 'baker-app-version';

export interface ProductQuantity {
  productId: string;
  quantity: number;
}

export type ScaleMode = 'products' | 'grams' | 'manual';

export interface RecipeProgress {
  completedSteps: string[];
  percentageOverrides: Record<string, number>;
  wholeWheatPercent: number | null;
  preferment: { weight: number; hydration: number } | null;
  desiredTotalWeight: number | null;
  productQuantities: ProductQuantity[];
  scaleMode: ScaleMode;
  gramsInput: string;
  manualInput: string;
}

export interface VersionEntry {
  version: number;
  date: string; // ISO string
  progress: RecipeProgress;
}

export interface RecipeVersions {
  entries: VersionEntry[];
}

export interface HistoryEntry {
  id: number;
  date: string; // ISO string
  progress: RecipeProgress;
}

export interface RecipeHistory {
  entries: HistoryEntry[];
}

export interface ExportData {
  exportedAt: string;
  history?: Record<string, RecipeHistory>;
  latestProgress?: Record<string, RecipeProgress>;
}

function getStorageKey(recipeId: string): string {
  return `${STORAGE_KEY_PREFIX}-recipe-${recipeId}`;
}

export function loadRecipeProgress(recipeId: string): RecipeProgress | null {
  try {
    const stored = localStorage.getItem(getStorageKey(recipeId));
    if (!stored) return null;
    return JSON.parse(stored) as RecipeProgress;
  } catch {
    return null;
  }
}

export function saveRecipeProgress(recipeId: string, progress: RecipeProgress): void {
  try {
    localStorage.setItem(getStorageKey(recipeId), JSON.stringify(progress));
  } catch {
    // Storage full or unavailable - silently fail
  }
}

export function clearRecipeProgress(recipeId: string): void {
  try {
    localStorage.removeItem(getStorageKey(recipeId));
  } catch {
    // Storage unavailable - silently fail
  }
}

function getHistoryKey(recipeId: string): string {
  return `${HISTORY_KEY_PREFIX}-${recipeId}`;
}

function getVersionKey(recipeId: string): string {
  return `${VERSION_KEY_PREFIX}-${recipeId}`;
}

// Compare two progress objects for equality (ignoring completedSteps)
function progressEquals(a: RecipeProgress, b: RecipeProgress): boolean {
  return (
    JSON.stringify(a.percentageOverrides) === JSON.stringify(b.percentageOverrides) &&
    a.wholeWheatPercent === b.wholeWheatPercent &&
    JSON.stringify(a.preferment) === JSON.stringify(b.preferment) &&
    a.desiredTotalWeight === b.desiredTotalWeight &&
    JSON.stringify(a.productQuantities) === JSON.stringify(b.productQuantities) &&
    a.scaleMode === b.scaleMode &&
    a.gramsInput === b.gramsInput &&
    a.manualInput === b.manualInput
  );
}

// === VERSION FUNCTIONS (unique recipe configurations) ===

export function loadRecipeVersions(recipeId: string): RecipeVersions {
  try {
    const stored = localStorage.getItem(getVersionKey(recipeId));
    if (!stored) return { entries: [] };
    return JSON.parse(stored) as RecipeVersions;
  } catch {
    return { entries: [] };
  }
}

export function saveVersion(recipeId: string, progress: RecipeProgress): VersionEntry | null {
  try {
    const versions = loadRecipeVersions(recipeId);
    
    // Check if this version already exists
    const isDuplicate = versions.entries.some(entry => progressEquals(entry.progress, progress));
    if (isDuplicate) {
      return null; // Don't save duplicate versions
    }
    
    const nextVersion = versions.entries.length > 0 
      ? Math.max(...versions.entries.map(e => e.version)) + 1 
      : 1;
    
    const entry: VersionEntry = {
      version: nextVersion,
      date: new Date().toISOString(),
      progress: { ...progress }
    };
    
    versions.entries.push(entry);
    localStorage.setItem(getVersionKey(recipeId), JSON.stringify(versions));
    return entry;
  } catch {
    return { version: 1, date: new Date().toISOString(), progress };
  }
}

export function clearRecipeVersions(recipeId: string): void {
  try {
    localStorage.removeItem(getVersionKey(recipeId));
  } catch {
    // Storage unavailable - silently fail
  }
}

// === HISTORY FUNCTIONS (times the recipe was made) ===

export function loadRecipeHistory(recipeId: string): RecipeHistory {
  try {
    const stored = localStorage.getItem(getHistoryKey(recipeId));
    if (!stored) return { entries: [] };
    return JSON.parse(stored) as RecipeHistory;
  } catch {
    return { entries: [] };
  }
}

export function saveToHistory(recipeId: string, progress: RecipeProgress): HistoryEntry {
  try {
    const history = loadRecipeHistory(recipeId);
    const nextId = history.entries.length > 0 
      ? Math.max(...history.entries.map(e => e.id)) + 1 
      : 1;
    
    const entry: HistoryEntry = {
      id: nextId,
      date: new Date().toISOString(),
      progress: { ...progress }
    };
    
    history.entries.push(entry);
    localStorage.setItem(getHistoryKey(recipeId), JSON.stringify(history));
    return entry;
  } catch {
    return { id: 1, date: new Date().toISOString(), progress };
  }
}

export function clearRecipeHistory(recipeId: string): void {
  try {
    localStorage.removeItem(getHistoryKey(recipeId));
  } catch {
    // Storage unavailable - silently fail
  }
}

export function getAllRecipeIds(): string[] {
  const ids: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX + '-recipe-')) {
        ids.push(key.replace(STORAGE_KEY_PREFIX + '-recipe-', ''));
      }
    }
  } catch {
    // Storage unavailable
  }
  return ids;
}

export function getAllHistoryRecipeIds(): string[] {
  const ids: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(HISTORY_KEY_PREFIX + '-')) {
        ids.push(key.replace(HISTORY_KEY_PREFIX + '-', ''));
      }
    }
  } catch {
    // Storage unavailable
  }
  return ids;
}

export function exportData(includeHistory: boolean, includeLatest: boolean): ExportData {
  const data: ExportData = {
    exportedAt: new Date().toISOString()
  };
  
  if (includeHistory) {
    data.history = {};
    const historyIds = getAllHistoryRecipeIds();
    for (const id of historyIds) {
      const history = loadRecipeHistory(id);
      if (history.entries.length > 0) {
        data.history[id] = history;
      }
    }
  }
  
  if (includeLatest) {
    data.latestProgress = {};
    const progressIds = getAllRecipeIds();
    for (const id of progressIds) {
      const progress = loadRecipeProgress(id);
      if (progress) {
        data.latestProgress[id] = progress;
      }
    }
  }
  
  return data;
}

export function importData(data: ExportData, importHistory: boolean, importLatest: boolean): void {
  try {
    if (importHistory && data.history) {
      for (const [recipeId, history] of Object.entries(data.history)) {
        const existingHistory = loadRecipeHistory(recipeId);
        const maxExistingId = existingHistory.entries.length > 0
          ? Math.max(...existingHistory.entries.map(e => e.id))
          : 0;
        
        // Renumber imported entries to avoid id conflicts
        const renumberedEntries = history.entries.map((entry, idx) => ({
          ...entry,
          id: maxExistingId + idx + 1
        }));
        
        existingHistory.entries.push(...renumberedEntries);
        localStorage.setItem(getHistoryKey(recipeId), JSON.stringify(existingHistory));
      }
    }
    
    if (importLatest && data.latestProgress) {
      for (const [recipeId, progress] of Object.entries(data.latestProgress)) {
        saveRecipeProgress(recipeId, progress);
      }
    }
  } catch {
    // Storage unavailable - silently fail
  }
}

export function downloadAsJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatShortDate(isoString: string): string {
  const date = new Date(isoString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}
