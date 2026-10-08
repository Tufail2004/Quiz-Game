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
    // Token expired/invalid -> clear and send back to the name screen.
    clearAuth();
    const page = location.pathname.split('/').pop();
    if (page !== 'register.html' && page !== 'index.html' && page !== '') {
      location.href = 'register.html';
    }
    throw new Error('Please enter your name again to keep playing 😊');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ---------- Page guards ----------
// No email/password — a "logged in" player is just a name + token.
function requireAuth() {
  if (!getToken()) location.href = 'register.html';
}
function requireGuest() {
  if (getToken()) location.href = 'dashboard.html';
}

// ---------- Theme ----------
// Sun / moon emoji for the theme toggle — fun for kids!
function initTheme() {
  const saved = localStorage.getItem('quizTheme') || 'light';
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
  if (btn) btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '🌙' : '☀️';
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
