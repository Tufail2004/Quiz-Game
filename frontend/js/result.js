// js/result.js
// Reads the graded result from sessionStorage (saved by quiz.js after
// POST /api/quiz/result) and renders the result page.

document.addEventListener('DOMContentLoaded', initResult);

function initResult() {
  requireAuth();

  const raw = sessionStorage.getItem('lastResult');
  if (!raw) {
    // Someone opened result.html directly without playing.
    document.getElementById('noResultBox').classList.remove('hidden');
    return;
  }

  const r = JSON.parse(raw);
  document.getElementById('resultCard').classList.remove('hidden');

  document.getElementById('finalScore').textContent = r.score;
  document.getElementById('rCorrect').textContent = r.correctAnswers;
  document.getElementById('rIncorrect').textContent = r.incorrectAnswers;
  document.getElementById('rUnanswered').textContent = r.unanswered;
  document.getElementById('rPercentage').textContent = `${r.percentage}%`;
  document.getElementById('rTotal').textContent = r.totalQuestions;
  document.getElementById('rTime').textContent = `${r.timeTaken}s`;
  document.getElementById('performanceMsg').textContent = performanceMessage(r.percentage);

  document.getElementById('playAgainBtn').addEventListener('click', () => {
    location.href = `quiz.html?category=${encodeURIComponent(r.category)}&difficulty=${r.difficulty}`;
  });
}

function performanceMessage(percentage) {
  if (percentage >= 90) return 'Outstanding! You are a quiz master! 🏆';
  if (percentage >= 70) return 'Great job! Keep it up! 🎉';
  if (percentage >= 50) return 'Good effort — keep practicing! 💪';
  return 'Every master was once a beginner. Try again! 📚';
}
