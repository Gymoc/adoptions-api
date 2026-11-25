# Project 2 – Adoptions API (MongoDB + Node.js) + React frontend

## Project structure

```
adoptions-api/
├── server.js               Express API (3 routes + CORS); also serves the React build and test page
├── package.json
├── adoptions.json          SAMPLE data only. Replace it with the adoptions.json from your class
├── public/
│   └── test.html           Plain JavaScript page that tests every route with fetch
├── client/                 React frontend (Vite)
│   ├── index.html
│   ├── public/favicon.svg
│   ├── src/
│   │   ├── main.jsx        Entry point
│   │   ├── App.jsx         Layout, data loading, status messages
│   │   ├── api.js          fetch wrapper for the 3 routes
│   │   ├── format.js       Labels, dates, sorting helpers
│   │   ├── styles.css      The only stylesheet (no framework)
│   │   └── components/     SearchForm, AdoptionTable, AdoptionDetails, Value
│   ├── scripts/render-snapshots.mjs   Renders full HTML pages for W3C validation
│   └── dist/               Production build (served by Express)
├── docs/
│   ├── validation-screenshots/        W3C validator results
│   └── app-screenshots/               The finished app
├── VALIDATION.md           Validation report: what failed, how it was fixed, why it matters
└── README.md
```

## 1. Start MongoDB and import the data

**Terminal 1:** start the database server and leave it running:

```bash
mongod
```

(If you get "data directory not found", create one and point to it: `mongod --dbpath ~/data/db`.)

**Terminal 2:** import the file. The assignment says the database must be named **adoptions**:

```bash
mongoimport --db adoptions --collection adoptions --file adoptions.json --jsonArray
```

> **Note:** the command printed in the assignment has three typos. It says `-db project3` (one dash and the wrong database name), splits `adoptions.json` across two lines, and uses a long dash in `–jsonArray`. If copied exactly, it fails or imports into `project3`. If you do use `project3`, start the API with `DB_NAME=project3 npm start`.

## 2. Sample queries in the MongoDB shell

```bash
mongosh
```

```js
use adoptions

// Adoption with AdoptionID = 14
db.adoptions.findOne({ AdoptionID: 14 })

// All adoptions for UniversityID = 100724
db.adoptions.find({ UniversityID: 100724 })

// Some extras
db.adoptions.countDocuments()
db.adoptions.find().sort({ AdoptionDate: 1 }).limit(5)
db.adoptions.countDocuments({ UniversityID: 100724 })
```

## 3. Run the API and the React app

```bash
npm install                 # API dependencies
cd client && npm install    # React dependencies
npm run build               # builds the frontend into client/dist
cd ..
npm start
```

| URL | What it is |
|---|---|
| http://localhost:3000/ | **React frontend** |
| http://localhost:3000/test.html | fetch test page |
| http://localhost:3000/api/adoptions | All adoptions, sorted by adoption date |
| http://localhost:3000/api/adoptions/14 | One adoption by `AdoptionID` (404 if none) |
| http://localhost:3000/api/adoptions/university/100724 | All adoptions for a `UniversityID` (404 if none) |

**While developing the frontend**, run the API (`npm start`) and, in a second terminal, `cd client && npm run dev`. Open http://localhost:5173. Vite reloads instantly and forwards `/api` calls to port 3000.

### React frontend features
- Shows all adoptions sorted by date, finds one adoption by ID, or filters by university ID. These map to the three API routes.
- The table columns are read from the data itself, so the app adapts if your real `adoptions.json` has different fields.
- Every column header is a sort button. Dates are formatted for reading but keep a machine-readable `<time>` value.
- Accessibility: skip link; labelled inputs with hints; screen-reader announcements for status and errors (`role="status"` / `role="alert"`); `aria-sort`; a keyboard-scrollable table; a visible focus ring; WCAG AA contrast; dark mode; reduced-motion support; 44 px touch targets.
- One hand-written stylesheet: 4 KB minified, 1.4 KB gzipped.

## 4. Test page

Open **http://localhost:3000/test.html** and click **Run all tests**. Each route shows PASS or FAIL and the JSON it returned.

You can also open `public/test.html` from another domain or straight from your file system. The API sends `Access-Control-Allow-Origin` and `Access-Control-Allow-Headers`, so cross-domain `fetch` calls work. To point the React app at an API on another domain, build it with `VITE_API_URL=https://your-api.example.com npm run build`.

## 5. Validation

All markup and CSS pass the W3C validators (validator.w3.org and jigsaw.w3.org) with 0 errors and 0 warnings. **See [VALIDATION.md](VALIDATION.md)** for what failed at first, how each problem was fixed, and why validation matters.

To regenerate the files to validate:

```bash
cd client
npm run build       # → dist/assets/index-*.css   (paste into jigsaw.w3.org)
npm run snapshots   # → validation/*.html         (paste into validator.w3.org)
```

## Configuration

All settings are optional environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | API port |
| `MONGO_URL` | `mongodb://127.0.0.1:27017` | MongoDB connection string |
| `DB_NAME` | `adoptions` | Database name |
| `COLLECTION` | `adoptions` | Collection name |
| `DATE_FIELD` | `AdoptionDate` | Field used to sort by date |

**If your adoptions.json names the date field differently**, run `db.adoptions.findOne()` in mongosh to see the real field name. Then set `DATE_FIELD` (for example `DATE_FIELD=DateAdopted npm start`) and change the `DATE_FIELD` constant at the top of the script in `test.html`. The React app detects date fields automatically: any field whose name contains "date".

## Notes on the code

- **ID types.** Route parameters arrive as strings ("14"), but the JSON stores IDs as numbers (14). The API matches either form.
- **Route order.** `/api/adoptions/university/:id` is defined before `/api/adoptions/:id`, so Express never reads the word "university" as an ID.
- **Date sorting.** Dates in `YYYY-MM-DD` text form (or real MongoDB dates) sort correctly. Dates like `3/21/2015` stored as text sort alphabetically instead. In that case, convert them on import.
