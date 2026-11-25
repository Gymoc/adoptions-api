// Helpers that turn raw MongoDB field names/values into readable text.

// "AdoptionID" -> "Adoption ID", "UniversityID" -> "University ID", "BookID" -> "Book ID"
export function labelFor(key) {
  return key
    .replace(/ID$/, ' ID')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim();
}

export const isDateField = (key) => /date/i.test(key);

// Quantities are right-aligned so digits line up; identifiers (…ID) are labels, so they stay left-aligned.
export const isMeasure = (records, key) =>
  !/id$/i.test(key) && records.some((r) => typeof r[key] === 'number');

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

export function formatDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : dateFormat.format(d);
}

// Every field except MongoDB's internal _id, taken from the records themselves,
// so the UI adapts to whatever columns the real adoptions.json contains.
export function columnsOf(records) {
  const keys = new Set();
  records.forEach((r) => Object.keys(r).forEach((k) => k !== '_id' && keys.add(k)));
  return [...keys];
}

export function compare(a, b, key) {
  const x = a[key];
  const y = b[key];
  if (isDateField(key)) return new Date(x) - new Date(y);
  if (typeof x === 'number' && typeof y === 'number') return x - y;
  return String(x ?? '').localeCompare(String(y ?? ''), 'en', { numeric: true });
}
