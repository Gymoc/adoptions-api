# Markup & CSS Validation Report

**Project:** Adoptions API (MongoDB + Node.js) with React frontend
**Validators used:**
- Markup: W3C Nu Html Checker, <https://validator.w3.org/nu/> (vnu 26.11.20), "text input" mode
- CSS: W3C CSS Validation Service, <https://jigsaw.w3.org/css-validator/>, profile **CSS Level 3 + SVG**, warnings at "Normal report"

**Date:** November 25, 2026

Screenshots of the validator results are in `docs/validation-screenshots/`.

---

## 1. Final results

| File | Validator | Errors | Warnings | Status |
|---|---|---|---|---|
| React app: rendered markup, all 4 UI states | validator.w3.org | 0 | 0 | ✅ Pass (2 "Info" notes, explained in 3.3) |
| `public/test.html` (fetch test page) | validator.w3.org | 0 | 0 | ✅ Pass |
| `client/src/styles.css`, as built into `client/dist/assets/*.css` | jigsaw.w3.org | 0 | 0 | ✅ Pass |
| `public/test.html` embedded `<style>` | jigsaw.w3.org | 0 | 0 | ✅ Pass |

Across all runs, before the fixes: **3 markup errors**, **6 CSS warnings** (5 distinct problems), and **6 accessibility problems** that the validators could not detect (5 in `test.html`, plus the focus-ring contrast in section 5). Every one of them was fixed.

`test.html`'s embedded `<style>` block was validated together with the app stylesheet in the final run (screenshot `07`/`10`), so both are covered by the same pass.

---

## 2. What exactly was validated (and why)

A React app's `index.html` is almost empty: just `<div id="root"></div>`. React builds the real page in the browser. Validating that shell alone would prove almost nothing. So:

1. `npm run build` produces the production files (`client/dist`).
2. `npm run snapshots` (`client/scripts/render-snapshots.mjs`) uses `react-dom/server` to render the **real components** into the built `index.html` in four states: *all adoptions*, *single adoption*, *by university*, and *error*. The output goes to `client/validation/*.html`.
3. Those full pages were pasted into validator.w3.org.

For CSS, the **production build** (the minified file users actually download) was validated, not just the source file. Validating the build caught a problem that does not exist in the source (see issue C5).

---

## 3. Markup (HTML) issues found and fixed

### 3.1 `test.html`: `aria-label` not allowed on `<pre>` (3 errors) ❌ → ✅

**Validator output** (screenshot `08-html-testpage-aria-label-errors.png`):

> **Error:** The `aria-label` attribute must not be specified on any `pre` element unless the element has a `role` value other than `caption`, `code`, `deletion`, `emphasis`, `generic`, …
> Lines 33, 40, 47

**Code that failed:**
```html
<pre id="out-all" tabindex="0" aria-label="Response for all adoptions"></pre>
```

**Why it failed:** I made the response boxes keyboard-focusable (`tabindex="0"`), because a scrolling box must be reachable by keyboard, and gave them a name with `aria-label`. But a `<pre>` has the ARIA role *generic*, and ARIA forbids naming generic elements. Screen readers would ignore the label, so the box would be focusable but unnamed.

**Fix:** give the element a role that *can* be named. `region` is the standard role for a named, scrollable area:
```html
<pre id="out-all" role="region" tabindex="0" aria-label="Response for all adoptions"></pre>
```
Re-validated: **0 errors, 0 warnings** (screenshot `09-html-testpage-final-pass.png`).

> Lesson: these errors were introduced *while fixing accessibility*. Validating again after every change is what caught them.

### 3.2 `test.html`: problems the validator could **not** detect (found by manual review)

The first version of `test.html` passed validation with **0 errors and 0 warnings**, yet it still had real problems. Valid markup is not automatically accessible markup:

| Problem | Why it matters | Fix |
|---|---|---|
| The *Adoption ID* and *University ID* inputs had no `<label>` | A screen reader announced just "edit text", with no idea what to type | Added `<label for="adoptionId">` / `<label for="universityId">` |
| No `<meta name="viewport">` | On phones the page rendered zoomed out at desktop width | Added `width=device-width, initial-scale=1` |
| The PASS/FAIL result `<span>`s were silent | Blind users never heard the test results | Added `role="status"` (a polite live region) |
| No `<main>` landmark | Screen-reader users can't jump to the main content | Wrapped the content in `<main>` |
| Buttons had no `type` | Defaults to `submit` if the page is ever placed in a `<form>` | Added `type="button"` |

