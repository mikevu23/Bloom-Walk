// Bloom walk Frontend Controller (Single-Person Companion)

let currentSteps = 1250;
let currentWeather = 'sunny';
let activeFlower = null;
let map = null;
let is3DMode = false;
let currentMarkers = [];

// Flower emoji / sprite mapping for web prototype
const flowerEmojiMap = {
  'flower_chamomile': '🌼',
  'flower_sunflower': '🌻',
  'flower_lavender': '🪻',
  'flower_morning_glory': '🌺',
  'flower_dewdrop_lily': '🪷',
  'flower_forget_me_not': '💠',
  'flower_dandelion': '🌾',
  'flower_moonflower': '🌙',
  'flower_clover': '🍀',
  'flower_cherry_blossom': '🌸',
  'flower_silver_sage': '🌿',
  'flower_celestial_lotus': '✨'
};

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSimulatorControls();
  initDrawerAndModals();
  initMap();
  loadHomeDashboard();
  loadCrisisContacts();
});

// 1. Tab Navigation
function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const screens = document.querySelectorAll('.screen');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      screens.forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-target');
      document.getElementById(targetId)?.classList.add('active');

      if (targetId === 'screen-map') {
        setTimeout(() => {
          if (!map) {
            initMap();
          } else {
            map.resize();
            loadMapMarkers();
          }
        }, 100);
      } else if (targetId === 'screen-garden') {
        loadMonthlyCalendarsList();
      } else if (targetId === 'screen-home') {
        loadHomeDashboard();
      }
    });
  });

  // "Monthly Calendars ↗" button on My Little Garden card switches to Garden tab
  document.getElementById('open-roster-btn')?.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    screens.forEach(s => s.classList.remove('active'));

    const gardenTab = document.querySelector('.nav-tab[data-target="screen-garden"]');
    gardenTab?.classList.add('active');
    document.getElementById('screen-garden')?.classList.add('active');
    loadMonthlyCalendarsList();
  });
}

// 2. Simulator Controls (Steps & Weather)
function initSimulatorControls() {
  const stepSlider = document.getElementById('step-slider');
  const stepDisplay = document.getElementById('step-count-display');
  const headerSteps = document.getElementById('header-steps');
  const weatherSelect = document.getElementById('weather-select');
  const headerWeather = document.getElementById('header-weather');
  const refreshBtn = document.getElementById('refresh-map-btn');

  stepSlider.addEventListener('input', (e) => {
    currentSteps = parseInt(e.target.value, 10);
    stepDisplay.textContent = currentSteps.toLocaleString();
    headerSteps.textContent = `👟 ${currentSteps.toLocaleString()}`;
  });

  weatherSelect.addEventListener('change', (e) => {
    currentWeather = e.target.value;
    const icons = { sunny: '☀️ 72°F', rainy: '🌧️ 60°F', cloudy: '⛅ 65°F' };
    headerWeather.textContent = icons[currentWeather] || '☀️ 72°F';
  });

  refreshBtn.addEventListener('click', () => {
    loadMapMarkers();
  });

  // Mapbox Access Token Config
  const tokenInput = document.getElementById('mapbox-token-input');
  const saveTokenBtn = document.getElementById('save-token-btn');
  if (tokenInput && saveTokenBtn) {
    // Populate from local storage or server config
    fetch('/api/config')
      .then(r => r.json())
      .then(d => {
        if (d.mapboxToken) {
          localStorage.setItem('bloomwalk_mapbox_token', d.mapboxToken);
          tokenInput.value = d.mapboxToken;
        } else {
          tokenInput.value = localStorage.getItem('bloomwalk_mapbox_token') || '';
        }
      })
      .catch(() => {
        tokenInput.value = localStorage.getItem('bloomwalk_mapbox_token') || '';
      });

    saveTokenBtn.addEventListener('click', async () => {
      const tok = tokenInput.value.trim();
      localStorage.setItem('bloomwalk_mapbox_token', tok);
      try {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mapboxToken: tok })
        });
      } catch (err) {
        console.warn('Could not persist token to server:', err);
      }
      alert(tok ? 'Mapbox token saved! Refreshing page to initialize map...' : 'Token cleared.');
      location.reload();
    });
  }
}

