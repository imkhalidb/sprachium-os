/* =============================================
   SPRACHIUM GROWTH OS — App Logic
   ============================================= */

// ---- CLOUDFLARE WORKER PROXY ----
const WORKER_URL = 'https://withered-silence-aab7.me-khalidbilal975.workers.dev/';

// ---- STORAGE HELPERS ----
const LS = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  remove: (k) => localStorage.removeItem(k)
};

// ---- STATE ----
let state = {
  apiKey: '',
  sheetsUrl: '',
  day: 1,
  phase: 'foundation',
  startDate: null,
  completedTasks: [],
  contentCount: 0,
  researchCount: 0,
  checklistDone: {}
};

const PHASE_CONFIG = {
  foundation: {
    label: 'Foundation',
    range: [1, 10],
    priority: 'Post your first carousel and lock in your Instagram + Facebook profiles.',
    wins: [
      'Optimize your bio and pin your profile',
      'Create 1 carousel (use the Create module)',
      'Comment on 5 German learning posts for visibility'
    ]
  },
  growth: {
    label: 'Growth',
    range: [11, 20],
    priority: 'Add Reels 3x this week and reply to every comment within 1 hour.',
    wins: [
      'Publish today\'s carousel + 1 Story',
      'Record a 30-sec Reel on one grammar tip',
      'Reply to all comments from yesterday'
    ]
  },
  monetization: {
    label: 'Monetization prep',
    range: [21, 90],
    priority: 'Draft your A1 Course outline and set up your Gumroad page today.',
    wins: [
      'Write Module 1 script for A1 course',
      'Set up a Gumroad waitlist page',
      'Post a "course coming soon" teaser Story'
    ]
  }
};

const PHASE_CHECKLIST = {
  foundation: [
    'Instagram profile fully optimized',
    'Facebook page set up and branded',
    'Sprachium logo added to profiles',
    'First 7 posts published',
    'Website live on Carrd.co',
    'First 100 followers reached',
    'First email collected',
    'Competitor research done (Module 2)'
  ],
  growth: [
    'Reels posted 3x this week',
    'Stories posted daily',
    'First 500 followers reached',
    'Email list at 50+ subscribers',
    'A1 course outline drafted',
    'Gumroad account created',
    'WhatsApp community started',
    'First testimonial collected'
  ],
  monetization: [
    'A1 Course page live on Gumroad',
    'First sale made',
    'Facebook Ads account set up',
    'Zoom group class scheduled',
    'A2 course outline started',
    '500+ email subscribers',
    'Course sold to 10+ students',
    'Revenue target hit this month'
  ]
};

const SYSTEM_PROMPT = `You are the AI business advisor inside the Sprachium Growth OS — a strategic operating system for M. Khalid Junaid (Malik), a Goethe-Zertifikat B2 certified German language instructor based in Depalpur, Pakistan. He is building Sprachium, an online German language institute, targeting English-speaking South Asian students across 7+ countries.

Brand identity: Sprachium (Slate #1E2D4E, Teal #00B8A9, Off-white #F8F9FA). He teaches in English medium only, all materials branded as "M. Khalid Junaid · B2 Goethe-Zertifikat".

Your role: Senior Business Advisor + Social Media Strategist + Content Director. Budget: $0. Goal: build Sprachium from zero to millions of students worldwide.

Advisor principles:
- Zero budget = zero excuses. Always offer free options.
- Consistency beats perfection. Ship imperfect content daily.
- Personal brand first — Malik's face and story IS the brand in Month 1.
- South Asian (Urdu/Hindi-speaking) audience is the initial beachhead.
- Every post has ONE job: grow followers, build trust, or capture leads.
- Revenue follows audience. Build real value first.
- Document the journey — "building in public" is powerful free marketing.

90-day phases:
- Days 1-10: Foundation (1 post/day, carousels only, establish voice)
- Days 11-20: Growth (1 post + 1 Story/day, add Reels 3x/week)
- Days 21-90: Monetization prep (2 posts + Stories + Reels + course launch)

Always be direct, specific, and actionable. No filler. Malik values honest feedback over reassurance.`;

