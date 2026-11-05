import db, { initDatabase } from './database.js';
import { fileURLToPath } from 'node:url';

export function seed() {
  initDatabase();

  // 1. Seed 12 Therapeutic 8-Bit Flowers
  const flowers = [
    {
      id: 'flower_chamomile',
      name: 'Peaceful Chamomile',
      species: 'Matricaria chamomilla',
      rarity: 'common',
      meaning: 'Calmness in chaos, soothing restless thoughts.',
      sprite_url: 'assets/sprites/flower_chamomile.png',
      required_weather: 'any',
      min_steps_required: 0,
      preferred_time: 'any',
      season: 'all'
    },
    {
      id: 'flower_sunflower',
      name: 'Golden Sunflower',
      species: 'Helianthus annuus',
      rarity: 'common',
      meaning: 'Unwavering warmth, resilience, and looking toward the light.',
      sprite_url: 'assets/sprites/flower_sunflower.png',
      required_weather: 'sunny',
      min_steps_required: 500,
      preferred_time: 'afternoon',
      season: 'summer'
    },
    {
      id: 'flower_lavender',
      name: 'Restful Lavender',
      species: 'Lavandula angustifolia',
      rarity: 'common',
      meaning: 'Release of tension, deep quietude, and peaceful slumber.',
      sprite_url: 'assets/sprites/flower_lavender.png',
      required_weather: 'any',
      min_steps_required: 1000,
      preferred_time: 'twilight',
      season: 'all'
    },
    {
      id: 'flower_morning_glory',
      name: 'Dawn Morning Glory',
      species: 'Ipomoea purpurea',
      rarity: 'uncommon',
      meaning: 'Fresh beginnings and greeting each day with curiosity.',
      sprite_url: 'assets/sprites/flower_morning_glory.png',
      required_weather: 'sunny',
      min_steps_required: 1500,
      preferred_time: 'morning',
      season: 'spring'
    },
    {
      id: 'flower_dewdrop_lily',
      name: 'Dewdrop Water Lily',
      species: 'Nymphaea alba',
      rarity: 'uncommon',
      meaning: 'Purity of mind and emotional cleansing through rain.',
      sprite_url: 'assets/sprites/flower_dewdrop_lily.png',
      required_weather: 'rainy',
      min_steps_required: 1000,
      preferred_time: 'any',
      season: 'all'
    },
    {
      id: 'flower_forget_me_not',
      name: 'True Forget-Me-Not',
      species: 'Myosotis sylvatica',
      rarity: 'uncommon',
      meaning: 'Cherished memories and self-compassion across time.',
      sprite_url: 'assets/sprites/flower_forget_me_not.png',
      required_weather: 'cloudy',
      min_steps_required: 2000,
      preferred_time: 'any',
      season: 'all'
    },
    {
      id: 'flower_dandelion',
      name: 'Wishing Dandelion',
      species: 'Taraxacum officinale',
      rarity: 'common',
      meaning: 'Hope, simple joys, and releasing wishes into the breeze.',
      sprite_url: 'assets/sprites/flower_dandelion.png',
      required_weather: 'any',
      min_steps_required: 250,
      preferred_time: 'any',
      season: 'all'
    },
    {
      id: 'flower_moonflower',
      name: 'Luminescent Moonflower',
      species: 'Ipomoea alba',
      rarity: 'rare',
      meaning: 'Beauty that blossoms in darkness; gentle nighttime comfort.',
      sprite_url: 'assets/sprites/flower_moonflower.png',
      required_weather: 'any',
      min_steps_required: 3000,
      preferred_time: 'night',
      season: 'all'
    },
    {
      id: 'flower_clover',
      name: 'Emerald Four-Leaf Clover',
      species: 'Trifolium repens',
      rarity: 'rare',
      meaning: 'Serendipity, gentle fortune, and mindful observation.',
      sprite_url: 'assets/sprites/flower_clover.png',
      required_weather: 'rainy',
      min_steps_required: 3500,
      preferred_time: 'any',
      season: 'spring'
    },
    {
      id: 'flower_cherry_blossom',
      name: 'Transient Cherry Blossom',
      species: 'Prunus serrulata',
      rarity: 'rare',
      meaning: 'Embracing the present moment and the impermanence of stress.',
      sprite_url: 'assets/sprites/flower_cherry_blossom.png',
      required_weather: 'sunny',
      min_steps_required: 4000,
      preferred_time: 'morning',
      season: 'spring'
    },
    {
      id: 'flower_silver_sage',
      name: 'Grounded Silver Sage',
      species: 'Salvia argentea',
      rarity: 'uncommon',
      meaning: 'Emotional clarity, wisdom, and centered breath.',
      sprite_url: 'assets/sprites/flower_silver_sage.png',
      required_weather: 'cloudy',
      min_steps_required: 2500,
      preferred_time: 'any',
      season: 'autumn'
    },
    {
      id: 'flower_celestial_lotus',
      name: 'Celestial Lotus',
      species: 'Nelumbo nucifera',
      rarity: 'legendary',
      meaning: 'Overcoming hardship, inner peace, and spiritual renewal.',
      sprite_url: 'assets/sprites/flower_celestial_lotus.png',
      required_weather: 'any',
      min_steps_required: 6000,
      preferred_time: 'twilight',
      season: 'all'
    }
  ];

  const insertFlower = db.prepare(`
    INSERT OR IGNORE INTO flowers 
    (id, name, species, rarity, meaning, sprite_url, required_weather, min_steps_required, preferred_time, season)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const f of flowers) {
    insertFlower.run(
      f.id, f.name, f.species, f.rarity, f.meaning, f.sprite_url,
      f.required_weather, f.min_steps_required, f.preferred_time, f.season
    );
  }

  // 2. Seed 52 Curated Walkable Flower Locations across Vancouver, BC
  const locations = [
    // Coal Harbour & Stanley Park
    { id: 'loc_1', flower_id: 'flower_chamomile', lat: 49.2895, lng: -123.1280, name: 'Coal Harbour Seawall' },
    { id: 'loc_2', flower_id: 'flower_sunflower', lat: 49.2863, lng: -123.1434, name: 'English Bay Beach Pathway' },
    { id: 'loc_3', flower_id: 'flower_lavender', lat: 49.2985, lng: -123.1390, name: 'Stanley Park Rose Garden' },
    { id: 'loc_4', flower_id: 'flower_dandelion', lat: 49.2743, lng: -123.1534, name: 'Kitsilano Beach Lawn' },
    { id: 'loc_5', flower_id: 'flower_dewdrop_lily', lat: 49.3015, lng: -123.1440, name: 'Lost Lagoon, Stanley Park' },
    { id: 'loc_6', flower_id: 'flower_morning_glory', lat: 49.2810, lng: -123.1180, name: 'Robson Square Plaza' },
    { id: 'loc_7', flower_id: 'flower_cherry_blossom', lat: 49.2417, lng: -123.1126, name: 'Queen Elizabeth Park Quarry' },
    { id: 'loc_8', flower_id: 'flower_celestial_lotus', lat: 49.2798, lng: -123.1042, name: 'Dr. Sun Yat-Sen Classical Garden' },
    { id: 'loc_9', flower_id: 'flower_clover', lat: 49.2708, lng: -123.1352, name: 'Granville Island Public Market' },
    { id: 'loc_10', flower_id: 'flower_silver_sage', lat: 49.2710, lng: -123.1030, name: 'Olympic Village Seawall' },
    { id: 'loc_11', flower_id: 'flower_moonflower', lat: 49.2835, lng: -123.1070, name: 'Gastown Steam Clock Plaza' },
    { id: 'loc_12', flower_id: 'flower_forget_me_not', lat: 49.2394, lng: -123.1311, name: 'VanDusen Botanical Garden' },
    { id: 'loc_13', flower_id: 'flower_chamomile', lat: 49.2720, lng: -123.1870, name: 'Jericho Beach Waterfront' },
    { id: 'loc_14', flower_id: 'flower_sunflower', lat: 49.2625, lng: -123.2480, name: 'UBC Botanical Garden' },
    { id: 'loc_15', flower_id: 'flower_lavender', lat: 49.2690, lng: -123.1190, name: 'Charleson Park Hill' },
    { id: 'loc_16', flower_id: 'flower_dandelion', lat: 49.2730, lng: -123.0690, name: 'Commercial Drive Piazza' },
    { id: 'loc_17', flower_id: 'flower_dewdrop_lily', lat: 49.2760, lng: -123.2100, name: 'Spanish Banks Beach' },
    { id: 'loc_18', flower_id: 'flower_silver_sage', lat: 49.2600, lng: -123.2180, name: 'Pacific Spirit Regional Park' },
    { id: 'loc_19', flower_id: 'flower_cherry_blossom', lat: 49.2735, lng: -123.1220, name: 'David Lam Park, Yaletown' },
    { id: 'loc_20', flower_id: 'flower_sunflower', lat: 49.2815, lng: -123.1370, name: 'Sunset Beach Park' },
    { id: 'loc_21', flower_id: 'flower_chamomile', lat: 49.2905, lng: -123.1210, name: 'Harbour Green Park' },
    { id: 'loc_22', flower_id: 'flower_moonflower', lat: 49.2730, lng: -123.1035, name: 'Science World Boardwalk' },
    { id: 'loc_23', flower_id: 'flower_clover', lat: 49.2550, lng: -123.0640, name: 'Trout Lake Park' },
    { id: 'loc_24', flower_id: 'flower_morning_glory', lat: 49.2888, lng: -123.1111, name: 'Canada Place Promenade' },
    { id: 'loc_25', flower_id: 'flower_celestial_lotus', lat: 49.3140, lng: -123.1400, name: 'Prospect Point Lookout' },
    { id: 'loc_26', flower_id: 'flower_silver_sage', lat: 49.3330, lng: -123.2620, name: 'Lighthouse Park Trail' },
    // Additional Detailed Vancouver Points of Interest
    { id: 'loc_27', flower_id: 'flower_forget_me_not', lat: 49.3009, lng: -123.1174, name: 'Brockton Point Lighthouse' },
    { id: 'loc_28', flower_id: 'flower_dewdrop_lily', lat: 49.3080, lng: -123.1365, name: 'Beaver Lake Sanctuary' },
    { id: 'loc_29', flower_id: 'flower_sunflower', lat: 49.3025, lng: -123.1565, name: 'Third Beach Sunset Point' },
    { id: 'loc_30', flower_id: 'flower_chamomile', lat: 49.2930, lng: -123.1510, name: 'Second Beach Pool Park' },
    { id: 'loc_31', flower_id: 'flower_celestial_lotus', lat: 49.2995, lng: -123.1205, name: 'Stanley Park Totem Poles' },
    { id: 'loc_32', flower_id: 'flower_silver_sage', lat: 49.3090, lng: -123.1530, name: 'Siwash Rock Seawall Bluff' },
    { id: 'loc_33', flower_id: 'flower_lavender', lat: 49.2925, lng: -123.1345, name: 'Devonian Harbour Park' },
    { id: 'loc_34', flower_id: 'flower_dandelion', lat: 49.2872, lng: -123.1418, name: 'Morton Park Laughter Lawn' },
    { id: 'loc_35', flower_id: 'flower_cherry_blossom', lat: 49.2835, lng: -123.1395, name: 'Alexandra Park Victorian Bandshell' },
    { id: 'loc_36', flower_id: 'flower_chamomile', lat: 49.2848, lng: -123.1315, name: 'Barclay Heritage Square' },
    { id: 'loc_37', flower_id: 'flower_sunflower', lat: 49.2818, lng: -123.1290, name: 'Nelson Park Community Garden' },
    { id: 'loc_38', flower_id: 'flower_moonflower', lat: 49.2891, lng: -123.1147, name: 'Jack Poole Plaza Cauldron' },
    { id: 'loc_39', flower_id: 'flower_morning_glory', lat: 49.2860, lng: -123.1005, name: 'CRAB Park at Portside' },
    { id: 'loc_40', flower_id: 'flower_clover', lat: 49.2770, lng: -123.1235, name: 'Emery Barnes Park, Yaletown' },
    { id: 'loc_41', flower_id: 'flower_lavender', lat: 49.2725, lng: -123.1280, name: 'George Wainborn Waterfront Park' },
    { id: 'loc_42', flower_id: 'flower_dewdrop_lily', lat: 49.2730, lng: -123.1140, name: 'Coopers Park False Creek' },
    { id: 'loc_43', flower_id: 'flower_silver_sage', lat: 49.2705, lng: -123.1090, name: 'Hinge Park Habitat Wetland' },
    { id: 'loc_44', flower_id: 'flower_forget_me_not', lat: 49.2750, lng: -123.1010, name: 'Creekside Park Shoreline' },
    { id: 'loc_45', flower_id: 'flower_dandelion', lat: 49.2780, lng: -123.1470, name: 'Vanier Park Maritime Lawn' },
    { id: 'loc_46', flower_id: 'flower_clover', lat: 49.2705, lng: -123.1700, name: 'Tatlow Park Stream' },
    { id: 'loc_47', flower_id: 'flower_chamomile', lat: 49.2740, lng: -123.2010, name: 'Locarno Beach Sandy Trail' },
    { id: 'loc_48', flower_id: 'flower_celestial_lotus', lat: 49.2660, lng: -123.2570, name: 'Nitobe Memorial Garden' },
    { id: 'loc_49', flower_id: 'flower_cherry_blossom', lat: 49.2640, lng: -123.1280, name: 'Choklit Park Vista' },
    { id: 'loc_50', flower_id: 'flower_morning_glory', lat: 49.2635, lng: -123.1040, name: 'Jonathan Rogers Park' },
    { id: 'loc_51', flower_id: 'flower_moonflower', lat: 49.2425, lng: -123.1140, name: 'Bloedel Floral Conservatory' },
    { id: 'loc_52', flower_id: 'flower_sunflower', lat: 49.2890, lng: -123.0380, name: 'New Brighton Park Inlet Trail' }
  ];

  const insertLocation = db.prepare(`
    INSERT OR REPLACE INTO flower_locations (id, flower_id, latitude, longitude, place_name)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const l of locations) {
    insertLocation.run(l.id, l.flower_id, l.lat, l.lng, l.name);
  }

  // 3. Seed Motivational Quotes
  const quotes = [
    {
      id: 'quote_1',
      quote: 'Almost everything will work again if you unplug it for a few minutes, including you.',
      author: 'Anne Lamott',
      category: 'mindfulness'
    },
    {
      id: 'quote_2',
      quote: 'In every walk with nature, one receives far more than he seeks.',
      author: 'John Muir',
      category: 'nature'
    },
    {
      id: 'quote_3',
      quote: 'To plant a garden is to believe in tomorrow.',
      author: 'Audrey Hepburn',
      category: 'encouragement'
    },
    {
      id: 'quote_4',
      quote: 'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.',
      author: 'Thich Nhat Hanh',
      category: 'mindfulness'
    },
    {
      id: 'quote_5',
      quote: 'Adopt the pace of nature: her secret is patience.',
      author: 'Ralph Waldo Emerson',
      category: 'nature'
    }
  ];

  const insertQuote = db.prepare(`
    INSERT OR IGNORE INTO motivational_quotes (id, quote, author, category)
    VALUES (?, ?, ?, ?)
  `);
  for (const q of quotes) {
    insertQuote.run(q.id, q.quote, q.author, q.category);
  }

  // 4. Seed Therapy & Grounding Resources
  const resources = [
    {
      id: 'res_breathing',
      title: '4-7-8 Calming Breath',
      category: 'breathing',
      summary: 'A simple rhythmic breathing practice to reset your nervous system.',
      content_markdown: '1. Inhale quietly through your nose for 4 seconds.\n2. Gently hold your breath for 7 seconds.\n3. Exhale completely through your mouth making a whoosh sound for 8 seconds.\n4. Repeat 4 cycles.',
      contact_number: null,
      external_link: null,
      sort_order: 1
    },
    {
      id: 'res_grounding',
      title: '5-4-3-2-1 Sensory Grounding',
      category: 'exercise',
      summary: 'Anchor yourself in the physical present when feeling anxious or overwhelmed.',
      content_markdown: 'Look around on your walk and identify:\n- 5 things you can see.\n- 4 things you can physically feel (e.g. cool breeze, your shoes on the path).\n- 3 things you can hear (e.g. rustling leaves, distant birds).\n- 2 things you can smell.\n- 1 thing you can taste or one positive truth about yourself.',
      contact_number: null,
      external_link: null,
      sort_order: 2
    },
    {
      id: 'res_hotline_988',
      title: '988 Suicide & Crisis Lifeline',
      category: 'hotline',
      summary: 'Free, confidential 24/7 support for you or a loved one in distress.',
      content_markdown: 'Call or text 988 anytime. Available across the United States in English and Spanish.',
      contact_number: '988',
      external_link: 'https://988lifeline.org',
      sort_order: 3
    },
    {
      id: 'res_crisistextline',
      title: 'Crisis Text Line',
      category: 'hotline',
      summary: 'Free, 24/7 text support with a trained crisis counselor.',
      content_markdown: 'Text HOME to 741741 to connect with a crisis counselor 24/7.',
      contact_number: '741741',
      external_link: 'https://www.crisistextline.org',
      sort_order: 4
    }
  ];

  const insertResource = db.prepare(`
    INSERT OR IGNORE INTO therapy_resources 
    (id, title, category, summary, content_markdown, contact_number, external_link, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const r of resources) {
    insertResource.run(
      r.id, r.title, r.category, r.summary, r.content_markdown,
      r.contact_number, r.external_link, r.sort_order
    );
  }

  // 5. Seed Multi-Month Bouquets (For the Monthly Calendars List)
  const sampleDays = [
    {
      date: '2026-11-05',
      steps: 4500,
      mood: 'Peaceful',
      weather: 'Sunny',
      journal: 'Walked the Stanley Park seawall on a crisp autumn morning.',
      flowers: [
        { id: 'flower_chamomile', slot: 1, note: 'Found near Coal Harbour Seawall' },
        { id: 'flower_sunflower', slot: 2, note: 'Bright bloom facing the inlet' }
      ]
    },
    {
      date: '2026-11-03',
      steps: 5200,
      mood: 'Grounded',
      weather: 'Cloudy',
      journal: 'Gentle walk through the Stanley Park Rose Garden.',
      flowers: [
        { id: 'flower_lavender', slot: 1, note: 'Soothing lavender scent in the autumn breeze' }
      ]
    },
    {
      date: '2026-11-01',
      steps: 6100,
      mood: 'Joyful',
      weather: 'Rainy',
      journal: 'Mindful rain walk around Lost Lagoon.',
      flowers: [
        { id: 'flower_dewdrop_lily', slot: 1, note: 'Glistening in the rain drops' },
        { id: 'flower_dandelion', slot: 2, note: 'Little wishes blown across the grass' }
      ]
    },
    {
      date: '2026-10-28',
      steps: 3900,
      mood: 'Reflective',
      weather: 'Sunny',
      journal: 'Afternoon stroll along Kitsilano Beach.',
      flowers: [
        { id: 'flower_morning_glory', slot: 1, note: 'Fresh morning flower near the sand' }
      ]
    },
    {
      date: '2026-10-24',
      steps: 6800,
      mood: 'Joyful',
      weather: 'Sunny',
      journal: 'Long walk through Queen Elizabeth Park.',
      flowers: [
        { id: 'flower_clover', slot: 1, note: 'Lucky four-leaf clover tucked in the lawn' },
        { id: 'flower_cherry_blossom', slot: 2, note: 'Delicate petals floating in the breeze' }
      ]
    },
    {
      date: '2026-10-18',
      steps: 5100,
      mood: 'Grounded',
      weather: 'Overcast',
      journal: 'Refreshed at the Classical Chinese Garden.',
      flowers: [
        { id: 'flower_silver_sage', slot: 1, note: 'Earthy calm among the stone courtyards' }
      ]
    },
    {
      date: '2026-10-12',
      steps: 4200,
      mood: 'Peaceful',
      weather: 'Sunny',
      journal: 'Early autumn sunlight at English Bay.',
      flowers: [
        { id: 'flower_chamomile', slot: 1, note: 'Peaceful chamomile beside the seawall' }
      ]
    }
  ];

  const insertBouquet = db.prepare(`
    INSERT OR REPLACE INTO daily_bouquets 
    (bouquet_date, bouquet_title, total_steps, step_goal_met, flower_count, dominant_mood, dominant_weather, day_journal)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCollection = db.prepare(`
    INSERT OR REPLACE INTO flower_collections
    (id, bouquet_date, flower_id, bouquet_slot, collected_lat, collected_lng, mood, weather, steps_at_time, journal_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const day of sampleDays) {
    insertBouquet.run(
      day.date,
      'Daily Bouquet',
      day.steps,
      day.steps >= 5000 ? 1 : 0,
      day.flowers.length,
      day.mood,
      day.weather,
      day.journal
    );

    for (const f of day.flowers) {
      insertCollection.run(
        `col_${day.date}_${f.slot}`,
        day.date,
        f.id,
        f.slot,
        49.2890,
        -123.1310,
        day.mood,
        day.weather,
        day.steps,
        f.note
      );
    }
  }

  console.log('Single-person database successfully seeded!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed();
}
