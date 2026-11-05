import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET /api/flowers
router.get('/', (req, res) => {
  try {
    const flowers = db.prepare('SELECT * FROM flowers ORDER BY min_steps_required ASC').all();

    // Attach total times collected by the user
    const stats = db.prepare(`
      SELECT flower_id, COUNT(*) as collection_count
      FROM flower_collections
      GROUP BY flower_id
    `).all();

    const countsMap = new Map();
    for (const s of stats) {
      countsMap.set(s.flower_id, s.collection_count);
    }

    const result = flowers.map(f => ({
      ...f,
      times_collected: countsMap.get(f.id) || 0,
      is_discovered: (countsMap.get(f.id) || 0) > 0
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching flower catalog:', err);
    res.status(500).json({ error: 'Failed to fetch flower catalog' });
  }
});

// GET /api/flowers/:id
router.get('/:id', (req, res) => {
  try {
    const flower = db.prepare('SELECT * FROM flowers WHERE id = ?').get(req.params.id);
    if (!flower) {
      return res.status(404).json({ error: 'Flower not found' });
    }

    const history = db.prepare(`
      SELECT * FROM flower_collections
      WHERE flower_id = ?
      ORDER BY collected_at DESC
    `).all(req.params.id);

    res.json({
      ...flower,
      history,
      is_discovered: history.length > 0
    });
  } catch (err) {
    console.error('Error fetching flower details:', err);
    res.status(500).json({ error: 'Failed to fetch flower details' });
  }
});

export default router;
