// Project 2 - Adoptions API (Node.js + Express + MongoDB)
//
// Routes
//   GET /api/adoptions                 -> all adoptions, sorted by adoption date
//   GET /api/adoptions/:id             -> one adoption whose AdoptionID = :id
//   GET /api/adoptions/university/:id  -> all adoptions whose UniversityID = :id

const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

// ---- Configuration (override with environment variables if needed) ----
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'adoptions';
const COLLECTION = process.env.COLLECTION || 'adoptions';
// Name of the date field in adoptions.json. Change it if your file uses a different name.
const DATE_FIELD = process.env.DATE_FIELD || 'AdoptionDate';

const app = express();
let adoptions; // the MongoDB collection, set once we connect

// ---- CORS: lets a test page hosted on another domain/port call this API ----
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Serve the React frontend (built into client/dist with `npm run build`) at http://localhost:3000/
app.use(express.static(path.join(__dirname, 'client', 'dist')));
// Serve the fetch test page (public/test.html) at http://localhost:3000/test.html
app.use(express.static(path.join(__dirname, 'public')));

// Route params arrive as strings, but the imported JSON stores IDs as numbers.
// Match either form so the query works no matter how the data was imported.
function idFilter(field, raw) {
  const n = Number(raw);
  return Number.isNaN(n) ? { [field]: raw } : { [field]: { $in: [n, raw] } };
}

// 3. All adoptions sorted by adoption date (oldest first)
app.get('/api/adoptions', async (req, res) => {
  try {
    const docs = await adoptions.find({}).sort({ [DATE_FIELD]: 1 }).toArray();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Adoptions for one university. Defined before /:id so "university" is never read as an id.
app.get('/api/adoptions/university/:id', async (req, res) => {
  try {
    const docs = await adoptions
      .find(idFilter('UniversityID', req.params.id))
      .sort({ [DATE_FIELD]: 1 })
      .toArray();
    if (docs.length === 0) {
      return res.status(404).json({ error: `No adoptions found for UniversityID ${req.params.id}` });
    }
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. A single adoption by AdoptionID
app.get('/api/adoptions/:id', async (req, res) => {
  try {
    const doc = await adoptions.findOne(idFilter('AdoptionID', req.params.id));
    if (!doc) {
      return res.status(404).json({ error: `Adoption ${req.params.id} not found` });
    }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB first, then start listening
async function start() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  adoptions = client.db(DB_NAME).collection(COLLECTION);
  console.log(`Connected to MongoDB: ${MONGO_URL}/${DB_NAME}.${COLLECTION}`);

  app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}/api/adoptions`);
    console.log(`React app at   http://localhost:${PORT}/`);
    console.log(`Test page at   http://localhost:${PORT}/test.html`);
  });
}

start().catch((err) => {
  console.error('Could not start server:', err.message);
  process.exit(1);
});
