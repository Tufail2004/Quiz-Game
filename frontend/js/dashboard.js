// js/dashboard.js
// Loads the player's profile stats + recent quizzes (GET /api/users/profile)
// and starts a new quiz with the chosen category/difficulty.

document.addEventListener('DOMContentLoaded', initDashboard);

async function initDashboard() {
  requireAuth();

  const user = getUser();
  if (user) {
    document.getElementById('welcomeHeading').textContent = `Welcome, ${user.name}! 👋`;
  }

  try {
    const profile = await apiFetch('/users/profile');
    const { stats, recent } = profile;

    document.getElementById('statQuizzes').textContent = stats.quizzesPlayed;
    document.getElementById('statHighest').textContent = stats.highestScore;
    document.getElementById('statAverage').textContent = `${stats.averageScore}%`;
    document.getElementById('statCorrect').textContent = stats.totalCorrect;

    renderRecent(recent);
  } catch (error) {
    console.error('Failed to load profile:', error.message);
  }

  document.getElementById('startQuizBtn').addEventListener('click', () => {
    const category = document.getElementById('categorySelect').value;
    const difficulty = document.getElementById('difficultySelect').value;
    // The quiz page reads these from the URL and fetches its questions.
    location.href = `quiz.html?category=${encodeURIComponent(category)}&difficulty=${difficulty}`;
  });
}

function renderRecent(recent) {
  const list = document.getElementById('recentList');
  if (!recent || recent.length === 0) return; // keep the placeholder text

  list.innerHTML = '';
  for (const r of recent) {
    const item = document.createElement('div');
    item.className = 'recent-item';
    const date = new Date(r.createdAt).toLocaleDateString();
    item.innerHTML = `
      <div><strong>${escapeHtml(r.category)}</strong> <span class="muted">(${escapeHtml(r.difficulty)})</span></div>
      <div><strong>${r.percentage}%</strong> <span class="muted">· ${r.score} pts · ${date}</span></div>
    `;
    list.appendChild(item);
  }
}

// Tiny XSS guard for values rendered into HTML.
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
