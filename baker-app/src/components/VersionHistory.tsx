import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trash, FloppyDisk, Clock, CaretDown, CaretRight } from '@phosphor-icons/react';
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
  type HistoryEntry,
  type VersionEntry,
} from '../utils/localStorage';

interface TimelineItem {
  type: 'version' | 'history';
  recipeId: string;
  recipeName: string;
  date: string;
  id: number; // version number or history id
  isDefault?: boolean;
  // For history items that also have a matching saved version
  isSaved?: boolean;
}

interface RecipeGroup {
  recipeId: string;
  recipeName: string;
  items: TimelineItem[];
}

export default function VersionHistory() {
  const [historyByRecipe, setHistoryByRecipe] = useState<Record<string, HistoryEntry[]>>({});
  const [versionsByRecipe, setVersionsByRecipe] = useState<Record<string, VersionEntry[]>>({});
  const [defaultVersions, setDefaultVersions] = useState<Record<string, number | null>>({});
  const [expandedRecipes, setExpandedRecipes] = useState<Set<string>>(new Set());
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
          isSaved: false, // Could check if a matching version exists
        });
      }

      // Sort chronologically (newest first)
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return { recipeId, recipeName, items };
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

  const toggleRecipeExpanded = useCallback((recipeId: string) => {
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
                    {group.items.map((item, index) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors group"
                      >
                        {/* Timeline indicator */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              item.type === 'version'
                                ? 'bg-amber-500'
                                : 'bg-stone-300'
                            }`}
                          />
                          {index < group.items.length - 1 && (
                            <div className="w-0.5 h-full bg-stone-200 mt-1 hidden" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.type === 'version' ? (
                              <>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                  <FloppyDisk size={12} weight="bold" />
                                  Version {item.id}
                                </span>
                                {item.isDefault && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <Star size={12} weight="fill" />
                                    Default
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                                <Clock size={12} />
                                Made it #{item.id}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-stone-500 mt-1">{formatDate(item.date)}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    ))}
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
