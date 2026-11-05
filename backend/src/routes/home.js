import express from 'express';
import db from '../db/database.js';

const router = express.Router();

function getTodayDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// GET /api/home
router.get('/', (req, res) => {
  try {
    const today = getTodayDateString();

    // 1. Settings
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() || { daily_step_goal: 5000 };

    // 2. Today's Bouquet
    let todayBouquet = db.prepare('SELECT * FROM daily_bouquets WHERE bouquet_date = ?').get(today);
    let flowersToday = [];

    if (todayBouquet) {
      flowersToday = db.prepare(`
        SELECT fc.*, f.name, f.species, f.rarity, f.meaning, f.sprite_url
        FROM flower_collections fc
        JOIN flowers f ON fc.flower_id = f.id
        WHERE fc.bouquet_date = ?
        ORDER BY fc.bouquet_slot ASC
      `).all(today);
    }

    // 3. Flower of the day (deterministic based on day of year)
    const allFlowers = db.prepare('SELECT * FROM flowers ORDER BY id ASC').all();
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const flowerOfTheDay = allFlowers.length > 0 ? allFlowers[dayOfYear % allFlowers.length] : null;

    // Check if flower of the day has ever been collected
    let flowerOfTheDayUnlocked = false;
    if (flowerOfTheDay) {
      const checkCollected = db.prepare('SELECT id FROM flower_collections WHERE flower_id = ? LIMIT 1').get(flowerOfTheDay.id);
      flowerOfTheDayUnlocked = !!checkCollected;
    }

    // 4. Daily Motivational Quote
    const quotes = db.prepare('SELECT * FROM motivational_quotes').all();
    const quote = quotes.length > 0 ? quotes[dayOfYear % quotes.length] : null;

    res.json({
      date: today,
      step_goal: settings.daily_step_goal,
      today_bouquet: todayBouquet ? {
        ...todayBouquet,
        flowers: flowersToday
      } : {
        bouquet_date: today,
        flower_count: 0,
        total_steps: 0,
        step_goal_met: 0,
        flowers: []
      },
      flower_of_the_day: flowerOfTheDay ? {
        ...flowerOfTheDay,
        is_unlocked: flowerOfTheDayUnlocked
      } : null,
      motivational_quote: quote,
      weather: {
        condition: 'Sunny',
        temperature_f: 70,
        icon: '☀️'
      }
    });
  } catch (err) {
    console.error('Error fetching home dashboard:', err);
    res.status(500).json({ error: 'Failed to load home dashboard' });
  }
});

export default router;
