import {useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactElement} from 'react';
import clsx from 'clsx';

import {filterItems, groupsOf, itemsOf, type OptionsSchema, type ParamItem} from './model';
import {Details, Toolbar, useHashTarget} from './parts';
import styles from './styles.module.css';

/** State shared by the layouts: items, search, advanced toggle. */
function useParams(schema: OptionsSchema) {
  const all = useMemo(() => itemsOf(schema), [schema]);
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const shown = useMemo(() => filterItems(all, query, showAdvanced), [all, query, showAdvanced]);
  const groups = useMemo(() => groupsOf(shown), [shown]);
  const advancedCount = all.filter((i) => i.advanced).length;
  const visibleTotal = showAdvanced ? all.length : all.length - advancedCount;
  return {all, query, setQuery, showAdvanced, setShowAdvanced, shown, groups, advancedCount, visibleTotal};
}

const anchor = (name: string) => `param-${name}`;

function Empty({query}: {query: string}): ReactElement {
  return <p className={styles.empty}>No parameter matches “{query}”.</p>;
}

// ---------------------------------------------------------------------------------------------
// Parameter reference: a searchable index on the left, the selected parameter on the right.
// At phone width the index becomes a menu. `#param-<name>` selects a parameter.
// ---------------------------------------------------------------------------------------------

export function ParamsIndex({schema}: {schema: OptionsSchema}): ReactElement {
  const s = useParams(schema);
  const id = useId();
  const hash = useHashTarget();
  const [selected, setSelected] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (hash) setSelected(hash);
  }, [hash]);
  // keep a visible selection: fall back to the first match
  const current: ParamItem | undefined =
    s.shown.find((i) => i.name === selected) ?? s.shown[0];
  // keep the selected item visible inside the index (scrolls the index only, not the page)
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-name="${current?.name}"]`);
    if (!list || !el) return;
    const top = el.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    if (top < list.scrollTop || top + el.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = top - list.clientHeight / 3;
    }
  }, [current?.name]);
  const flat = s.groups.flatMap((g) => g.items);
  const move = (e: KeyboardEvent) => {
    if (!current || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
    e.preventDefault();
    const i = flat.findIndex((x) => x.name === current.name);
    const next = flat[Math.max(0, Math.min(flat.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))];
    setSelected(next.name);
    listRef.current?.querySelector<HTMLElement>(`[data-name="${next.name}"]`)?.focus();
  };
  return (
    <div className={styles.root}>
      <Toolbar
        idPrefix={id}
        query={s.query}
        onQuery={s.setQuery}
        showAdvanced={s.showAdvanced}
        onShowAdvanced={s.setShowAdvanced}
        advancedCount={s.advancedCount}
        shown={s.shown.length}
        total={s.visibleTotal}
      />
      {s.groups.length === 0 ? (
        <Empty query={s.query} />
      ) : (
        <div className={styles.panes} id={`${id}-results`}>
          <label className={styles.paneSelect}>
            <span className={styles.srOnly}>Parameter</span>
            <select value={current?.name} onChange={(e) => setSelected(e.target.value)}>
              {s.groups.map((g) => (
                <optgroup key={g.id} label={g.label}>
                  {g.items.map((i) => (
                    <option key={i.name} value={i.name}>
                      {i.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <div className={styles.index} ref={listRef} onKeyDown={move} role="listbox" aria-label="Parameters">
            {s.groups.map((g) => (
              <div key={g.id} role="group" aria-label={g.label}>
                <div className={styles.indexGroup} aria-hidden="true">
                  {g.label}
                </div>
                {g.items.map((i) => (
                  <button
                    key={i.name}
                    type="button"
                    role="option"
                    aria-selected={i.name === current?.name}
                    tabIndex={i.name === current?.name ? 0 : -1}
                    data-name={i.name}
                    className={clsx(styles.indexItem, i.name === current?.name && styles.indexItemActive)}
                    onClick={() => setSelected(i.name)}>
                    {i.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className={styles.pane} id={current ? anchor(current.name) : undefined} aria-live="polite">
            {current && (
              <>
                <div className={styles.paneGroup}>{current.groupLabel}</div>
                <Details item={current} heading />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
