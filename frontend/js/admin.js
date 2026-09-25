// js/admin.js
// Admin panel logic. Only users with role 'admin' may use it.
// Tabs: Questions (list/edit/delete), Add Question, Users, Quiz Results.
// Tip: typing a brand-new category in the question form is how you add a
// new quiz category — the dashboard <select> picks it up via the datalist.

let questionsCache = [];

document.addEventListener('DOMContentLoaded', initAdmin);

async function initAdmin() {
  requireAuth();

  try {
    const { user } = await apiFetch('/auth/me');
    if (user.role !== 'admin') {
      document.getElementById('accessDenied').classList.remove('hidden');
      return;
    }
  } catch (error) {
    document.getElementById('accessDenied').classList.remove('hidden');
    return;
  }

  document.getElementById('adminContent').classList.remove('hidden');

  setupTabs();
  document.getElementById('questionForm').addEventListener('submit', handleQuestionSubmit);
  document.getElementById('qCancelBtn').addEventListener('click', resetQuestionForm);
  document.getElementById('adminCategoryFilter').addEventListener('change', renderQuestions);

  await Promise.all([loadQuestions(), loadUsers(), loadResults()]);
}

// ---------- Tabs ----------
function setupTabs() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
    });
  });
}

// ---------- Questions ----------
async function loadQuestions() {
  // Admins receive the full question objects, including correctAnswer.
  questionsCache = await apiFetch('/questions');

  // Fill the category filter + the new-category datalist.
  const categories = [...new Set(questionsCache.map((q) => q.category))].sort();
  const filter = document.getElementById('adminCategoryFilter');
  filter.innerHTML = '<option value="">All categories</option>' +
    categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  document.getElementById('categoryList').innerHTML =
    categories.map((c) => `<option value="${escapeHtml(c)}">`).join('');

  renderQuestions();
}

function renderQuestions() {
  const filter = document.getElementById('adminCategoryFilter').value;
  const body = document.getElementById('adminQuestionsBody');
  const rows = questionsCache.filter((q) => !filter || q.category === filter);

  if (rows.length === 0) {
    body.innerHTML = '<tr><td colspan="4" class="center muted">No questions found.</td></tr>';
    return;
  }

  body.innerHTML = '';
  for (const q of rows) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(q.question)}</td>
      <td>${escapeHtml(q.category)}</td>
      <td>${escapeHtml(q.difficulty)}</td>
      <td><div class="action-btns">
        <button class="btn btn-small btn-edit" data-edit="${q._id}">Edit</button>
        <button class="btn btn-small btn-danger" data-delete="${q._id}">Delete</button>
      </div></td>
    `;
    body.appendChild(tr);
  }

  body.querySelectorAll('[data-edit]').forEach((btn) =>
    btn.addEventListener('click', () => startEdit(btn.dataset.edit)));
  body.querySelectorAll('[data-delete]').forEach((btn) =>
    btn.addEventListener('click', () => deleteQuestion(btn.dataset.delete)));
}

function readQuestionForm() {
  const options = [0, 1, 2, 3].map((i) => document.getElementById(`qOpt${i}`).value.trim());
  return {
    question: document.getElementById('qText').value.trim(),
    options,
    correctAnswer: options[parseInt(document.getElementById('qCorrect').value, 10)],
    category: document.getElementById('qCategory').value.trim(),
    difficulty: document.getElementById('qDifficulty').value,
    explanation: document.getElementById('qExplanation').value.trim(),
  };
}

async function handleQuestionSubmit(event) {
  event.preventDefault();
  const errorBox = document.getElementById('qFormError');
  errorBox.classList.add('hidden');

  const payload = readQuestionForm();
  if (!payload.question || payload.options.some((o) => !o) || !payload.category) {
    errorBox.textContent = 'Please fill in the question, all 4 options and the category.';
    errorBox.classList.remove('hidden');
    return;
  }

  const editingId = document.getElementById('qId').value;
  try {
    if (editingId) {
      await apiFetch(`/questions/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await apiFetch('/questions', { method: 'POST', body: JSON.stringify(payload) });
    }
    resetQuestionForm();
    await loadQuestions();
    document.querySelector('[data-tab="questions"]').click();
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.classList.remove('hidden');
  }
}

function startEdit(id) {
  const q = questionsCache.find((item) => item._id === id);
  if (!q) return;

  document.getElementById('qId').value = q._id;
  document.getElementById('qText').value = q.question;
  q.options.forEach((opt, i) => { document.getElementById(`qOpt${i}`).value = opt; });
  document.getElementById('qCorrect').value = String(q.options.indexOf(q.correctAnswer));
  document.getElementById('qCategory').value = q.category;
  document.getElementById('qDifficulty').value = q.difficulty;
  document.getElementById('qExplanation').value = q.explanation || '';

  document.getElementById('questionFormTitle').textContent = 'Edit Question';
  document.getElementById('qSubmitBtn').textContent = 'Save Changes';
  document.getElementById('qCancelBtn').classList.remove('hidden');
  document.querySelector('[data-tab="add"]').click();
}

function resetQuestionForm() {
  document.getElementById('questionForm').reset();
  document.getElementById('qId').value = '';
  document.getElementById('questionFormTitle').textContent = 'Add Question';
  document.getElementById('qSubmitBtn').textContent = 'Add Question';
  document.getElementById('qCancelBtn').classList.add('hidden');
}

async function deleteQuestion(id) {
  if (!confirm('Delete this question permanently?')) return;
  await apiFetch(`/questions/${id}`, { method: 'DELETE' });
  await loadQuestions();
}

// ---------- Users ----------
async function loadUsers() {
  const users = await apiFetch('/users');
  const body = document.getElementById('adminUsersBody');
  body.innerHTML = '';
  for (const u of users) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td>${escapeHtml(u.role)}</td>
      <td>${new Date(u.createdAt).toLocaleDateString()}</td>
    `;
    body.appendChild(tr);
  }
}

// ---------- Results ----------
async function loadResults() {
  const results = await apiFetch('/quiz/results');
  const body = document.getElementById('adminResultsBody');
  if (results.length === 0) {
    body.innerHTML = '<tr><td colspan="6" class="center muted">No quiz results yet.</td></tr>';
    return;
  }
  body.innerHTML = '';
  for (const r of results) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(r.user ? r.user.name : 'Unknown')}</td>
      <td><strong>${r.score}</strong></td>
      <td>${r.percentage}%</td>
      <td>${escapeHtml(r.category)}</td>
      <td>${escapeHtml(r.difficulty)}</td>
      <td>${new Date(r.createdAt).toLocaleString()}</td>
    `;
    body.appendChild(tr);
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
