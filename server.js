/**
 * Backend server for FLAMES Spam Tool.
 * Node.js + Express server that:
 * - Accepts POST /submit to save submissions per sharerId
 * - Serves GET /submissions?sharerId=xxx for sharer to retrieve submissions
 * 
 * This simple demo stores data in memory and writes to a JSON file for persistence.
 */

const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();

const DATA_FILE = path.join(__dirname, 'submissions.json');
const PORT = process.env.PORT || 3000;

// Load existing data or initialize empty object
let data = {};
if (fs.existsSync(DATA_FILE)) {
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (e) {
    console.error('Failed to parse submissions file. Starting with empty data.');
    data = {};
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Save submissions to file helper
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// POST /submit
app.post('/submit', (req, res) => {
  const { sharerId, yourName, crushName, flamesResult } = req.body;
  if (!sharerId || !yourName || !crushName || !flamesResult) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (!data[sharerId]) {
    data[sharerId] = [];
  }
  // Save submission with timestamp
  data[sharerId].push({
    yourName,
    crushName,
    flamesResult,
    timestamp: new Date().toISOString()
  });
  saveData();
  return res.status(201).json({ message: 'Submission saved.' });
});

// GET /submissions?sharerId=xxx
app.get('/submissions', (req, res) => {
  const sharerId = req.query.sharerId;
  if (!sharerId) {
    return res.status(400).json({ error: 'Missing sharerId parameter.' });
  }
  const subs = data[sharerId] || [];
  res.json(subs);
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend')));

app.listen(PORT, () => {
  console.log(`FLAMES Spam Tool backend running on port ${PORT}`);
});
