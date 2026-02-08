import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Star, Trash, PencilSimple, Check, X } from '@phosphor-icons/react';
import {
  deleteHistoryEntry,
  updateHistoryEntryNotes,
  getDefaultVersion,
  setDefaultVersion,
  clearDefaultVersion,
  loadRecipeVersions,
  saveVersion,
  type HistoryEntry,
} from '../utils/localStorage';
import { summarizeProgress, describeChanges } from '../utils/progressSummary';
import type { Recipe } from '../types/recipe';

interface BakingLogProps {
  recipeId: string;
  recipe: Recipe;
  entries: HistoryEntry[];
  onEntriesChange: (entries: HistoryEntry[]) => void;
  onLoadEntry: (entry: HistoryEntry) => void;
}

function NoteEditor({ value, onSave, onCancel }: {
  value: string;
  onSave: (val: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  return (
    <div className="flex items-start gap-2 mt-2">
      <textarea
        ref={ref}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSave(draft); }
          if (e.key === 'Escape') onCancel();
        }}
        rows={2}
        className="flex-1 px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
        placeholder="How did it turn out?"
      />
      <div className="flex flex-col gap-1">
        <button onClick={() => onSave(draft)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Save">
          <Check size={16} weight="bold" />
        </button>
        <button onClick={onCancel} className="p-1 text-stone-400 hover:bg-stone-100 rounded" title="Cancel">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default function BakingLog({ recipeId, recipe, entries, onEntriesChange, onLoadEntry }: BakingLogProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [defaultVersion, setDefaultVersionState] = useState<number | null>(() => getDefaultVersion(recipeId));

  const sorted = useMemo(() =>
    [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [entries]
  );

  const handleDelete = useCallback((entryId: number) => {
    deleteHistoryEntry(recipeId, entryId);
    onEntriesChange(entries.filter(e => e.id !== entryId));
  }, [recipeId, entries, onEntriesChange]);

  const handleSaveNote = useCallback((entryId: number, notes: string) => {
    updateHistoryEntryNotes(recipeId, entryId, notes);
    onEntriesChange(entries.map(e => e.id === entryId ? { ...e, notes: notes || undefined } : e));
    setEditingId(null);
  }, [recipeId, entries, onEntriesChange]);

  const handleToggleDefault = useCallback((entry: HistoryEntry) => {
    const versions = loadRecipeVersions(recipeId);
    let matchingVersion = versions.entries.find(v =>
      JSON.stringify(v.progress.percentageOverrides) === JSON.stringify(entry.progress.percentageOverrides) &&
      JSON.stringify(v.progress.productQuantities) === JSON.stringify(entry.progress.productQuantities) &&
      v.progress.scaleMode === entry.progress.scaleMode
    );

    if (defaultVersion !== null && matchingVersion && defaultVersion === matchingVersion.version) {
      clearDefaultVersion(recipeId);
      setDefaultVersionState(null);
    } else {
      if (!matchingVersion) {
        const saved = saveVersion(recipeId, entry.progress);
        if (saved) matchingVersion = saved;
      }
      if (matchingVersion) {
        setDefaultVersion(recipeId, matchingVersion.version);
        setDefaultVersionState(matchingVersion.version);
      }
    }
  }, [recipeId, defaultVersion]);

  const isEntryDefault = useCallback((entry: HistoryEntry): boolean => {
    if (defaultVersion === null) return false;
    const versions = loadRecipeVersions(recipeId);
    const matchingVersion = versions.entries.find(v =>
      JSON.stringify(v.progress.percentageOverrides) === JSON.stringify(entry.progress.percentageOverrides) &&
      JSON.stringify(v.progress.productQuantities) === JSON.stringify(entry.progress.productQuantities) &&
      v.progress.scaleMode === entry.progress.scaleMode
    );
    return matchingVersion?.version === defaultVersion;
  }, [recipeId, defaultVersion]);

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (entries.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-4">Baking Log</h2>
      <div className="bg-white rounded-lg border border-stone-200 divide-y divide-stone-100">
        {sorted.map(entry => {
          const isDefault = isEntryDefault(entry);
          const summary = summarizeProgress(entry.progress, recipe);
          const changes = describeChanges(entry.progress, recipe);

          return (
            <div key={entry.id} className="px-5 py-4 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onLoadEntry(entry)}
                    className="text-sm text-stone-700 hover:text-amber-700 transition-colors font-medium shrink-0"
                    title="Load this configuration"
                  >
                    {formatDate(entry.date)}
                  </button>
                  {isDefault && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Star size={10} weight="fill" />
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingId(editingId === entry.id ? null : entry.id)}
                    className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
                    title="Edit notes"
                  >
                    <PencilSimple size={15} />
                  </button>
                  <button
                    onClick={() => handleToggleDefault(entry)}
                    className={`p-1.5 rounded-md transition-colors ${
                      isDefault
                        ? 'text-yellow-500 hover:bg-yellow-50'
                        : 'text-stone-400 hover:text-yellow-500 hover:bg-stone-100'
                    }`}
                    title={isDefault ? 'Remove as default' : 'Set as default'}
                  >
                    <Star size={15} weight={isDefault ? 'fill' : 'regular'} />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete entry"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              </div>

              {summary && (
                <p className="mt-1 text-sm text-stone-500">{summary}</p>
              )}

              {changes.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {changes.map((change, i) => (
                    <span key={i} className="inline-block px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {change}
                    </span>
                  ))}
                </div>
              )}

              {editingId === entry.id ? (
                <NoteEditor
                  value={entry.notes || ''}
                  onSave={notes => handleSaveNote(entry.id, notes)}
                  onCancel={() => setEditingId(null)}
                />
              ) : entry.notes ? (
                <p
                  className="mt-2 text-sm text-stone-500 italic cursor-pointer hover:text-stone-700 transition-colors"
                  onClick={() => setEditingId(entry.id)}
                  title="Click to edit"
                >
                  {entry.notes}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
