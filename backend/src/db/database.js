import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'bloomwalk.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      daily_step_goal INTEGER NOT NULL DEFAULT 5000,
      app_theme TEXT NOT NULL DEFAULT 'pastel_botanical'
    );

    INSERT OR IGNORE INTO settings (id, daily_step_goal, app_theme) 
    VALUES (1, 5000, 'pastel_botanical');
  `);

  try {
    db.exec('ALTER TABLE settings ADD COLUMN mapbox_token TEXT;');
  } catch {
    // Column already exists
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS flowers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      rarity TEXT CHECK(rarity IN ('common', 'uncommon', 'rare', 'legendary')) NOT NULL DEFAULT 'common',
      meaning TEXT NOT NULL,
      sprite_url TEXT NOT NULL,
      required_weather TEXT NOT NULL DEFAULT 'any',
      min_steps_required INTEGER NOT NULL DEFAULT 0,
      preferred_time TEXT NOT NULL DEFAULT 'any',
      season TEXT NOT NULL DEFAULT 'all',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS flower_locations (
      id TEXT PRIMARY KEY,
      flower_id TEXT NOT NULL REFERENCES flowers(id) ON DELETE CASCADE,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      place_name TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS motivational_quotes (
      id TEXT PRIMARY KEY,
      quote TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'mindfulness'
    );

    CREATE TABLE IF NOT EXISTS daily_bouquets (
      bouquet_date TEXT PRIMARY KEY, -- Format: YYYY-MM-DD
      bouquet_title TEXT DEFAULT 'Daily Bouquet',
      arrangement_style TEXT DEFAULT 'vase',
      total_steps INTEGER NOT NULL DEFAULT 0,
      step_goal_met INTEGER NOT NULL DEFAULT 0,
      flower_count INTEGER NOT NULL DEFAULT 0,
      dominant_mood TEXT,
      dominant_weather TEXT,
      day_journal TEXT,
      daily_quote_id TEXT REFERENCES motivational_quotes(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS flower_collections (
      id TEXT PRIMARY KEY,
      bouquet_date TEXT NOT NULL REFERENCES daily_bouquets(bouquet_date) ON DELETE CASCADE,
      flower_id TEXT NOT NULL REFERENCES flowers(id) ON DELETE RESTRICT,
      bouquet_slot INTEGER NOT NULL DEFAULT 1,
      collected_lat REAL NOT NULL,
      collected_lng REAL NOT NULL,
      mood TEXT,
      weather TEXT,
      steps_at_time INTEGER NOT NULL DEFAULT 0,
      journal_note TEXT,
      collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS therapy_resources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT CHECK(category IN ('exercise', 'breathing', 'hotline', 'article')) NOT NULL,
      summary TEXT NOT NULL,
      content_markdown TEXT,
      contact_number TEXT,
      external_link TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_collections_bouquet_date ON flower_collections(bouquet_date);
    CREATE INDEX IF NOT EXISTS idx_collections_flower ON flower_collections(flower_id);
    CREATE INDEX IF NOT EXISTS idx_flower_locations_geo ON flower_locations(latitude, longitude);
  `);
}

export default db;
