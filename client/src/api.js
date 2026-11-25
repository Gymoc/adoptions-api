// Thin wrapper around fetch for the three API routes.
// VITE_API_URL lets the client call an API on another domain; empty = same origin.
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

async function request(path) {
  const response = await fetch(`${BASE}${path}`);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Request failed (HTTP ${response.status})`);
  }
  return body;
}

export const getAllAdoptions = () => request('/api/adoptions');
export const getAdoption = (id) => request(`/api/adoptions/${encodeURIComponent(id)}`);
export const getAdoptionsByUniversity = (id) =>
  request(`/api/adoptions/university/${encodeURIComponent(id)}`);
