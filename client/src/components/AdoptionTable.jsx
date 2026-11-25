import { useMemo, useState } from 'react';
import { columnsOf, compare, isDateField, isMeasure, labelFor } from '../format.js';
import Value from './Value.jsx';

// Sortable, keyboard-accessible table of adoptions.
export default function AdoptionTable({ records, caption }) {
  const columns = useMemo(() => columnsOf(records), [records]);
  const dateKey = columns.find(isDateField);
  const measures = useMemo(() => new Set(columns.filter((k) => isMeasure(records, k))), [columns, records]);
  // The API already sorts by date, so that is the starting state.
  const [sort, setSort] = useState({ key: dateKey, dir: 'ascending' });

  const rows = useMemo(() => {
    if (!sort.key) return records;
    const sorted = [...records].sort((a, b) => compare(a, b, sort.key));
    return sort.dir === 'ascending' ? sorted : sorted.reverse();
  }, [records, sort]);

  function toggle(key) {
    setSort((s) => ({
      key,
      dir: s.key === key && s.dir === 'ascending' ? 'descending' : 'ascending'
    }));
  }

  return (
    <div className="table-wrap" role="region" aria-label={caption} tabIndex={0}>
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((key) => (
              <th
                key={key}
                scope="col"
                className={measures.has(key) ? 'num' : undefined}
                aria-sort={sort.key === key ? sort.dir : 'none'}
              >
                <button type="button" className="sort-button" onClick={() => toggle(key)}>
                  {labelFor(key)}
                  <span className="sort-icon" aria-hidden="true">
                    {sort.key === key ? (sort.dir === 'ascending' ? '▲' : '▼') : '↕'}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id ?? r.AdoptionID}>
              {columns.map((key) => (
                <td key={key} className={measures.has(key) ? 'num' : undefined}>
                  <Value field={key} value={r[key]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
