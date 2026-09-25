// js/leaderboard.js
// Fetches the global top-20 from GET /api/leaderboard and renders the table.

document.addEventListener('DOMContentLoaded', initLeaderboard);

async function initLeaderboard() {
  requireAuth();

  const body = document.getElementById('leaderboardBody');

  try {
    const entries = await apiFetch('/leaderboard');

    if (entries.length === 0) {
      body.innerHTML = '<tr><td colspan="7" class="center muted">No scores yet — be the first.</td></tr>';
      return;
    }

    body.innerHTML = '';
    entries.forEach((entry, i) => {
      const rank = i + 1;
      const medalClass = rank <= 3 ? `rank-medal r${rank}` : 'rank-medal';
      const date = new Date(entry.createdAt).toLocaleDateString();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="${medalClass}">${rank}</span></td>
        <td>${escapeHtml(entry.user ? entry.user.name : 'Unknown')}</td>
        <td class="num"><strong>${entry.score}</strong></td>
        <td class="num">${entry.percentage}%</td>
        <td>${escapeHtml(entry.category)}</td>
        <td>${escapeHtml(entry.difficulty)}</td>
        <td>${date}</td>
      `;
      body.appendChild(tr);
    });
  } catch (error) {
    body.innerHTML = `<tr><td colspan="7" class="center error-text">${escapeHtml(error.message)}</td></tr>`;
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