// ---- INIT ----
function init() {
  const saved = LS.get('sprachium-state');
  if (saved) {
    state = Object.assign(state, saved);
    const today = new Date().toDateString();
    if (state.lastSessionDate !== today) {
      state.day = Math.min((state.day || 1) + 1, 90);
      state.lastSessionDate = today;
    }
  } else {
    state.startDate = new Date().toISOString();
    state.lastSessionDate = new Date().toDateString();
  }

  state.apiKey = LS.get('sprachium-api-key') || '';
  state.sheetsUrl = LS.get('sprachium-sheets-url') || '';

  if (!state.apiKey) {
    showScreen('setup-screen');
  } else {
    showScreen('app-screen');
    renderDashboard();
    renderReview();
  }
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ---- SETUP ----
function saveSetup() {
  const key = document.getElementById('api-key-input').value.trim();
  const url = document.getElementById('sheets-url-input').value.trim();
  if (!key) { alert('Please enter your Anthropic API key.'); return; }

  LS.set('sprachium-api-key', key);
  LS.set('sprachium-sheets-url', url);
  state.apiKey = key;
  state.sheetsUrl = url;
  saveState();
  showScreen('app-screen');
  renderDashboard();
  renderReview();
}

// ---- SAVE STATE ----
function saveState() {
  const toSave = Object.assign({}, state);
  delete toSave.apiKey;
  delete toSave.sheetsUrl;
  LS.set('sprachium-state', toSave);
  syncToSheets();
}

// ---- PHASE DETECTION ----
function getPhase() {
  if (state.day <= 10) return 'foundation';
  if (state.day <= 20) return 'growth';
  return 'monetization';
}

// ---- RENDER DASHBOARD ----
function renderDashboard() {
  const phase = getPhase();
  const cfg = PHASE_CONFIG[phase];
  const pct = Math.min(Math.round((state.day / 90) * 100), 100);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  document.getElementById('dash-greeting').textContent = `${greeting}, Malik`;
  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('stat-day').textContent = state.day;
  document.getElementById('stat-tasks').textContent = (state.completedTasks || []).length;
  document.getElementById('stat-posts').textContent = state.contentCount || 0;
  document.getElementById('stat-research').textContent = state.researchCount || 0;
  document.getElementById('prog-fill').style.width = pct + '%';
  document.getElementById('prog-pct').textContent = pct + '%';
  document.getElementById('sb-day').textContent = `Day ${state.day}`;
  document.getElementById('sb-phase').textContent = cfg.label;

  const cl = PHASE_CHECKLIST[phase];
  const done = state.checklistDone || {};
  const clEl = document.getElementById('phase-checklist');
  clEl.innerHTML = cl.map((item, i) => {
    const key = `${phase}-${i}`;
    const checked = done[key] ? 'checked' : '';
    const doneClass = done[key] ? 'done' : '';
    return `<label class="checklist-item ${doneClass}">
      <input type="checkbox" ${checked} onchange="toggleChecklist('${key}', this.checked)" />
      <span>${item}</span>
    </label>`;
  }).join('');
}

function toggleChecklist(key, val) {
  if (!state.checklistDone) state.checklistDone = {};
  state.checklistDone[key] = val;
  saveState();
  renderDashboard();
}

// ---- DAILY BRIEFING ----
async function runDailyBriefing() {
  const phase = getPhase();
  const cfg = PHASE_CONFIG[phase];
  const tasks = (state.completedTasks || []).slice(-5).map(t => t.text).join(', ') || 'none yet';
  const prompt = `Generate a daily briefing for Day ${state.day} of the Sprachium 90-day journey.
Phase: ${cfg.label}
Recent completed tasks: ${tasks}
Posts created so far: ${state.contentCount || 0}

Provide:
1. One-sentence priority for today (the single most important action)
2. Three specific quick wins for today (each under 15 words)
3. A strategic advisor note (2-3 sentences of honest, specific advice for this exact phase)
4. One thing to NOT do today (focus protection)

Format it cleanly. Be direct and specific to Sprachium's situation.`;

  const output = document.getElementById('dash-ai-output');
  output.innerHTML = '<span class="ai-loading">Thinking...</span>';

  const result = await callClaude([{ role: 'user', content: prompt }]);
  output.textContent = result;
}

// ---- MODULE SWITCHING ----
function switchModule(btn, mod) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`mod-${mod}`).classList.add('active');
  if (mod === 'review') renderReview();
}

// ---- CHAT ----
const chatHistories = {};

async function sendChat(mod) {
  const input = document.getElementById(`input-${mod}`);
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  appendMsg(mod, 'user', text);

  if (!chatHistories[mod]) chatHistories[mod] = [];
  chatHistories[mod].push({ role: 'user', content: text });

  const typingId = appendMsg(mod, 'ai', '...');
  const reply = await callClaude(chatHistories[mod]);
  updateMsg(typingId, reply);
  chatHistories[mod].push({ role: 'assistant', content: reply });

  if (mod === 'create') {
    state.contentCount = (state.contentCount || 0) + 1;
    saveState();
    renderDashboard();
  }
  if (mod === 'research') {
    state.researchCount = (state.researchCount || 0) + 1;
    saveState();
    renderDashboard();
  }
}

function quickPrompt(mod, text) {
  document.getElementById(`input-${mod}`).value = text;
  sendChat(mod);
}

function appendMsg(mod, sender, text) {
  const area = document.getElementById(`chat-${mod}`);
  const id = 'msg-' + Date.now();
  const senderLabel = sender === 'user' ? 'You' : 'AI Advisor';
  const div = document.createElement('div');
  div.className = `msg msg-${sender}`;
  div.id = id;
  div.innerHTML = `<span class="msg-sender">${senderLabel}</span><div class="msg-bubble">${escHtml(text)}</div>`;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
  return id;
}

function updateMsg(id, text) {
  const el = document.getElementById(id);
  if (el) el.querySelector('.msg-bubble').textContent = text;
}

