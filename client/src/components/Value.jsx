import { formatDate, isDateField } from '../format.js';

// Renders one field value; dates get a machine-readable <time> element.
export default function Value({ field, value }) {
  if (value === null || value === undefined || value === '') {
    return <span className="muted">Not provided</span>;
  }
  if (isDateField(field)) {
    return <time dateTime={String(value)}>{formatDate(value)}</time>;
  }
  return String(value);
}
