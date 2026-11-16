import {useEffect, useState, type ReactElement, type ReactNode} from 'react';

import {inlineCode, type ParamItem} from './model';
import styles from './styles.module.css';

export function Rich({text}: {text: string}): ReactElement {
  return (
    <>
      {inlineCode(text).map((p, i) => (typeof p === 'string' ? p : <code key={i}>{p.code}</code>))}
    </>
  );
}

/** Search box, match count and the advanced toggle. */
export function Toolbar(props: {
  query: string;
  onQuery: (q: string) => void;
  showAdvanced: boolean;
  onShowAdvanced: (v: boolean) => void;
  advancedCount: number;
  shown: number;
  total: number;
  idPrefix: string;
}): ReactElement {
  const {query, onQuery, showAdvanced, onShowAdvanced, advancedCount, shown, total, idPrefix} = props;
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchRow}>
        <label className={styles.search}>
          <span className={styles.srOnly}>Search parameters</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" className={styles.searchIcon}>
            <path
              d="M8.5 3a5.5 5.5 0 1 0 3.4 9.83l3.63 3.64 1.06-1.06-3.64-3.63A5.5 5.5 0 0 0 8.5 3Zm0 1.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
              fill="currentColor"
            />
          </svg>
          <input
            type="search"
            value={query}
            placeholder="Search parameters"
            onChange={(e) => onQuery(e.target.value)}
            aria-controls={`${idPrefix}-results`}
          />
        </label>
        <span className={styles.count} aria-live="polite">
          {query ? `${shown} of ${total}` : `${total} parameters`}
        </span>
      </div>
      <div className={styles.filterRow}>
        {advancedCount > 0 && (
          <label className={styles.advancedToggle}>
            <input type="checkbox" checked={showAdvanced} onChange={(e) => onShowAdvanced(e.target.checked)} />
            Show advanced ({advancedCount})
          </label>
        )}
      </div>
    </div>
  );
}

function Fact({label, children}: {label: string; children: ReactNode}): ReactElement {
  return (
    <div className={styles.fact}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** Everything known about one parameter. */
export function Details({item, heading}: {item: ParamItem; heading?: boolean}): ReactElement {
  return (
    <div className={styles.details}>
      {heading && (
        <div className={styles.detailsHead}>
          <code className={styles.detailsName}>{item.name}</code>
          <Badges item={item} />
        </div>
      )}
      <p className={styles.description}>
        <Rich text={item.description || 'No description.'} />
      </p>
      <dl className={styles.facts}>
        <Fact label="Type">
          <code>{item.type}</code>
        </Fact>
        <Fact label="Default">
          {item.defaultFull.includes('\n') ? <pre className={styles.defaultPre}>{item.defaultFull}</pre> : <code>{item.defaultFull}</code>}
          {item.defaultSource && <span className={styles.muted}> from {item.defaultSource}</span>}
        </Fact>
        {item.values && item.values.length > 4 && (
          <Fact label="Values">
            {item.values.map((v) => (
              <code key={v} className={styles.valueChip}>
                {v}
              </code>
            ))}
          </Fact>
        )}
        {item.fn !== null && (
          <Fact label="Function">
            {item.fn ? <code>{item.fn}</code> : 'Also takes a function.'} Code only: the form and shared
            links don’t edit it.
          </Fact>
        )}
        {item.absent && (
          <Fact label="Off">
            <code>{item.absent.split(' = ')[0]}</code> {item.absent.split(' = ')[1]}
          </Fact>
        )}
        {item.phaseOverridable && (
          <Fact label="Practice">
            Can differ in practice, via the <code>practice</code> option.
          </Fact>
        )}
        {item.observedTotal > 0 && (
          <Fact label="Literature">
            {item.sources} {item.sources === 1 ? 'source' : 'sources'}:{' '}
            {item.observed.slice(0, 5).map((o, i) => (
              <span key={o.value} className={styles.observed}>
                <code>{o.value}</code>
                {o.count > 1 && <span className={styles.muted}>×{o.count}</span>}
                {i < Math.min(item.observed.length, 5) - 1 ? ' ' : ''}
              </span>
            ))}
            {item.observed.length > 5 && <span className={styles.muted}> +{item.observed.length - 5} more</span>}
          </Fact>
        )}
        {item.keys && (
          <Fact label="Keys">
            <code>{item.keys.join(', ')}</code>
          </Fact>
        )}
      </dl>
    </div>
  );
}

export function Badges({item}: {item: ParamItem}): ReactElement | null {
  if (!item.advanced) return null;
  return (
    <span className={styles.badges}>
      {item.advanced && <span className={styles.badge}>advanced</span>}
    </span>
  );
}

/** Expand the item named in the URL hash (#param-<name>), once on load. */
export function useHashTarget(): string | null {
  const [target, setTarget] = useState<string | null>(null);
  useEffect(() => {
    const read = () => {
      const m = window.location.hash.match(/^#param-(.+)$/);
      setTarget(m ? decodeURIComponent(m[1]) : null);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  return target;
}

