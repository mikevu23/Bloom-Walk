import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET /api/garden
// Query params: month (YYYY-MM optional)
router.get('/', (req, res) => {
  try {
    const month = req.query.month; // e.g. '2026-11'
    let query = 'SELECT * FROM daily_bouquets ORDER BY bouquet_date DESC';
    let params = [];

    if (month) {
      query = 'SELECT * FROM daily_bouquets WHERE bouquet_date LIKE ? ORDER BY bouquet_date ASC';
      params = [`${month}%`];
    }

    const bouquets = db.prepare(query).all(...params);

    // Fetch flowers for these bouquets
    const allCollections = db.prepare(`
      SELECT fc.*, f.name, f.species, f.rarity, f.meaning, f.sprite_url
      FROM flower_collections fc
      JOIN flowers f ON fc.flower_id = f.id
      ORDER BY fc.bouquet_slot ASC
    `).all();

    const collectionsByDate = new Map();
    for (const c of allCollections) {
      if (!collectionsByDate.has(c.bouquet_date)) {
        collectionsByDate.set(c.bouquet_date, []);
      }
      collectionsByDate.get(c.bouquet_date).push(c);
    }

    const result = bouquets.map(b => ({
      ...b,
      flowers: collectionsByDate.get(b.bouquet_date) || []
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching garden bouquets:', err);
    res.status(500).json({ error: 'Failed to fetch garden calendar' });
  }
});

// GET /api/garden/:date
router.get('/:date', (req, res) => {
  try {
    const date = req.params.date; // YYYY-MM-DD
    const bouquet = db.prepare('SELECT * FROM daily_bouquets WHERE bouquet_date = ?').get(date);

    if (!bouquet) {
      return res.status(404).json({
        message: 'No flowers collected on this date',
        bouquet_date: date,
        flowers: []
      });
    }

    const flowers = db.prepare(`
      SELECT fc.*, f.name, f.species, f.rarity, f.meaning, f.sprite_url
      FROM flower_collections fc
      JOIN flowers f ON fc.flower_id = f.id
      WHERE fc.bouquet_date = ?
      ORDER BY fc.bouquet_slot ASC
    `).all(date);

    res.json({
      ...bouquet,
      flowers
    });
  } catch (err) {
    console.error('Error fetching bouquet for date:', err);
    res.status(500).json({ error: 'Failed to fetch bouquet details' });
  }
});

export default router;
