// js/history.js
// Fetches the player's own past results from GET /api/users/history
// and renders them as cards, newest first.

document.addEventListener('DOMContentLoaded', initHistory);

async function initHistory() {
  requireAuth();

  const list = document.getElementById('historyList');

  try {
    const history = await apiFetch('/users/history');

    if (history.length === 0) {
      list.innerHTML = '<p class="muted">No quizzes yet — your results will appear here.</p>';
      return;
    }

    list.innerHTML = '';
    for (const r of history) {
      const date = new Date(r.createdAt).toLocaleString();
      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div>
          <h3>${escapeHtml(r.category)} <span class="muted">(${escapeHtml(r.difficulty)})</span></h3>
          <div class="meta">
            <span>${r.correctAnswers} correct</span>
            <span>${r.incorrectAnswers} wrong</span>
            <span>${r.unanswered} unanswered</span>
            <span>${r.timeTaken}s</span>
            <span>${date}</span>
          </div>
        </div>
        <div class="history-score">${r.percentage}%<small>${r.score} pts</small></div>
      `;
      list.appendChild(item);
    }
  } catch (error) {
    list.innerHTML = `<p class="error-text">${escapeHtml(error.message)}</p>`;
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
