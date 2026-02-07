import { useState, useRef, useEffect } from 'react';
import type { BakingInfo as BakingInfoType } from '../types/recipe';
import type { BakingOverrides } from '../utils/localStorage';
import { bakingContainers } from '../data/bakingContainers';

interface BakingInfoProps {
  defaults: BakingInfoType;
  overrides: BakingOverrides;
  onChange: (overrides: BakingOverrides) => void;
}

type EditingField = 'temp' | 'time' | 'container' | null;

function InlineNumberEdit({ value, suffix, modified, onCommit, onCancel }: {
  value: number;
  suffix: string;
  modified: boolean;
  onCommit: (val: number) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  useEffect(() => { inputRef.current?.select(); }, []);

  const commit = () => {
    if (cancelledRef.current) return;
    const num = parseInt(draft, 10);
    if (!isNaN(num) && num > 0) onCommit(num);
    else onCancel();
  };

  return (
    <span className="inline-flex items-center">
      <input
        ref={inputRef}
        type="number"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.currentTarget.blur(); }
          if (e.key === 'Escape') { cancelledRef.current = true; onCancel(); }
        }}
        className={`w-16 px-1.5 py-0.5 text-sm font-medium rounded border text-center ${
          modified ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-stone-300 bg-white text-stone-900'
        }`}
        min={1}
      />
      <span className="text-stone-500 text-sm ml-0.5">{suffix}</span>
    </span>
  );
}

function InlineContainerEdit({ value, modified, onCommit }: {
  value: string;
  modified: boolean;
  onCommit: (val: string) => void;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);
  useEffect(() => { selectRef.current?.focus(); }, []);

  return (
    <select
      ref={selectRef}
      value={value}
      onChange={e => onCommit(e.target.value)}
      onBlur={() => onCommit(value)}
      className={`text-sm font-medium rounded border px-1.5 py-0.5 ${
        modified ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-stone-300 bg-white text-stone-900'
      }`}
    >
      {bakingContainers.map(c => (
        <option key={c.id} value={c.id}>{c.label}</option>
      ))}
    </select>
  );
}

export default function BakingInfo({ defaults, overrides, onChange }: BakingInfoProps) {
  const [editing, setEditing] = useState<EditingField>(null);

  const currentTemp = overrides.temperatureF ?? defaults.temperatureF;
  const currentTime = overrides.timeMinutes ?? defaults.timeMinutes;
  const currentContainer = overrides.container ?? defaults.container ?? 'none';

  const tempModified = overrides.temperatureF !== undefined && overrides.temperatureF !== defaults.temperatureF;
  const timeModified = overrides.timeMinutes !== undefined && overrides.timeMinutes !== defaults.timeMinutes;
  const containerModified = overrides.container !== undefined && overrides.container !== (defaults.container ?? 'none');

  const containerLabel = bakingContainers.find(c => c.id === currentContainer)?.label ?? currentContainer;

  const clickableClass = (modified: boolean) =>
    `cursor-pointer font-medium border-b border-dashed transition-colors ${
      modified
        ? 'text-amber-700 border-amber-400 hover:text-amber-900'
        : 'text-stone-800 border-stone-300 hover:text-stone-950'
    }`;

  return (
    <p className="text-sm text-stone-500 flex flex-wrap items-center gap-x-1 gap-y-1">
      <span>Bake at</span>

      {editing === 'temp' ? (
        <InlineNumberEdit
          value={currentTemp}
          suffix="°F"
          modified={tempModified}
          onCommit={v => { onChange({ ...overrides, temperatureF: v }); setEditing(null); }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <button onClick={() => setEditing('temp')} className={clickableClass(tempModified)} title="Click to edit temperature">
          {currentTemp}°F
        </button>
      )}

      <span>for</span>

      {editing === 'time' ? (
        <InlineNumberEdit
          value={currentTime}
          suffix="min"
          modified={timeModified}
          onCommit={v => { onChange({ ...overrides, timeMinutes: v }); setEditing(null); }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <button onClick={() => setEditing('time')} className={clickableClass(timeModified)} title="Click to edit time">
          {currentTime} min
        </button>
      )}

      {defaults.container && (
        <>
          <span>in a</span>
          {editing === 'container' ? (
            <InlineContainerEdit
              value={currentContainer}
              modified={containerModified}
              onCommit={v => { onChange({ ...overrides, container: v }); setEditing(null); }}
            />
          ) : (
            <button onClick={() => setEditing('container')} className={clickableClass(containerModified)} title="Click to edit container">
              {containerLabel}
            </button>
          )}
        </>
      )}
    </p>
  );
}
