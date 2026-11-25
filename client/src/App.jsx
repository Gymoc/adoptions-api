import { useCallback, useEffect, useRef, useState } from 'react';
import { getAdoption, getAdoptionsByUniversity, getAllAdoptions } from './api.js';
import SearchForm from './components/SearchForm.jsx';
import AdoptionTable from './components/AdoptionTable.jsx';
import AdoptionDetails from './components/AdoptionDetails.jsx';

const ALL = { mode: 'all' };

function titleFor(view) {
  if (view.mode === 'adoption') return `Adoption ID ${view.id}`;
  if (view.mode === 'university') return `Adoptions for University ID ${view.id}`;
  return 'All adoptions';
}

// `initial` lets tests and markup validation render a fixed state without calling the API.
export default function App({ initial }) {
  const [view, setView] = useState(initial?.view ?? ALL);
  const [state, setState] = useState(initial?.state ?? { status: 'loading', data: null, error: '' });
  const requestId = useRef(0);

  const load = useCallback(async (nextView) => {
    const id = ++requestId.current; // ignore responses from older, slower requests
    setView(nextView);
    setState((s) => ({ ...s, status: 'loading', error: '' }));
    try {
      const data =
        nextView.mode === 'adoption' ? await getAdoption(nextView.id)
        : nextView.mode === 'university' ? await getAdoptionsByUniversity(nextView.id)
        : await getAllAdoptions();
      if (id === requestId.current) setState({ status: 'success', data, error: '' });
    } catch (err) {
      if (id === requestId.current) setState({ status: 'error', data: null, error: err.message });
    }
  }, []);

  useEffect(() => {
    if (!initial) load(ALL);
  }, [initial, load]);

  const { status, data, error } = state;
  const loading = status === 'loading';
  const records = Array.isArray(data) ? data : null;
  const single = data && !Array.isArray(data) ? data : null;

  let message = '';
  if (loading) message = 'Loading adoptions…';
  else if (records) message = `Showing ${records.length} adoption${records.length === 1 ? '' : 's'}, sorted by adoption date.`;
  else if (single) message = `Showing adoption ${single.AdoptionID}.`;

  return (
    <>
      <a className="skip-link" href="#results">Skip to results</a>

      <header className="site-header">
        <div className="container">
          <h1>Textbook Adoptions</h1>
          <p className="tagline">Browse every adoption by date, or look one up by adoption or university ID.</p>
        </div>
      </header>

      <main className="container">
        <section className="panel" aria-labelledby="search-heading">
          <h2 id="search-heading">Find adoptions</h2>
          <div className="search-grid">
            <SearchForm
              label="Adoption ID"
              hint="Numbers only, for example 14."
              buttonText="Find adoption"
              disabled={loading}
              onSearch={(id) => load({ mode: 'adoption', id })}
            />
            <SearchForm
              label="University ID"
              hint="Numbers only, for example 100724."
              buttonText="Find by university"
              disabled={loading}
              onSearch={(id) => load({ mode: 'university', id })}
            />
          </div>
          <button
            type="button"
            className="secondary"
            disabled={loading || view.mode === 'all'}
            onClick={() => load(ALL)}
          >
            Show all adoptions
          </button>
        </section>

        <section id="results" className="panel" aria-labelledby="results-heading" aria-busy={loading} tabIndex={-1}>
          <h2 id="results-heading">{titleFor(view)}</h2>
          <p className="status" role="status">{message}</p>

          {status === 'error' && (
            <p className="error" role="alert">
              <strong>Something went wrong:</strong> {error}
            </p>
          )}

          {records && records.length > 0 && (
            <AdoptionTable records={records} caption={`${titleFor(view)}, sorted by adoption date`} />
          )}
          {single && <AdoptionDetails adoption={single} />}
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>Data served by the Node.js + MongoDB adoptions API.</p>
        </div>
      </footer>
    </>
  );
}
