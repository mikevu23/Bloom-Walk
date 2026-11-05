import express from 'express';
import crypto from 'node:crypto';
import db from '../db/database.js';

const router = express.Router();

function getTodayDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// POST /api/collection
router.post('/', (req, res) => {
  try {
    const { flowerId, lat, lng, mood, weather, steps, journalNote } = req.body;

    if (!flowerId) {
      return res.status(400).json({ error: 'flowerId is required' });
    }

    const today = getTodayDateString();
    const latitude = typeof lat === 'number' ? lat : 0;
    const longitude = typeof lng === 'number' ? lng : 0;
    const currentSteps = typeof steps === 'number' ? steps : 0;
    const moodTag = mood || 'Peaceful';
    const weatherString = weather || 'Sunny';
    const note = journalNote || '';

    // Verify flower exists
    const flower = db.prepare('SELECT * FROM flowers WHERE id = ?').get(flowerId);
    if (!flower) {
      return res.status(404).json({ error: 'Flower not found' });
    }

    // 1. Ensure daily_bouquets row exists for today
    const existingBouquet = db.prepare('SELECT * FROM daily_bouquets WHERE bouquet_date = ?').get(today);
    const settings = db.prepare('SELECT daily_step_goal FROM settings WHERE id = 1').get() || { daily_step_goal: 5000 };

    if (!existingBouquet) {
      db.prepare(`
        INSERT INTO daily_bouquets 
        (bouquet_date, bouquet_title, total_steps, step_goal_met, flower_count, dominant_mood, dominant_weather, day_journal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        today,
        'Daily Bouquet',
        currentSteps,
        currentSteps >= settings.daily_step_goal ? 1 : 0,
        0,
        moodTag,
        weatherString,
        note
      );
    }

    // 2. Count existing flowers in today's bouquet to assign bouquet_slot
    const currentCountRow = db.prepare('SELECT COUNT(*) as count FROM flower_collections WHERE bouquet_date = ?').get(today);
    const nextSlot = (currentCountRow?.count || 0) + 1;

    // 3. Insert flower collection
    const collectionId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO flower_collections 
      (id, bouquet_date, flower_id, bouquet_slot, collected_lat, collected_lng, mood, weather, steps_at_time, journal_note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      collectionId,
      today,
      flowerId,
      nextSlot,
      latitude,
      longitude,
      moodTag,
      weatherString,
      currentSteps,
      note
    );

    // 4. Update daily_bouquets summary
    db.prepare(`
      UPDATE daily_bouquets 
      SET 
        flower_count = ?,
        total_steps = MAX(total_steps, ?),
        step_goal_met = CASE WHEN MAX(total_steps, ?) >= ? THEN 1 ELSE 0 END,
        dominant_mood = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE bouquet_date = ?
    `).run(
      nextSlot,
      currentSteps,
      currentSteps,
      settings.daily_step_goal,
      moodTag,
      today
    );

    const createdRecord = db.prepare(`
      SELECT fc.*, f.name, f.species, f.rarity, f.meaning, f.sprite_url
      FROM flower_collections fc
      JOIN flowers f ON fc.flower_id = f.id
      WHERE fc.id = ?
    `).get(collectionId);

    res.status(201).json({
      success: true,
      message: `You picked a ${flower.name}! Added to today's bouquet.`,
      collection: createdRecord
    });
  } catch (err) {
    console.error('Error logging flower collection:', err);
    res.status(500).json({ error: 'Failed to record flower collection' });
  }
});

export default router;
