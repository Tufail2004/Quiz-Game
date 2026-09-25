// js/common.js
// Shared helpers used by every page:
//  - API_BASE: where the backend lives (override via localStorage 'quizApiBase')
//  - token storage in localStorage
//  - apiFetch(): fetch() wrapper that attaches the JWT and handles 401s
//  - requireAuth() / requireGuest(): page guards
//  - dark/light theme toggle (saved in localStorage)
//  - renderNav(): fills in the user name, admin link, logout + theme buttons

const API_BASE = localStorage.getItem('quizApiBase') || 'http://localhost:5000/api';

// ---------- Auth storage ----------
function getToken() {
  return localStorage.getItem('quizToken');
}
function setToken(token) {
  localStorage.setItem('quizToken', token);
}
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('quizUser'));
  } catch {
    return null;
  }
}
function setUser(user) {
  localStorage.setItem('quizUser', JSON.stringify(user));
}
function clearAuth() {
  localStorage.removeItem('quizToken');
  localStorage.removeItem('quizUser');
}

// ---------- API helper ----------
// Usage: const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({...}) });
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...options, headers });

  if (res.status === 401) {
    // Token expired/invalid -> log out and send back to the login page.
    clearAuth();
    const page = location.pathname.split('/').pop();
    if (page !== 'login.html' && page !== 'register.html' && page !== 'index.html' && page !== '') {
      location.href = 'login.html';
    }
    throw new Error('Session expired. Please log in again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ---------- Page guards ----------
function requireAuth() {
  if (!getToken()) location.href = 'login.html';
}
function requireGuest() {
  if (getToken()) location.href = 'dashboard.html';
}

// ---------- Theme ----------
// Sun / moon icons for the theme toggle (inline SVG, no emoji).
const ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

function initTheme() {
  const saved = localStorage.getItem('quizTheme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon();
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('quizTheme', next);
  updateThemeIcon();
}
function updateThemeIcon() {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.innerHTML = document.documentElement.getAttribute('data-theme') === 'dark' ? ICON_MOON : ICON_SUN;
}

// ---------- Navbar ----------
function renderNav() {
  const user = getUser();
  const nameEl = document.getElementById('navUserName');
  if (nameEl && user) {
    // Avatar circle with the user's initial + their name (hides name on mobile).
    const initial = (user.name || '?').trim().charAt(0).toUpperCase();
    nameEl.innerHTML = '';
    const avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.textContent = initial;
    const uname = document.createElement('span');
    uname.className = 'uname';
    uname.textContent = user.name;
    nameEl.append(avatar, uname);
  }

  const adminLink = document.getElementById('adminLink');
  if (adminLink && user && user.role === 'admin') adminLink.classList.remove('hidden');

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearAuth();
      location.href = 'index.html';
    });
  }

  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderNav();
});
