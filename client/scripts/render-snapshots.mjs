// Renders the React app to static HTML in several states so the full markup
// (not just the empty <div id="root">) can be pasted into https://validator.w3.org/.
//
//   npm run build && npm run snapshots   ->   writes client/validation/*.html
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sample = JSON.parse(await readFile(path.join(root, '..', 'adoptions.json'), 'utf8'))
  .sort((a, b) => String(a.AdoptionDate).localeCompare(String(b.AdoptionDate)));

const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { default: App } = await vite.ssrLoadModule('/src/App.jsx');
  const shell = await readFile(path.join(root, 'dist', 'index.html'), 'utf8');

  const states = {
    'all-adoptions': { view: { mode: 'all' }, state: { status: 'success', data: sample, error: '' } },
    'single-adoption': { view: { mode: 'adoption', id: '14' }, state: { status: 'success', data: sample.find((a) => a.AdoptionID === 14), error: '' } },
    'university': { view: { mode: 'university', id: '100724' }, state: { status: 'success', data: sample.filter((a) => a.UniversityID === 100724), error: '' } },
    'error': { view: { mode: 'adoption', id: '999' }, state: { status: 'error', data: null, error: 'Adoption 999 not found' } }
  };

  await mkdir(path.join(root, 'validation'), { recursive: true });
  for (const [name, initial] of Object.entries(states)) {
    const body = renderToStaticMarkup(createElement(App, { initial }));
    const html = shell.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
    await writeFile(path.join(root, 'validation', `${name}.html`), html);
    console.log(`validation/${name}.html`);
  }
} finally {
  await vite.close();
}
