import type {ReactElement} from 'react';

type Prop = {
  type?: string | string[];
  enum?: unknown[];
  default?: unknown;
  description?: string;
  'x-jspsych'?: {group?: string; unit?: string; advanced?: boolean};
  'x-keys'?: string[];
  'x-function-keys'?: string[];
};
type Schema = {properties?: Record<string, Prop>};

const typeOf = (p: Prop): string =>
  p.enum ? p.enum.map((v) => JSON.stringify(v)).join(' | ') : [p.type ?? 'any'].flat().join(' | ');
const fmt = (v: unknown): string => (v === undefined ? '-' : JSON.stringify(v));

/** Parameter table generated from a package's options schema (see scripts/build-package-assets.mjs). */
export default function ParamsTable({schema}: {schema: Schema}): ReactElement {
  const entries = Object.entries(schema.properties ?? {});
  const grouped = entries.some(([, p]) => p['x-jspsych']?.group);
  return (
    <table>
      <thead>
        <tr>
          <th>Option</th>
          <th>Type</th>
          <th>Default</th>
          {grouped && <th>Group</th>}
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([name, p]) => {
          const x = p['x-jspsych'] ?? {};
          return (
            <tr key={name}>
              <td>
                <code>{name}</code>
              </td>
              <td>
                <code>{typeOf(p)}</code>
                {x.unit ? ` (${x.unit})` : ''}
              </td>
              <td>
                <code>{fmt(p.default)}</code>
              </td>
              {grouped && <td>{x.group ?? ''}</td>}
              <td>
                {p.description}
                {p['x-keys'] && (
                  <details>
                    <summary>String keys ({p['x-keys'].length})</summary>
                    <code>{p['x-keys'].join(', ')}</code>
                    {p['x-function-keys']?.length ? (
                      <p>
                        Function-valued keys (code only, not editable in the form):{' '}
                        <code>{p['x-function-keys'].join(', ')}</code>
                      </p>
                    ) : null}
                  </details>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
