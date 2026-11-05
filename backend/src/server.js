import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDatabase } from './db/database.js';
import db from './db/database.js';
import { seed } from './db/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route imports
import homeRoutes from './routes/home.js';
import flowersRoutes from './routes/flowers.js';
import mapRoutes from './routes/map.js';
import collectionRoutes from './routes/collection.js';
import gardenRoutes from './routes/garden.js';
import resourcesRoutes from './routes/resources.js';

// Initialize SQLite database and ensure seed data
initDatabase();
seed();

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../public')));

  // Mount API Routes
  app.use('/api/home', homeRoutes);
  app.use('/api/flowers', flowersRoutes);
  app.use('/api/map', mapRoutes);
  app.use('/api/collection', collectionRoutes);
  app.use('/api/garden', gardenRoutes);
  app.use('/api/resources', resourcesRoutes);

  // App settings & Mapbox token config
  app.get('/api/config', (req, res) => {
    try {
      const row = db.prepare('SELECT mapbox_token FROM settings WHERE id = 1').get();
      res.json({ mapboxToken: row?.mapbox_token || process.env.MAPBOX_ACCESS_TOKEN || '' });
    } catch {
      res.json({ mapboxToken: '' });
    }
  });

  app.post('/api/config', (req, res) => {
    try {
      const { mapboxToken } = req.body;
      db.prepare('UPDATE settings SET mapbox_token = ? WHERE id = 1').run((mapboxToken || '').trim());
      res.json({ success: true, mapboxToken: (mapboxToken || '').trim() });
    } catch {
      res.status(500).json({ error: 'Failed to save config' });
    }
  });

  // Root healthcheck
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'bloomwalk-backend', mode: 'single-person' });
  });

  return app;
}

// Start server only if executed directly
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  const PORT = process.env.PORT || 3000;
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`🌸 BloomWalk Backend running on http://localhost:${PORT}`);
  });
}

export default createApp;
