import React from 'react';

// Turn anything (string, list, object, undefined) into a safe array.
export const asArray = (v) => {
  if (Array.isArray(v)) return v;
  return v === undefined || v === null || v === '' ? [] : [v];
};

// Turn anything into a safe printable string.
export const show = (v) => {
  if (v === undefined || v === null) return '';
  if (typeof v === 'object') return Object.values(v).map(show).join(' - ');
  return String(v);
};

// Indian Rupee formatter (\u20B9 is the rupee sign)
export const inr = (n) =>
  '\u20B9 ' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export function List({ items }) {
  const rows = asArray(items);
  if (rows.length === 0) return <p className="subtitle">Nothing reported.</p>;
  return (
    <ul className="list">
      {rows.map((it, i) => <li key={i}>{show(it)}</li>)}
    </ul>
  );
}

export function Badge({ value }) {
  const key = show(value).toLowerCase().replace(/[^a-z]/g, '');
  let cls = key;
  if (key.includes('nogo')) cls = 'nogo';
  else if (key.includes('caution')) cls = 'caution';
  else if (key === 'go') cls = 'go';
  return <span className={`badge ${cls}`}>{show(value) || 'Unknown'}</span>;
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return <div className="error">{message}</div>;
}