### 3.3 React app: "Trailing slash on void elements" (2 Info messages): accepted, no change

**Validator output** (screenshot `01-html-react-app-pass.png`):

> **Info:** Trailing slash on void elements has no effect and interacts badly with unquoted attribute values.
> `<input id="…" type="text" … value=""/>`

**Why it appears:** React's server renderer always writes void elements as `<input … />`. In HTML5 the `/` is allowed but ignored.

**Why no change was made:** this is an **informational message, not an error or warning**. The document is valid. Every attribute value is quoted, so the "unquoted attribute" risk it warns about cannot happen. In the running app the DOM is built by JavaScript, so this source text never exists. Removing it would mean post-processing React's output, which adds risk for no benefit.

### 3.4 React app: everything else

All four rendered states (screenshots `01` and `02`) had **0 errors and 0 warnings** on the first run, and again after the final changes. Things that keep the markup valid and meaningful:

- One `<h1>`, then `<h2>`/`<h3>` in order. Landmarks: `<header>`, `<main>`, `<footer>`.
- Every input has a `<label for>` and a hint linked with `aria-describedby`. IDs come from React's `useId()`, so they are unique even when the same component is used twice.
- The table has a `<caption>`, `<th scope="col">`, and `aria-sort` on the sorted column. The sort controls are real `<button>`s inside the `<th>`, not clickable `<th>`s.
- Dates use `<time datetime="2015-03-21">`, and the single-adoption view uses a description list (`<dl>`/`<dt>`/`<dd>`).
- Status messages use `role="status"`, and errors use `role="alert"`.

---

## 4. CSS issues found and fixed

The stylesheet never had an **error**, but it produced warnings over four rounds. Each fix was re-validated, and two of the fixes surfaced a new warning that had been hidden behind the old one.

| # | Round | Warning (verbatim) | Cause | Fix |
|---|---|---|---|---|
| C1 | 1 (source) | *Due to their dynamic nature, CSS variables are currently not statically checked* (line 49) | `font: 1rem/1.5 var(--font);`: a custom property inside the `font` shorthand can't be checked | Split into longhands: `font-family`, `font-size: 1rem`, `line-height: 1.5` |
| C2 | 1 (source) | *-webkit-font-smoothing is a vendor extension* (line 50) | Non-standard, macOS-only property | Removed it; it has no effect on other platforms |
| C3 | 2 (build) | *CSS variables are currently not statically checked* | `font-family: var(--font)` and `inset-inline-start: var(--space)` are still unverifiable. I isolated this with a small test stylesheet. | Both variables were used only once, so their values are written directly. This is also simpler. |
| C4 | 3 (build) | *system-ui,-apple-system,Segoe UI,… is a vendor extension* | `-apple-system` is a Safari-only keyword, exposed once the variable was inlined | Removed it. The standard `system-ui` already gives Safari its system font. |
| C5 | 4 (build) | *Family names containing whitespace should be quoted…* (×2) | The **source** had `"Segoe UI"` and `"Helvetica Neue"` quoted, but the **minifier stripped the quotes** in the production build | Kept only single-word families, `system-ui, Roboto, Arial, sans-serif`. `system-ui` already resolves to Segoe UI on Windows and San Francisco on Apple devices. |
| ✅ | 5 (build) | *Congratulations! No Error Found.* No warnings | | Screenshot `07-css-final-pass.png` |

**Before (source, round 1):**
```css
body {
  font: 1rem/1.5 var(--font);
  -webkit-font-smoothing: antialiased;
}
.skip-link { inset-inline-start: var(--space); }
```
**After (final):**
```css
body {
  font-family: system-ui, Roboto, Arial, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
}
.skip-link { inset-inline-start: 1rem; }
```

> Lesson (C5): the source file looked correct, but what users receive is the build output. Always validate the file that actually ships.

`test.html`'s embedded `<style>` block passed with no errors or warnings (screenshot `10-css-testpage-pass.png`).

---

## 5. Accessibility & CSS quality (beyond the validators)