// 3. Load Home Dashboard
async function loadHomeDashboard() {
  try {
    const res = await fetch('/api/home');
    const data = await res.json();

    // Format date next to weather and steps (e.g. "Nov 5")
    if (data.date) {
      const parts = data.date.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthStr = monthNames[parseInt(parts[1], 10) - 1] || 'Nov';
      const dayStr = parseInt(parts[2], 10) || 5;
      document.getElementById('header-date').textContent = `${monthStr} ${dayStr}`;
    }

    // 1. Flower of the day (Top)
    if (data.flower_of_the_day) {
      const fotd = data.flower_of_the_day;
      document.getElementById('fotd-name').textContent = fotd.name;
      document.getElementById('fotd-species').textContent = fotd.species;
      document.getElementById('fotd-meaning').textContent = `"${fotd.meaning}"`;
      document.getElementById('fotd-sprite-box').textContent = flowerEmojiMap[fotd.id] || '🌸';
    }

    // 2. "My Little Garden" Checkerboard Grid (Centerpiece)
    await renderMyLittleGarden();

    // 3. Motivational Quote of the Day (Underneath Garden)
    if (data.motivational_quote) {
      document.getElementById('quote-text').textContent = data.motivational_quote.quote;
      document.getElementById('quote-author').textContent = `— ${data.motivational_quote.author}`;
    }

    // 4. Crisis Contacts Only
    await loadCrisisContacts();
  } catch (err) {
    console.error('Failed to load home dashboard:', err);
  }
}