function escHtml(t) {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ---- REVIEW ----
function renderReview() {
  const tasks = state.completedTasks || [];
  const phase = getPhase();
  const cfg = PHASE_CONFIG[phase];

  document.getElementById('review-grid').innerHTML = `
    <div class="review-card">
      <h4>Current phase</h4>
      <div style="font-size:20px;font-weight:700;color:#1E2D4E">${cfg.label}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px">Days ${cfg.range[0]}-${cfg.range[1]}</div>
    </div>
    <div class="review-card">
      <h4>Today's priority</h4>
      <div style="font-size:13px;line-height:1.5">${cfg.priority}</div>
    </div>
    <div class="review-card">
      <h4>Content created</h4>
      <div style="font-size:28px;font-weight:700;color:#00B8A9">${state.contentCount || 0}</div>
      <div style="font-size:11px;color:#9ca3af">carousels / posts</div>
    </div>
    <div class="review-card">
      <h4>Research sessions</h4>
      <div style="font-size:28px;font-weight:700;color:#1E2D4E">${state.researchCount || 0}</div>
      <div style="font-size:11px;color:#9ca3af">competitor analyses</div>
    </div>
  `;

  const logEl = document.getElementById('task-log');
  if (tasks.length === 0) {
    logEl.innerHTML = '<span style="font-size:12px;color:#9ca3af">No tasks logged yet. Log your first completed task above.</span>';
  } else {
    logEl.innerHTML = [...tasks].reverse().map(t =>
      `<div class="task-item">
        <span class="task-badge">${t.type}</span>
        <span>${escHtml(t.text)}</span>
        <span class="task-date">${t.date}</span>
      </div>`
    ).join('');
  }
}

function logTask() {
  const text = document.getElementById('task-input').value.trim();
  const type = document.getElementById('task-type').value;
  if (!text) return;

  if (!state.completedTasks) state.completedTasks = [];
  state.completedTasks.push({
    text,
    type,
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  });

  document.getElementById('task-input').value = '';
  saveState();
  renderDashboard();
  renderReview();
}

// ---- GOOGLE SHEETS SYNC ----
async function syncToSheets() {
  if (!state.sheetsUrl) return;
  const payload = {
    action: 'save',
    data: {
      day: state.day,
      phase: getPhase(),
      contentCount: state.contentCount || 0,
      researchCount: state.researchCount || 0,
      tasksCount: (state.completedTasks || []).length,
      lastUpdated: new Date().toISOString(),
      tasks: (state.completedTasks || []).slice(-20)
    }
  };
  try {
    await fetch(state.sheetsUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn('Sheets sync failed silently:', e);
  }
}

async function syncFromSheets() {
  if (!state.sheetsUrl) {
    alert('No Google Sheets URL configured. Go to Settings to add it.');
    return;
  }
  try {
    const res = await fetch(state.sheetsUrl + '?action=load');
    const data = await res.json();
    if (data && data.day) {
      state.day = data.day;
      state.contentCount = data.contentCount || 0;
      state.researchCount = data.researchCount || 0;
      if (data.tasks) state.completedTasks = data.tasks;
      LS.set('sprachium-state', state);
      renderDashboard();
      renderReview();
      alert('Synced from Google Sheets successfully!');
    }
  } catch (e) {
    alert('Could not sync from Sheets. Check your URL in Settings.');
  }
}

// ---- CLAUDE API (via Cloudflare Worker) ----
async function callClaude(messages) {
  if (!state.apiKey) return 'No API key set. Go to Settings to add your Anthropic API key.';
  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: state.apiKey,
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages
      })
    });
    const data = await res.json();
    if (data.error) return `API error: ${data.error.message}`;
    return data.content?.[0]?.text || 'No response received.';
  } catch (e) {
    return `Connection error: ${e.message}`;
  }
}

// ---- SETTINGS ----
function openSettings() {
  document.getElementById('settings-api-key').value = LS.get('sprachium-api-key') || '';
  document.getElementById('settings-sheets-url').value = LS.get('sprachium-sheets-url') || '';
  document.getElementById('settings-day').value = state.day || 1;
  document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('settings-modal').classList.add('hidden');
}

function saveSettingsModal() {
  const key = document.getElementById('settings-api-key').value.trim();
  const url = document.getElementById('settings-sheets-url').value.trim();
  const day = parseInt(document.getElementById('settings-day').value);

  if (key) LS.set('sprachium-api-key', key);
  if (url) LS.set('sprachium-sheets-url', url);
  state.apiKey = key || state.apiKey;
  state.sheetsUrl = url || state.sheetsUrl;
  if (day && day >= 1 && day <= 90) state.day = day;

  saveState();
  renderDashboard();
  renderReview();
  closeSettings();
}

function resetData() {
  if (!confirm('This will delete all your local progress data. Are you sure?')) return;
  localStorage.clear();
  location.reload();
}

// ---- BOOT ----
window.addEventListener('DOMContentLoaded', init);
