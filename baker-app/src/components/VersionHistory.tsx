import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trash, Clock, CaretDown, CaretRight, PencilSimple } from '@phosphor-icons/react';
import { recipes } from '../data/recipeLoader';
import {
  loadRecipeHistory,
  loadRecipeVersions,
  getAllHistoryRecipeIds,
  getAllVersionRecipeIds,
  deleteHistoryEntry,
  deleteVersion,
  getDefaultVersion,
  setDefaultVersion,
  clearDefaultVersion,
  updateHistoryEntryNotes,
  saveVersion,
  type HistoryEntry,
  type VersionEntry,
  type RecipeProgress,
} from '../utils/localStorage';
import { summarizeProgress, describeChanges } from '../utils/progressSummary';
import type { Recipe } from '../types/recipe';

interface TimelineItem {
  type: 'version' | 'history';
  recipeId: string;
  recipeName: string;
  date: string;
  id: number;
  isDefault?: boolean;
  notes?: string;
  progress: RecipeProgress;
}

interface RecipeGroup {
  recipeId: string;
  recipeName: string;
  recipe: Recipe | undefined;
  items: TimelineItem[];
}

export default function VersionHistory() {
  const [historyByRecipe, setHistoryByRecipe] = useState<Record<string, HistoryEntry[]>>({});
  const [versionsByRecipe, setVersionsByRecipe] = useState<Record<string, VersionEntry[]>>({});
  const [defaultVersions, setDefaultVersions] = useState<Record<string, number | null>>({});
  const [expandedRecipes, setExpandedRecipes] = useState<Set<string>>(new Set());
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load all data on mount
  useEffect(() => {
    const historyIds = getAllHistoryRecipeIds();
    const versionIds = getAllVersionRecipeIds();
    const allRecipeIds = [...new Set([...historyIds, ...versionIds])];

    const historyData: Record<string, HistoryEntry[]> = {};
    const versionData: Record<string, VersionEntry[]> = {};
    const defaults: Record<string, number | null> = {};

    for (const recipeId of allRecipeIds) {
      const history = loadRecipeHistory(recipeId);
      const versions = loadRecipeVersions(recipeId);
      if (history.entries.length > 0) {
        historyData[recipeId] = history.entries;
      }
      if (versions.entries.length > 0) {
        versionData[recipeId] = versions.entries;
      }
      defaults[recipeId] = getDefaultVersion(recipeId);
    }

    setHistoryByRecipe(historyData);
    setVersionsByRecipe(versionData);
    setDefaultVersions(defaults);
    setExpandedRecipes(new Set(allRecipeIds)); // Start with all expanded
    setIsLoaded(true);
  }, []);

  // Build grouped timeline data
  const recipeGroups = useMemo((): RecipeGroup[] => {
    const allRecipeIds = [
      ...new Set([
        ...Object.keys(historyByRecipe),
        ...Object.keys(versionsByRecipe),
      ]),
    ];

    const groups: RecipeGroup[] = allRecipeIds.map((recipeId) => {
      const recipe = recipes.find((r) => r.id === recipeId);
      const recipeName = recipe?.name || recipeId;

      const items: TimelineItem[] = [];

      // Add version entries
      const versions = versionsByRecipe[recipeId] || [];
      for (const v of versions) {
        items.push({
          type: 'version',
          recipeId,
          recipeName,
          date: v.date,
          id: v.version,
          isDefault: defaultVersions[recipeId] === v.version,
          progress: v.progress,
        });
      }

      // Add history entries
      const history = historyByRecipe[recipeId] || [];
      for (const h of history) {
        items.push({
          type: 'history',
          recipeId,
          recipeName,
          date: h.date,
          id: h.id,
          notes: h.notes,
          progress: h.progress,
        });
      }

      // Sort chronologically (newest first)
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return { recipeId, recipeName, recipe, items };
    });

    // Sort groups by recipe name
    groups.sort((a, b) => a.recipeName.localeCompare(b.recipeName));

    return groups;
  }, [historyByRecipe, versionsByRecipe, defaultVersions]);

  const handleDeleteVersion = useCallback((recipeId: string, versionNumber: number) => {
    deleteVersion(recipeId, versionNumber);
    setVersionsByRecipe((prev) => {
      const updated = { ...prev };
      if (updated[recipeId]) {
        updated[recipeId] = updated[recipeId].filter((e) => e.version !== versionNumber);
        if (updated[recipeId].length === 0) {
          delete updated[recipeId];
        }
      }
      return updated;
    });
    // Update default if needed
    if (defaultVersions[recipeId] === versionNumber) {
      setDefaultVersions((prev) => ({ ...prev, [recipeId]: null }));
    }
  }, [defaultVersions]);

  const handleDeleteHistory = useCallback((recipeId: string, historyId: number) => {
    deleteHistoryEntry(recipeId, historyId);
    setHistoryByRecipe((prev) => {
      const updated = { ...prev };
      if (updated[recipeId]) {
        updated[recipeId] = updated[recipeId].filter((e) => e.id !== historyId);
        if (updated[recipeId].length === 0) {
          delete updated[recipeId];
        }
      }
      return updated;
    });
  }, []);

  const handleSetDefault = useCallback((recipeId: string, versionNumber: number) => {
    const currentDefault = defaultVersions[recipeId];
    if (currentDefault === versionNumber) {
      // Toggle off
      clearDefaultVersion(recipeId);
      setDefaultVersions((prev) => ({ ...prev, [recipeId]: null }));
    } else {
      setDefaultVersion(recipeId, versionNumber);
      setDefaultVersions((prev) => ({ ...prev, [recipeId]: versionNumber }));
    }
  }, [defaultVersions]);

  const handleSetHistoryDefault = useCallback((recipeId: string, entry: HistoryEntry) => {
    const versions = loadRecipeVersions(recipeId);
    let matchingVersion = versions.entries.find(v =>
      JSON.stringify(v.progress.percentageOverrides) === JSON.stringify(entry.progress.percentageOverrides) &&
      JSON.stringify(v.progress.productQuantities) === JSON.stringify(entry.progress.productQuantities) &&
      v.progress.scaleMode === entry.progress.scaleMode
    );

    const currentDefault = defaultVersions[recipeId];
    if (currentDefault !== null && matchingVersion && currentDefault === matchingVersion.version) {
      clearDefaultVersion(recipeId);
      setDefaultVersions((prev) => ({ ...prev, [recipeId]: null }));
    } else {
      if (!matchingVersion) {
        const saved = saveVersion(recipeId, entry.progress);
        if (saved) {
          matchingVersion = saved;
          setVersionsByRecipe((prev) => {
            const updated = { ...prev };
            updated[recipeId] = [...(updated[recipeId] || []), saved];
            return updated;
          });
        }
      }
      if (matchingVersion) {
        setDefaultVersion(recipeId, matchingVersion.version);
        setDefaultVersions((prev) => ({ ...prev, [recipeId]: matchingVersion!.version }));
      }
    }
  }, [defaultVersions]);

  const handleSaveNote = useCallback((recipeId: string, historyId: number, notes: string) => {
    updateHistoryEntryNotes(recipeId, historyId, notes);
    setHistoryByRecipe((prev) => {
      const updated = { ...prev };
      if (updated[recipeId]) {
        updated[recipeId] = updated[recipeId].map((e) =>
          e.id === historyId ? { ...e, notes: notes || undefined } : e
        );
      }
      return updated;
    });
    setEditingNoteId(null);
  }, []);

  const toggleRecipeExpanded= useCallback((recipeId: string) => {
    setExpandedRecipes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
  }, []);

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  const hasData = recipeGroups.some((g) => g.items.length > 0);

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link to="/" className="text-sm text-stone-400 hover:text-stone-600 transition-colors mb-2 inline-block">
            ← Back to recipes
          </Link>
          <h1 className="text-3xl font-light tracking-tight text-stone-900">Version History</h1>
          <p className="text-stone-500 mt-1">View and manage your recipe versions and cooking history</p>
        </div>
      </div>

      {!hasData ? (
        <div className="text-center py-16">
          <Clock size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500 text-lg">No version history yet</p>
          <p className="text-stone-400 text-sm mt-2">
            Start cooking recipes and save versions to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {recipeGroups.map((group) => (
            group.items.length > 0 && (
              <div key={group.recipeId} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                {/* Recipe header */}
                <button
                  onClick={() => toggleRecipeExpanded(group.recipeId)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {expandedRecipes.has(group.recipeId) ? (
                      <CaretDown size={18} className="text-stone-400" />
                    ) : (
                      <CaretRight size={18} className="text-stone-400" />
                    )}
                    <h2 className="text-lg font-medium text-stone-800">{group.recipeName}</h2>
                    <span className="text-sm text-stone-400">({group.items.length} entries)</span>
                  </div>
                  <Link
                    to={`/recipe/${group.recipeId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
                  >
                    View Recipe →
                  </Link>
                </button>

                {/* Timeline items */}
                {expandedRecipes.has(group.recipeId) && (
                  <div className="divide-y divide-stone-100">
                    {group.items.map((item) => {
                      const summary = group.recipe ? summarizeProgress(item.progress, group.recipe) : '';
                      const changes = group.recipe ? describeChanges(item.progress, group.recipe) : [];
                      const isHistoryDefault = item.type === 'history' && (() => {
                        if (!defaultVersions[item.recipeId]) return false;
                        const vers = versionsByRecipe[item.recipeId] || [];
                        const match = vers.find(v =>
                          JSON.stringify(v.progress.percentageOverrides) === JSON.stringify(item.progress.percentageOverrides) &&
                          JSON.stringify(v.progress.productQuantities) === JSON.stringify(item.progress.productQuantities) &&
                          v.progress.scaleMode === item.progress.scaleMode
                        );
                        return match?.version === defaultVersions[item.recipeId];
                      })();

                      return (
                        <div
                          key={`${item.type}-${item.id}`}
                          className="flex items-start gap-4 px-6 py-4 hover:bg-stone-50 transition-colors group"
                        >
                          {/* Timeline indicator */}
                          <div className="flex flex-col items-center pt-1">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                item.type === 'version'
                                  ? 'bg-amber-500'
                                  : 'bg-stone-300'
                              }`}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {item.type === 'version' ? (
                                <>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    Version {item.id}
                                  </span>
                                  {item.isDefault && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      <Star size={10} weight="fill" />
                                      Default
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                                    <Clock size={12} />
                                    Made it
                                  </span>
                                  {isHistoryDefault && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      <Star size={10} weight="fill" />
                                      Default
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                            <p className="text-sm text-stone-500 mt-1">{formatDate(item.date)}</p>

                            {summary && (
                              <p className="text-sm text-stone-500 mt-1">{summary}</p>
                            )}

                            {changes.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {changes.map((change, i) => (
                                  <span key={i} className="inline-block px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                    {change}
                                  </span>
                                ))}
                              </div>
                            )}

                            {item.type === 'history' && (
                              editingNoteId === `${item.recipeId}-${item.id}` ? (
                                <div className="flex items-start gap-2 mt-2">
                                  <textarea
                                    autoFocus
                                    value={noteDraft}
                                    onChange={e => setNoteDraft(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveNote(item.recipeId, item.id, noteDraft); }
                                      if (e.key === 'Escape') setEditingNoteId(null);
                                    }}
                                    rows={2}
                                    className="flex-1 px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                                    placeholder="How did it turn out?"
                                  />
                                  <button onClick={() => handleSaveNote(item.recipeId, item.id, noteDraft)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Save">
                                    ✓
                                  </button>
                                </div>
                              ) : item.notes ? (
                                <p
                                  className="text-sm text-stone-500 mt-2 italic cursor-pointer hover:text-stone-700 transition-colors"
                                  onClick={() => { setEditingNoteId(`${item.recipeId}-${item.id}`); setNoteDraft(item.notes || ''); }}
                                  title="Click to edit"
                                >
                                  {item.notes}
                                </p>
                              ) : null
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.type === 'history' && (
                              <>
                                <button
                                  onClick={() => { setEditingNoteId(`${item.recipeId}-${item.id}`); setNoteDraft(item.notes || ''); }}
                                  className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                                  title="Edit notes"
                                >
                                  <PencilSimple size={18} />
                                </button>
                                <button
                                  onClick={() => {
                                    const historyEntry = (historyByRecipe[item.recipeId] || []).find(h => h.id === item.id);
                                    if (historyEntry) handleSetHistoryDefault(item.recipeId, historyEntry);
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    isHistoryDefault
                                      ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                                      : 'text-stone-400 hover:text-yellow-500 hover:bg-stone-100'
                                  }`}
                                  title={isHistoryDefault ? 'Remove as default' : 'Set as default'}
                                >
                                  <Star size={18} weight={isHistoryDefault ? 'fill' : 'regular'} />
                                </button>
                              </>
                            )}
                            {item.type === 'version' && (
                              <button
                                onClick={() => handleSetDefault(item.recipeId, item.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  item.isDefault
                                    ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                                    : 'text-stone-400 hover:text-yellow-500 hover:bg-stone-100'
                                }`}
                                title={item.isDefault ? 'Remove as default' : 'Set as default version'}
                              >
                                <Star size={18} weight={item.isDefault ? 'fill' : 'regular'} />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                item.type === 'version'
                                  ? handleDeleteVersion(item.recipeId, item.id)
                                  : handleDeleteHistory(item.recipeId, item.id)
                              }
                              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title={`Delete ${item.type}`}
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