// 3b. Load Crisis Contacts Only (Direct Contacts, No Suggestions)
async function loadCrisisContacts() {
  const container = document.getElementById('home-contacts-container');
  if (!container) return;

  try {
    const res = await fetch('/api/resources');
    const data = await res.json();
    const contacts = data.contacts || [
      { title: '988 Suicide & Crisis Lifeline', summary: 'Free, confidential 24/7 support', contact_number: '988' },
      { title: 'Crisis Text Line', summary: 'Text HOME for 24/7 support', contact_number: '741741' }
    ];

    container.innerHTML = '';
    contacts.forEach(c => {
      const card = document.createElement('div');
      card.className = 'contact-card';
      const actionText = c.contact_number === '741741' ? 'Text 741741' : `Call/Text ${c.contact_number}`;
      const href = c.contact_number === '741741' ? 'sms:741741' : `tel:${c.contact_number}`;

      card.innerHTML = `
        <div class="contact-info">
          <h5>${c.title}</h5>
          <p>${c.summary}</p>
        </div>
        <a href="${href}" class="contact-action-btn">${actionText}</a>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load contacts:', err);
  }
}

// 4. Render "My Little Garden" Checkerboard Plot (6 columns x 4 rows = 24 tiles)
async function renderMyLittleGarden() {
  const gridContainer = document.getElementById('garden-grid');
  const bloomsBadge = document.getElementById('total-blooms-badge');
  if (!gridContainer) return;

  gridContainer.innerHTML = '';

  try {
    const res = await fetch('/api/garden');
    const bouquets = await res.json();

    const allCollected = [];
    bouquets.forEach(b => {
      (b.flowers || []).forEach(f => {
        allCollected.push(f);
      });
    });

    const totalBlooms = allCollected.length;
    bloomsBadge.textContent = `${totalBlooms} bloom${totalBlooms === 1 ? '' : 's'} collected`;

    const totalTiles = 24;
    const sproutIndices = new Set([4, 6, 11, 14, 18, 20]);

    for (let i = 0; i < totalTiles; i++) {
      const row = Math.floor(i / 6);
      const col = i % 6;
      const isLight = (row + col) % 2 === 0;

      const tile = document.createElement('div');
      tile.className = `garden-tile ${isLight ? 'tile-light' : 'tile-dark'}`;

      if (i < allCollected.length) {
        const flower = allCollected[i];
        tile.classList.add('has-flower');
        tile.textContent = flowerEmojiMap[flower.flower_id] || '🌸';
        tile.title = `${flower.name} (Found on ${flower.bouquet_date})`;

        tile.addEventListener('click', () => {
          openDetailModal(flower);
        });
      } else if (sproutIndices.has(i)) {
        tile.classList.add('empty-sprout');
        tile.textContent = '🌱';
      }

      gridContainer.appendChild(tile);
    }
  } catch (err) {
    console.error('Failed to render garden grid:', err);
  }
}

// 5. Interactive Mapbox GL JS Map (Vancouver, BC with 52 Flower Spawns)
function initMap() {
  if (map) {
    map.resize();
    return;
  }

  const mapContainer = document.getElementById('mapbox-container');
  if (!mapContainer) return;

  const vancouverCenter = [-123.1310, 49.2890];
  const userToken = (localStorage.getItem('bloomwalk_mapbox_token') || '').trim();

  if (!userToken) {
    showTokenPrompt('Please enter your Mapbox Public Token (starts with pk.) to load the Mapbox 3D vector map of Vancouver.');
    return;
  }

  mapboxgl.accessToken = userToken;

  try {
    map = new mapboxgl.Map({
      container: 'mapbox-container',
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: vancouverCenter,
      zoom: 13.8,
      pitch: 0,
      bearing: 0
    });

    // Remove any previous token prompt
    document.getElementById('map-token-overlay')?.remove();

    // Mapbox navigation controls (zoom & compass)
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      console.log('Mapbox map loaded successfully!');
      addUserLocationPuck();
      loadMapMarkers();
    });

    map.on('error', (e) => {
      console.warn('Mapbox status/error:', e);
      if (e && e.error && e.error.status === 401) {
        showTokenPrompt('The Mapbox access token returned 401 Unauthorized. Please verify that you copied the Default Public Token (starts with pk.eyJ...) from your Mapbox account dashboard.');
      }
    });

    // Floating controls
    document.getElementById('map-tilt-btn')?.addEventListener('click', () => {
      is3DMode = !is3DMode;
      map.easeTo({
        pitch: is3DMode ? 55 : 0,
        bearing: is3DMode ? -20 : 0,
        duration: 800
      });
    });

    document.getElementById('map-recenter-btn')?.addEventListener('click', () => {
      map.flyTo({
        center: vancouverCenter,
        zoom: 14.5,
        pitch: 0,
        bearing: 0,
        duration: 1200
      });
    });
  } catch (err) {
    console.error('Failed to create Mapbox map instance:', err);
    showTokenPrompt(`Mapbox initialization error: ${err.message || 'Please check token.'}`);
  }
}

function showTokenPrompt(message) {
  let overlay = document.getElementById('map-token-overlay');
  const container = document.getElementById('screen-map');
  if (!container) return;

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'map-token-overlay';
    overlay.className = 'map-token-overlay';
    container.appendChild(overlay);
  }

  const currentVal = localStorage.getItem('bloomwalk_mapbox_token') || '';

  overlay.innerHTML = `
    <div class="token-modal-content">
      <div style="font-size: 32px; margin-bottom: 8px;">🗺️</div>
      <h4 style="margin-bottom: 6px; font-size: 14px; font-weight: 700; color: var(--forest-dark-text);">Mapbox Token Setup</h4>
      <p style="font-size: 11px; color: var(--forest-muted-text); margin-bottom: 12px; line-height: 1.4;">${message}</p>
      <input type="text" id="overlay-token-input" value="${currentVal}" placeholder="pk.eyJ1..." style="width: 100%; padding: 8px 10px; font-size: 11px; border-radius: 8px; border: 1px solid var(--green-border); margin-bottom: 8px; background: var(--green-surface-subtle);" />
      <button id="overlay-save-token-btn" class="primary-btn" style="padding: 10px; font-size: 12px;">Activate Mapbox Map</button>
      <a href="https://account.mapbox.com/access-tokens/" target="_blank" style="display: block; font-size: 10.5px; color: #2563EB; margin-top: 10px; text-decoration: underline; font-weight: 600;">Get your free token from mapbox.com ↗</a>
    </div>
  `;

  document.getElementById('overlay-save-token-btn')?.addEventListener('click', async () => {
    const val = document.getElementById('overlay-token-input').value.trim();
    if (!val) return;
    localStorage.setItem('bloomwalk_mapbox_token', val);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mapboxToken: val })
      });
    } catch {}
    location.reload();
  });
}

function addUserLocationPuck() {
  if (!map) return;
  const el = document.createElement('div');
  el.className = 'user-puck-wrapper';
  el.innerHTML = `
    <div class="user-puck-halo"></div>
    <div style="width:16px;height:16px;background:#2563EB;border-radius:50%;border:2.5px solid white;box-shadow:0 0 10px rgba(37,99,235,0.7);z-index:2;"></div>
  `;

  new mapboxgl.Marker({ element: el, anchor: 'center' })
    .setLngLat([-123.1310, 49.2890])
    .addTo(map);
}

async function loadMapMarkers() {
  if (!map) return;
  try {
    const res = await fetch(`/api/map/flowers?steps=${currentSteps}&weather=${currentWeather}`);
    const data = await res.json();

    currentMarkers.forEach(m => m.remove());
    currentMarkers = [];

    data.markers.forEach(markerData => {
      const emoji = flowerEmojiMap[markerData.flower_id] || '🌸';
      const statusClass = markerData.is_collected ? 'collected' : (!markerData.can_collect ? 'locked' : '');

      const markerEl = document.createElement('div');
      markerEl.className = `pixel-map-marker ${statusClass}`;
      markerEl.title = `${markerData.name} - ${markerData.place_name || 'Vancouver'}`;
      markerEl.innerHTML = emoji;
      markerEl.style.cursor = 'pointer';
      markerEl.style.pointerEvents = 'auto';

      markerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        openMapFlowerDrawer(markerData);
      });

      const marker = new mapboxgl.Marker({ element: markerEl, anchor: 'center' })
        .setLngLat([markerData.longitude, markerData.latitude])
        .addTo(map);

      currentMarkers.push(marker);
    });
  } catch (err) {
    console.error('Failed to load map markers:', err);
  }
}

// 6. Right-Sliding Drawer & Modals
function initDrawerAndModals() {
  const drawer = document.getElementById('map-flower-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const collectionForm = document.getElementById('drawer-collection-form');

  const closeDrawer = () => {
    drawer.classList.remove('open');
    backdrop.classList.add('hidden');
  };

  closeDrawerBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  collectionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeFlower) return;

    const mood = document.querySelector('input[name="mood"]:checked')?.value || 'Peaceful';

    try {
      const res = await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowerId: activeFlower.flower_id,
          lat: activeFlower.latitude,
          lng: activeFlower.longitude,
          mood: mood,
          weather: currentWeather,
          steps: currentSteps,
          journalNote: '' // Optional reflection note removed
        })
      });

      const result = await res.json();
      if (result.success) {
        closeDrawer();
        loadMapMarkers();
        loadHomeDashboard();
      }
    } catch (err) {
      console.error('Error recording flower:', err);
    }
  });

  // Modal 1: Daily Bouquet & Multi-Flower List Expansion
  const bouquetModal = document.getElementById('day-bouquet-modal');
  const closeBouquetBtn = document.getElementById('close-bouquet-btn');
  closeBouquetBtn?.addEventListener('click', () => {
    bouquetModal.classList.add('hidden');
  });
  bouquetModal?.addEventListener('click', (e) => {
    if (e.target === bouquetModal) {
      bouquetModal.classList.add('hidden');
    }
  });

  // Modal 2: Flower Detail Inspection
  const detailModal = document.getElementById('flower-detail-modal');
  const closeDetailBtn = document.getElementById('close-detail-btn');
  closeDetailBtn.addEventListener('click', () => {
    detailModal.classList.add('hidden');
  });
  detailModal?.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      detailModal.classList.add('hidden');
    }
  });
}

function openMapFlowerDrawer(marker) {
  activeFlower = marker;
  const drawer = document.getElementById('map-flower-drawer');
  const backdrop = document.getElementById('drawer-backdrop');

  // 1. Drawer Header title is the Flower Name (no duplicate title underneath)
  document.getElementById('drawer-header-title').textContent = `🌸 ${marker.name}`;
  document.getElementById('drawer-flower-species').textContent = marker.species;
  document.getElementById('drawer-flower-meaning').textContent = `"${marker.meaning}"`;
  
  // 2. Floating sprite (no square outline)
  const spriteEl = document.getElementById('drawer-sprite');
  spriteEl.textContent = flowerEmojiMap[marker.flower_id] || '🌸';

  // 3. Location and Rarity
  document.getElementById('drawer-location-tag').textContent = `📍 ${marker.place_name || 'Vancouver, BC'}`;
  const rarityTag = document.getElementById('drawer-rarity-tag');
  rarityTag.textContent = `${(marker.rarity || 'common').toUpperCase()} BLOOM`;
  
  // Style rarity tag
  if (marker.rarity === 'legendary') {
    rarityTag.style.background = '#FDE68A';
    rarityTag.style.color = '#92400E';
  } else if (marker.rarity === 'rare') {
    rarityTag.style.background = '#DDD6FE';
    rarityTag.style.color = '#5B21B6';
  } else {
    rarityTag.style.background = 'var(--green-surface-subtle)';
    rarityTag.style.color = 'var(--forest-dark-text)';
  }

  // 4. Dynamic Weather-Dependent Flower Forms
  const weatherBadge = document.getElementById('drawer-weather-form');
  const formTitle = document.getElementById('form-card-title');
  const formDesc = document.getElementById('form-card-desc');

  if (currentWeather === 'rainy') {
    weatherBadge.textContent = '🌧️ Drooping Dewdrop Form (Rainy)';
    formTitle.textContent = '🌧️ Rainy Weather Reaction';
    formDesc.textContent = "Coastal Vancouver rain causes its petals to rest gently downward, glistening with cool dewdrops.";
    spriteEl.style.transform = 'rotate(-6deg) translateY(3px)';
  } else if (currentWeather === 'cloudy') {
    weatherBadge.textContent = '⛅ Resting Bud Form (Overcast)';
    formTitle.textContent = '⛅ Overcast Weather Reaction';
    formDesc.textContent = "Under cloudy skies, the blossom rests partially closed, conserving moisture and vitality.";
    spriteEl.style.transform = 'scale(0.92)';
  } else {
    weatherBadge.textContent = '☀️ Radiant Full Bloom (Sunny)';
    formTitle.textContent = '☀️ Sunny Weather Reaction';
    formDesc.textContent = "Basking in the coastal sunshine, its petals are wide open, upright, and radiant.";
    spriteEl.style.transform = 'scale(1.05)';
  }

  const submitBtn = document.getElementById('drawer-submit-btn');
  if (marker.is_collected) {
    submitBtn.textContent = 'Already in Your Garden ✓';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
  } else if (!marker.can_collect) {
    submitBtn.textContent = `Requires ${marker.min_steps_required} Steps`;
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
  } else {
    submitBtn.textContent = 'Pick & Plant in Garden';
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
  }

  backdrop.classList.remove('hidden');
  drawer.classList.add('open');
}

// 7. Open Flower Detail Inspection Modal
function openDetailModal(flower) {
  const modal = document.getElementById('flower-detail-modal');
  document.getElementById('detail-flower-name').textContent = flower.name;
  document.getElementById('detail-flower-species').textContent = flower.species || '';
  document.getElementById('detail-meaning').textContent = `"${flower.meaning || ''}"`;
  document.getElementById('detail-sprite-box').textContent = flowerEmojiMap[flower.flower_id || flower.id] || '🌸';

  const rarityPill = document.getElementById('detail-rarity');
  rarityPill.textContent = `${(flower.rarity || 'common').toUpperCase()} BLOOM`;

  const metaGrid = document.getElementById('detail-meta-grid');
  metaGrid.innerHTML = `
    <div class="meta-item">
      <div class="meta-label">Mood Recorded</div>
      <div class="meta-value">${flower.mood || '🌿 Peaceful'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Steps Walked</div>
      <div class="meta-value">${(flower.steps_at_time || 0).toLocaleString()} steps</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Weather</div>
      <div class="meta-value">${flower.weather || '☀️ Sunny'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Planted On</div>
      <div class="meta-value">${flower.bouquet_date || 'Today'}</div>
    </div>
  `;

  if (flower.journal_note) {
    metaGrid.innerHTML += `
      <div class="meta-item" style="grid-column: span 2;">
        <div class="meta-label">Daily Journal Reflection</div>
        <div class="meta-value" style="font-style: italic; font-weight: normal; margin-top: 2px;">“${flower.journal_note}”</div>
      </div>
    `;
  }

  modal.classList.remove('hidden');
}

// 8. GARDEN SCREEN: RENDER LIST OF MONTHLY CALENDARS
async function loadMonthlyCalendarsList() {
  const container = document.getElementById('monthly-calendars-list');
  if (!container) return;

  try {
    const res = await fetch('/api/garden');
    const bouquets = await res.json();

    // Map bouquets by date: "YYYY-MM-DD" -> bouquet object
    const bouquetsByDate = new Map();
    bouquets.forEach(b => {
      bouquetsByDate.set(b.bouquet_date, b);
    });

    // We will render calendars for November 2026 and October 2026 (scrollable chronicle list)
    const monthsToRender = [
      { year: 2026, month: 11, name: 'November 2026' },
      { year: 2026, month: 10, name: 'October 2026' }
    ];

    container.innerHTML = '';

    monthsToRender.forEach(m => {
      const card = createMonthCalendarCard(m.year, m.month, m.name, bouquetsByDate);
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load monthly calendars:', err);
  }
}

// Helper to construct a single Monthly Calendar card
function createMonthCalendarCard(year, month, monthTitle, bouquetsByDate) {
  const card = document.createElement('div');
  card.className = 'month-calendar-card';

  // Calculate days in month and starting weekday (Mon=0 .. Sun=6)
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  let startDayIndex = firstDay.getDay() - 1; // Convert to Mon=0
  if (startDayIndex === -1) startDayIndex = 6; // Sunday

  // Tally blooms and steps for this month
  let monthBlooms = 0;
  let monthSteps = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const monthStr = String(month).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;
    const bouquet = bouquetsByDate.get(dateKey);
    if (bouquet) {
      monthBlooms += bouquet.flower_count || (bouquet.flowers?.length || 0);
      monthSteps += bouquet.total_steps || 0;
    }
  }

  // Header
  const header = document.createElement('div');
  header.className = 'month-card-header';
  header.innerHTML = `
    <span class="month-title">${monthTitle}</span>
    <span class="month-summary-badge">${monthBlooms} blooms • 👟 ${monthSteps.toLocaleString()} steps</span>
  `;
  card.appendChild(header);

  // Weekday header row
  const weekRow = document.createElement('div');
  weekRow.className = 'cal-grid-header';
  weekRow.innerHTML = `
    <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
  `;
  card.appendChild(weekRow);

  // Calendar days grid
  const daysGrid = document.createElement('div');
  daysGrid.className = 'cal-grid-days';

  // Leading empty pads
  for (let p = 0; p < startDayIndex; p++) {
    const pad = document.createElement('div');
    pad.className = 'cal-day-cell empty-pad';
    daysGrid.appendChild(pad);
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const monthStr = String(month).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;
    const bouquet = bouquetsByDate.get(dateKey);

    const cell = document.createElement('div');
    cell.className = 'cal-day-cell';

    const numSpan = document.createElement('span');
    numSpan.className = 'cal-day-num';
    numSpan.textContent = d;
    cell.appendChild(numSpan);

    if (bouquet && bouquet.flowers && bouquet.flowers.length > 0) {
      cell.classList.add('has-blooms');

      // Flower icons container: show up to 3 icons, plus count badge if more
      const iconBox = document.createElement('div');
      iconBox.className = 'cal-bloom-icons';
      
      const displayFlowers = bouquet.flowers.slice(0, 2);
      displayFlowers.forEach(f => {
        const span = document.createElement('span');
        span.textContent = flowerEmojiMap[f.flower_id] || '🌸';
        iconBox.appendChild(span);
      });

      if (bouquet.flowers.length > 2) {
        const moreBadge = document.createElement('span');
        moreBadge.className = 'cal-bloom-badge';
        moreBadge.textContent = `+${bouquet.flowers.length - 2}`;
        iconBox.appendChild(moreBadge);
      }
      cell.appendChild(iconBox);

      // Star badge if step goal met (>= 5000)
      if (bouquet.total_steps >= 5000) {
        const star = document.createElement('span');
        star.className = 'cal-step-star';
        star.textContent = '⭐';
        cell.appendChild(star);
      }

      cell.title = `${dateKey}: ${bouquet.flowers.length} flowers found, ${bouquet.total_steps} steps. Click to view all flowers!`;

      // Tap day to open ALL flowers found that day
      cell.addEventListener('click', () => {
        openDayBouquetModal(dateKey, bouquet);
      });
    }

    daysGrid.appendChild(cell);
  }

  card.appendChild(daysGrid);
  return card;
}

// 9. OPEN DAY BOUQUET MODAL: EXPANDS ALL FLOWERS FOUND THAT DAY
function openDayBouquetModal(dateKey, bouquet) {
  const modal = document.getElementById('day-bouquet-modal');
  if (!modal) return;

  const parts = dateKey.split('-');
  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  const dayNum = parseInt(parts[2], 10);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const formattedDate = `${monthNames[monthNum - 1] || 'Month'} ${dayNum}, ${year}`;

  document.getElementById('bouquet-modal-date-badge').textContent = formattedDate.toUpperCase();
  document.getElementById('bouquet-modal-title').textContent = `🌸 ${bouquet.bouquet_title || 'Daily Bouquet'}`;

  const flowersCount = bouquet.flowers ? bouquet.flowers.length : (bouquet.flower_count || 0);
  document.getElementById('bouquet-flower-count').textContent = `${flowersCount} bloom${flowersCount === 1 ? '' : 's'} found`;
  document.getElementById('bouquet-total-steps').textContent = `👟 ${(bouquet.total_steps || 0).toLocaleString()} steps`;
  document.getElementById('bouquet-weather').textContent = bouquet.dominant_weather ? `🌤️ ${bouquet.dominant_weather}` : '☀️ Sunny';

  const journalEl = document.getElementById('bouquet-journal-display');
  if (bouquet.day_journal) {
    journalEl.textContent = `“${bouquet.day_journal}”`;
    journalEl.style.display = 'block';
  } else {
    journalEl.style.display = 'none';
  }

  // Render the list of ALL flowers collected on that day
  const listContainer = document.getElementById('day-flowers-list-container');
  listContainer.innerHTML = '';

  if (!bouquet.flowers || bouquet.flowers.length === 0) {
    listContainer.innerHTML = '<p style="color:var(--forest-muted-text); font-size:12px; font-style:italic;">No flowers recorded for this day.</p>';
  } else {
    bouquet.flowers.forEach((flower, idx) => {
      const itemCard = document.createElement('div');
      itemCard.className = 'day-flower-item-card';

      const emoji = flowerEmojiMap[flower.flower_id] || '🌸';
      const rarity = (flower.rarity || 'common').toUpperCase();

      itemCard.innerHTML = `
        <div class="flower-item-sprite-box">${emoji}</div>
        <div class="flower-item-info">
          <div class="flower-item-title-row">
            <span class="flower-item-name">${flower.name}</span>
            <span class="flower-item-rarity">${rarity}</span>
          </div>
          <div class="flower-item-species">${flower.species || 'Botanical specimen'}</div>
          <div class="flower-item-meta">
            <span>🌿 Mood: ${flower.mood || bouquet.dominant_mood || 'Peaceful'}</span>
            <span>📍 Bloom #${idx + 1}</span>
            ${flower.steps_at_time ? `<span>👟 ${flower.steps_at_time.toLocaleString()} steps</span>` : ''}
          </div>
        </div>
        <span class="flower-item-arrow">❯</span>
      `;

      itemCard.addEventListener('click', () => {
        openDetailModal({
          ...flower,
          bouquet_date: dateKey,
          steps_at_time: flower.steps_at_time || bouquet.total_steps,
          mood: flower.mood || bouquet.dominant_mood,
          journal_note: flower.journal_note || bouquet.day_journal
        });
      });

      listContainer.appendChild(itemCard);
    });
  }

  modal.classList.remove('hidden');
}
