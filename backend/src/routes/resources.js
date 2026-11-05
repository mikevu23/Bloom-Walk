import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET /api/resources
router.get('/', (req, res) => {
  try {
    const contacts = db.prepare("SELECT * FROM therapy_resources WHERE category = 'hotline' OR contact_number IS NOT NULL ORDER BY sort_order ASC").all();
    const resources = db.prepare('SELECT * FROM therapy_resources ORDER BY sort_order ASC').all();
    const quotes = db.prepare('SELECT * FROM motivational_quotes').all();

    res.json({
      contacts,
      resources,
      quotes
    });
  } catch (err) {
    console.error('Error fetching therapy resources:', err);
    res.status(500).json({ error: 'Failed to fetch therapy resources' });
  }
});

export default router;
