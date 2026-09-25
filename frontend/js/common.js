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
  if (btn) btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '🌙' : '☀️';
}

// ---------- Navbar ----------
function renderNav() {
  const user = getUser();
  const nameEl = document.getElementById('navUserName');
  if (nameEl && user) nameEl.textContent = `👤 ${user.name}`;

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
