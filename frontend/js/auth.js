// js/auth.js
// Handles the login and register forms.
// On success: saves { user, token } to localStorage and goes to the dashboard.
// On failure: shows the backend's error message in the error box.

document.addEventListener('DOMContentLoaded', () => {
  requireGuest(); // already logged in? skip these pages

  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const registerForm = document.getElementById('registerForm');
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
});

function showError(message) {
  const box = document.getElementById('formError');
  box.textContent = message;
  box.classList.remove('hidden');
}

function setLoading(button, loading, label) {
  button.disabled = loading;
  button.textContent = loading ? 'Please wait…' : label;
}

async function handleLogin(event) {
  event.preventDefault();
  const button = document.getElementById('submitBtn');
  setLoading(button, true);

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    // POST /api/auth/login -> { user, token }
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    location.href = 'dashboard.html';
  } catch (error) {
    showError(error.message);
    setLoading(button, false, 'Login');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const button = document.getElementById('submitBtn');
  setLoading(button, true);

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Quick client-side checks (the backend validates again).
  if (!name || !email || !password) {
    showError('Please fill in all fields.');
    setLoading(button, false, 'Sign Up');
    return;
  }
  if (password.length < 6) {
    showError('Password must be at least 6 characters long.');
    setLoading(button, false, 'Sign Up');
    return;
  }

  try {
    // POST /api/auth/register -> { user, token }
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    location.href = 'dashboard.html';
  } catch (error) {
    showError(error.message);
    setLoading(button, false, 'Sign Up');
  }
}
