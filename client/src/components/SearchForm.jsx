import { useId, useState } from 'react';

// A small labelled form that asks for a numeric ID and passes it to onSearch.
export default function SearchForm({ label, hint, buttonText, onSearch, disabled }) {
  const id = useId();
  const [value, setValue] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <label htmlFor={`${id}-input`}>{label}</label>
      <p id={`${id}-hint`} className="hint">{hint}</p>
      <div className="search-row">
        <input
          id={`${id}-input`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]+"
          required
          autoComplete="off"
          aria-describedby={`${id}-hint`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" disabled={disabled}>{buttonText}</button>
      </div>
    </form>
  );
}
