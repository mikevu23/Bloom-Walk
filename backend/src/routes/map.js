import express from 'express';
import db from '../db/database.js';

const router = express.Router();

function getTodayDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// GET /api/map/flowers
// Query params: lat, lng, steps, weather
router.get('/flowers', (req, res) => {
  try {
    const today = getTodayDateString();
    const currentSteps = parseInt(req.query.steps, 10) || 0;
    const currentWeather = (req.query.weather || 'sunny').toLowerCase();

    // Fetch all locations joined with flower metadata
    const locations = db.prepare(`
      SELECT 
        fl.id as location_id,
        fl.latitude,
        fl.longitude,
        fl.place_name,
        f.id as flower_id,
        f.name as flower_name,
        f.species,
        f.rarity,
        f.meaning,
        f.sprite_url,
        f.required_weather,
        f.min_steps_required
      FROM flower_locations fl
      JOIN flowers f ON fl.flower_id = f.id
      WHERE fl.is_active = 1
    `).all();

    // Check which flowers have been collected today
    const collectedToday = db.prepare(`
      SELECT DISTINCT flower_id
      FROM flower_collections
      WHERE bouquet_date = ?
    `).all(today);

    const collectedSet = new Set(collectedToday.map(c => c.flower_id));

    const markers = locations.map(loc => {
      const isCollectedToday = collectedSet.has(loc.flower_id);
      const isStepUnlocked = currentSteps >= loc.min_steps_required;
      const isWeatherUnlocked = loc.required_weather === 'any' || loc.required_weather.toLowerCase() === currentWeather;

      return {
        id: loc.location_id,
        flower_id: loc.flower_id,
        name: loc.flower_name,
        species: loc.species,
        rarity: loc.rarity,
        meaning: loc.meaning,
        sprite_url: loc.sprite_url,
        latitude: loc.latitude,
        longitude: loc.longitude,
        place_name: loc.place_name,
        is_collected: isCollectedToday,
        is_step_unlocked: isStepUnlocked,
        is_weather_unlocked: isWeatherUnlocked,
        can_collect: !isCollectedToday && isStepUnlocked && isWeatherUnlocked,
        min_steps_required: loc.min_steps_required,
        required_weather: loc.required_weather
      };
    });

    res.json({
      today,
      markers
    });
  } catch (err) {
    console.error('Error fetching map markers:', err);
    res.status(500).json({ error: 'Failed to fetch map markers' });
  }
});

export default router;
