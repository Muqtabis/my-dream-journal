/**
 * Browser-local persistence and authentication fallback for static hosting
 * (e.g., GitHub Pages) when no Node/MongoDB backend API server is connected.
 */

const LOCAL_DREAMS_KEY = 'local_dreams';
const LOCAL_USERS_KEY = 'local_journal_users';

function safeParseJSON(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Determine whether a response indicates static hosting (no Express backend).
 */
export function isUnavailableBackendResponse(response) {
  if (!response) return true;
  const contentType = response.headers?.get('content-type') || '';
  if ((response.status === 404 || response.status === 405) && !contentType.includes('application/json')) {
    return true;
  }
  return false;
}

/**
 * Read all dreams saved in local browser storage, migrating any pending visualizer draft.
 */
export function getLocalDreams() {
  const dreams = safeParseJSON(localStorage.getItem(LOCAL_DREAMS_KEY), []);
  const pendingRaw = localStorage.getItem('pending_saved_dream');

  if (pendingRaw) {
    const pending = safeParseJSON(pendingRaw, null);
    localStorage.removeItem('pending_saved_dream');
    if (pending && pending.content) {
      return saveLocalDream({
        title: pending.title || 'Visualized Dream',
        content: pending.content,
        category: pending.category || 'normal',
        mood: 4,
        tags: ['AI-Visualized'],
        isLucid: false,
        isRecurring: false,
        date: new Date().toISOString().split('T')[0],
        imageUrl: pending.imageUrl || '',
        aiInterpretation: pending.aiInterpretation || ''
      });
    }
  }

  return Array.isArray(dreams) ? dreams : [];
}

/**
 * Filter dreams using the exact same rules as backend/routes/dreamRoutes.js.
 */
export function filterLocalDreams(dreams, { category, mood, isLucid, q } = {}) {
  return dreams.filter((dream) => {
    if (category && category !== 'all' && dream.category !== category) {
      return false;
    }
    if (mood && Number(dream.mood) < parseInt(mood, 10)) {
      return false;
    }
    if ((isLucid === true || isLucid === 'true') && !dream.isLucid) {
      return false;
    }
    if (q && q.trim()) {
      const needle = q.trim().toLowerCase();
      const inTitle = (dream.title || '').toLowerCase().includes(needle);
      const inContent = (dream.content || '').toLowerCase().includes(needle);
      const inTags = Array.isArray(dream.tags) && dream.tags.some((t) => String(t).toLowerCase().includes(needle));
      if (!inTitle && !inContent && !inTags) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Persist a new dream locally and return the updated array.
 */
export function createLocalDreamEntry(payload) {
  const newDream = {
    _id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: payload.title || 'Untitled Dream',
    content: payload.content || '',
    category: payload.category || 'normal',
    mood: payload.mood !== undefined ? Number(payload.mood) : 3,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    isLucid: Boolean(payload.isLucid),
    isRecurring: Boolean(payload.isRecurring),
    date: payload.date || new Date().toISOString().split('T')[0],
    imageUrl: payload.imageUrl || '',
    aiInterpretation: payload.aiInterpretation || '',
    createdAt: new Date().toISOString()
  };

  const existing = getLocalDreams();
  const deduped = existing.filter((d) => !(d.content === newDream.content && d.title === newDream.title));
  const updated = [newDream, ...deduped];
  localStorage.setItem(LOCAL_DREAMS_KEY, JSON.stringify(updated));
  return { dream: newDream, dreams: updated };
}

export function saveLocalDream(payload) {
  return createLocalDreamEntry(payload).dreams;
}

export function updateLocalDream(id, updateData) {
  const existing = getLocalDreams();
  let updatedItem = null;
  const next = existing.map((d) => {
    if (d._id === id) {
      updatedItem = { ...d, ...updateData };
      return updatedItem;
    }
    return d;
  });
  localStorage.setItem(LOCAL_DREAMS_KEY, JSON.stringify(next));
  return updatedItem;
}

export function deleteLocalDream(id) {
  const existing = getLocalDreams();
  const next = existing.filter((d) => d._id !== id);
  localStorage.setItem(LOCAL_DREAMS_KEY, JSON.stringify(next));
  return next;
}

async function hashSecret(input) {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(input);
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Simple fallback hash for environments without SubtleCrypto
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

/**
 * Local browser-profile authentication when no backend API server is configured.
 */
export async function authenticateLocally(mode, email, password) {
  if (!email || !password) {
    throw new Error('All fields must be filled');
  }
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    throw new Error('Please enter a valid email address');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const users = safeParseJSON(localStorage.getItem(LOCAL_USERS_KEY), {});
  const passwordHash = await hashSecret(`${cleanEmail}:${password}`);

  if (mode === 'signup') {
    if (users[cleanEmail]) {
      throw new Error('Email already in use on this device');
    }
    users[cleanEmail] = { passwordHash, createdAt: new Date().toISOString() };
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    return { email: cleanEmail, token: 'local-browser-session', isLocal: true };
  }

  // login mode: allow existing local user or create first-time device session cleanly if password matches
  if (users[cleanEmail] && users[cleanEmail].passwordHash !== passwordHash) {
    throw new Error('Incorrect email or password');
  }
  if (!users[cleanEmail]) {
    users[cleanEmail] = { passwordHash, createdAt: new Date().toISOString() };
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  }
  return { email: cleanEmail, token: 'local-browser-session', isLocal: true };
}

/**
 * Shared login/signup request handler with automatic local-browser fallback
 * when deployed on static hosting without a live Express backend.
 */
export async function performAuthRequest(mode, email, password, apiBaseUrl) {
  const endpoint = mode === 'signup' ? '/api/users/signup' : '/api/users/login';

  try {
    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (isUnavailableBackendResponse(response)) {
      return await authenticateLocally(mode, email, password);
    }

    const contentType = response.headers?.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return await authenticateLocally(mode, email, password);
    }

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error || `${mode === 'signup' ? 'Signup' : 'Login'} failed`);
    }
    return json;
  } catch (err) {
    if (err?.name === 'TypeError' || /failed to fetch|networkerror/i.test(err?.message || '')) {
      return await authenticateLocally(mode, email, password);
    }
    throw err;
  }
}
