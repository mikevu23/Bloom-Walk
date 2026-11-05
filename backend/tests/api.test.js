import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/server.js';
import db from '../src/db/database.js';
import { seed } from '../src/db/seed.js';

// Seed fresh data for tests and clean up collections
seed();
db.exec('DELETE FROM flower_collections; DELETE FROM daily_bouquets;');
const app = createApp();

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('GET /health returns status ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.status, 'ok');
  assert.equal(data.mode, 'single-person');
});

test('GET /api/flowers returns all 12 seeded flowers', async () => {
  const res = await fetch(`${baseUrl}/api/flowers`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(data));
  assert.equal(data.length, 12);
  assert.ok(data.some(f => f.name === 'Peaceful Chamomile'));
  assert.ok(data.some(f => f.name === 'Golden Sunflower'));
});

test('GET /api/home returns dashboard stats and flower of the day', async () => {
  const res = await fetch(`${baseUrl}/api/home`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.ok(data.date);
  assert.equal(data.step_goal, 5000);
  assert.ok(data.flower_of_the_day);
  assert.ok(data.motivational_quote);
});

test('GET /api/map/flowers returns map markers for Mapbox', async () => {
  const res = await fetch(`${baseUrl}/api/map/flowers?steps=600&weather=sunny`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(data.markers));
  assert.ok(data.markers.length > 0);
  const sunflower = data.markers.find(m => m.flower_id === 'flower_sunflower');
  assert.ok(sunflower);
  assert.equal(sunflower.is_step_unlocked, true); // 600 steps >= 500
});

test('POST /api/collection collects a flower and creates today\'s bouquet', async () => {
  const res = await fetch(`${baseUrl}/api/collection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      flowerId: 'flower_chamomile',
      lat: 37.7752,
      lng: -122.4185,
      mood: 'Grounded',
      weather: 'Sunny 72F',
      steps: 1200,
      journalNote: 'Felt very calm walking along the meadow pathway.'
    })
  });

  const data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.success, true);
  assert.equal(data.collection.bouquet_slot, 1);
  assert.equal(data.collection.mood, 'Grounded');
  assert.equal(data.collection.journal_note, 'Felt very calm walking along the meadow pathway.');
});

test('POST /api/collection collects a 2nd flower in the same day (bouquet slot 2)', async () => {
  const res = await fetch(`${baseUrl}/api/collection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      flowerId: 'flower_sunflower',
      lat: 37.7761,
      lng: -122.4199,
      mood: 'Joyful',
      weather: 'Sunny 72F',
      steps: 2500,
      journalNote: 'Found bright sunflowers soaking in the afternoon sun!'
    })
  });

  const data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.success, true);
  assert.equal(data.collection.bouquet_slot, 2);
  assert.equal(data.collection.name, 'Golden Sunflower');
});

test('GET /api/garden returns the daily bouquet containing multiple flowers', async () => {
  const res = await fetch(`${baseUrl}/api/garden`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(data));
  assert.ok(data.length >= 1);

  const todayBouquet = data[0];
  assert.equal(todayBouquet.flower_count, 2);
  assert.equal(todayBouquet.flowers.length, 2);
  assert.equal(todayBouquet.flowers[0].name, 'Peaceful Chamomile');
  assert.equal(todayBouquet.flowers[1].name, 'Golden Sunflower');
});

test('GET /api/resources returns calming exercises and hotlines', async () => {
  const res = await fetch(`${baseUrl}/api/resources`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(data.resources));
  assert.ok(data.resources.some(r => r.category === 'breathing'));
  assert.ok(data.resources.some(r => r.category === 'exercise'));
  assert.ok(data.resources.some(r => r.contact_number === '988'));
});