The validators check *syntax*. To check *usability*, the finished app was also audited in Chrome with **axe-core**, against WCAG 2.0/2.1 A and AA plus best-practice rules:

| Page / state | axe violations |
|---|---|
| All adoptions, light theme, desktop | 0 |
| Single adoption | 0 |
| Error state | 0 |
| All adoptions, dark theme, 390 px mobile | 0 |
| `test.html` | 0 |

Other checks done in the same automated run: the first <kbd>Tab</kbd> lands on "Skip to results", sorting updates `aria-sort`, and all three API routes report PASS on `test.html`. Screenshots are in `docs/app-screenshots/`.

**One more problem neither tool catches: the focus ring.** The first design used an amber ring (`#f5b400`) in both themes. On the white page it measured only **1.84:1**, but WCAG 1.4.11 requires **3:1** for focus indicators. The W3C validators only check syntax, and axe doesn't measure focus-ring contrast, so this was found by calculating the ratios by hand. **Fix:** a darker amber in the light theme (`#b45309`, 5.0:1 on white). The bright amber stays in the dark theme, where it measures 10:1. The same fix was applied to `test.html`. Both stylesheets were then re-validated: still 0 errors and 0 warnings.

**Accessibility features in the CSS:**
- Text contrast is at least 4.5:1 (WCAG AA) in both light and dark themes, with the ratios noted beside the color variables.
- A single 3 px `:focus-visible` ring for every interactive element, with at least 3:1 contrast in both themes.
- Touch targets are at least 44 px tall.
- `prefers-color-scheme: dark` theme and `prefers-reduced-motion` support.
- A skip link that stays hidden until it receives focus. The wide table scrolls inside a focusable, labelled region instead of breaking the page layout.

**Why the CSS is lean ("optimal"):**
- One hand-written stylesheet with no framework: **3.9 KB minified, 1.4 KB gzipped**.
- Colors and radii are defined once as custom properties, so the dark theme only redefines variables (no duplicated rules).
- Logical properties (`margin-inline`, `inset-inline-start`), `clamp()` for fluid type and spacing, and `min()` for the container. Responsive behaviour comes from `grid` `auto-fit` without media queries. The only media queries are for user preferences.
- Low-specificity selectors (classes, no IDs except `#results:focus`, no `!important` except in the reduced-motion override).

---

## 6. Why validation matters for this kind of project

1. **Browsers forgive errors, but each forgives them differently.** An unclosed tag or an invalid attribute doesn't crash the page. The browser silently "repairs" it, and Chrome, Firefox and Safari may repair it in different ways. Valid markup is parsed the same way everywhere, so what you test is what everyone sees.

2. **Accessibility depends on correct markup.** Screen readers read the HTML structure, not the visual page. Issue 3.1 shows this: the label *looked* fine in the code, but it was invalid, so assistive technology would have ignored it. Validators catch many ARIA misuses that are invisible on screen. Accessibility is also a legal requirement for many public and educational sites (ADA, Section 508).

3. **A React frontend talks to an API, so the page is generated, not hand-written.** Bugs in a component repeat across every row and every state. Validating the rendered output of each state (list, detail, error) checks the HTML the components actually produce.

4. **Build tools can change your code.** Issue C5 came from the minifier, not from anything written by hand. Validating the production build is the only way to know what users actually receive.

5. **Validation does not replace testing.** `test.html` passed validation while still having unlabeled inputs (3.2). Validation is one layer: validator, then accessibility audit (axe), then functional tests (fetch tests on every route), then a manual keyboard and screen-reader check. Each layer catches problems the others miss.

6. **Maintainability and professionalism.** Valid, standards-based code is easier for the next developer to read and debug. It is also less likely to break when browsers update, and it is the baseline expected in code reviews and job portfolios.

---

## 7. How to re-run the validation

```bash
cd client
npm run build        # production CSS → client/dist/assets/index-*.css
npm run snapshots    # full rendered pages → client/validation/*.html
```
- **HTML:** open <https://validator.w3.org/nu/#textarea>, paste each file from `client/validation/` and `public/test.html`, then click **Check**.
- **CSS:** open <https://jigsaw.w3.org/css-validator/#validate_by_input>, paste `client/dist/assets/index-*.css` and the `<style>` block of `public/test.html`, then click **Check**.
- Once the site is deployed to a public URL, use **Validate by URI** on both services instead.
