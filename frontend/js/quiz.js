// js/quiz.js
// The quiz game engine.
// Flow:
//   1. Read category/difficulty from the URL, fetch 10 questions.
//   2. Show one question at a time with a 30-second countdown.
//   3. On answer: lock the options, highlight correct/wrong, show the
//      explanation and a "Next" button. Answers can't be changed.
//   4. On timeout: mark the question unanswered and move on.
//   5. After the last question: POST answers to /api/quiz/result
//      (the server grades and stores the result), then go to result.html.

const SECONDS_PER_QUESTION = 30;
const POINTS = { easy: 10, medium: 20, hard: 30 };
const LETTERS = ['A', 'B', 'C', 'D'];

let questions = [];
let currentIndex = 0;
let answers = []; // { questionId, selected } — selected is null when unanswered
let liveScore = 0;
let timerId = null;
let timeLeft = SECONDS_PER_QUESTION;
let quizStartTime = null;
let category = '';
let difficulty = 'mixed';
let answered = false;

document.addEventListener('DOMContentLoaded', initQuiz);

async function initQuiz() {
  requireAuth();

  const params = new URLSearchParams(location.search);
  category = params.get('category');
  difficulty = params.get('difficulty') || 'mixed';

  if (!category) {
    showError('No category selected. Please pick one from the dashboard.');
    return;
  }

  try {
    // GET /api/quiz/questions?category=..&difficulty=..
    const data = await apiFetch(
      `/quiz/questions?category=${encodeURIComponent(category)}&difficulty=${difficulty}`
    );
    questions = data.questions;
    quizStartTime = Date.now();

    document.getElementById('loadingBox').classList.add('hidden');
    document.getElementById('quizBox').classList.remove('hidden');
    renderQuestion();
  } catch (error) {
    showError(error.message);
  }
}

function renderQuestion() {
  answered = false;
  const q = questions[currentIndex];

  document.getElementById('questionCounter').textContent =
    `Question ${currentIndex + 1} / ${questions.length}`;
  document.getElementById('progressFill').style.width =
    `${(currentIndex / questions.length) * 100}%`;

  const badge = document.getElementById('difficultyBadge');
  badge.textContent = q.difficulty;
  badge.className = `difficulty-badge ${q.difficulty}`;

  document.getElementById('questionText').textContent = q.question;

  // Build the four answer buttons.
  const optionsBox = document.getElementById('options');
  optionsBox.innerHTML = '';
  q.options.forEach((option, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.answer = option;
    btn.innerHTML = `<span class="option-letter">${LETTERS[i]}</span><span></span>`;
    btn.querySelector('span:last-child').textContent = option;
    btn.addEventListener('click', () => selectAnswer(option, btn));
    optionsBox.appendChild(btn);
  });

  document.getElementById('explanationBox').classList.add('hidden');
  document.getElementById('nextBtn').classList.add('hidden');

  startTimer();
}

// ---------- Timer ----------
function startTimer() {
  clearInterval(timerId);
  timeLeft = SECONDS_PER_QUESTION;
  updateTimerDisplay();
  timerId = setInterval(() => {
    timeLeft -= 1;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerId);
      onTimeout();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('timer');
  el.textContent = timeLeft;
  const low = timeLeft <= 10; // pulse red under 10s
  el.classList.toggle('low', low);
  document.getElementById('timerWrap').classList.toggle('low', low);
}

// ---------- Answering ----------
function selectAnswer(selectedText, clickedBtn) {
  if (answered) return; // already answered — ignore extra clicks
  answered = true;
  clearInterval(timerId);

  const q = questions[currentIndex];
  answers.push({ questionId: q._id, selected: selectedText });

  markOptions(q, clickedBtn);

  if (selectedText === q.correctAnswer) {
    liveScore += POINTS[q.difficulty] || 0;
    document.getElementById('liveScore').textContent = liveScore;
  }

  showExplanation(q);
  showNextButton();
}

function onTimeout() {
  if (answered) return;
  answered = true;

  const q = questions[currentIndex];
  answers.push({ questionId: q._id, selected: null }); // unanswered

  markOptions(q, null); // no wrong pick — just reveal the correct one
  showExplanation(q);
  showNextButton();
}

// Lock all buttons, highlight the correct answer (green) and a wrong pick (red).
function markOptions(question, clickedBtn) {
  document.querySelectorAll('.option-btn').forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.answer === question.correctAnswer) {
      btn.classList.add('correct');
    } else if (btn === clickedBtn) {
      btn.classList.add('wrong');
    } else {
      btn.classList.add('dim');
    }
  });
}

function showExplanation(question) {
  const box = document.getElementById('explanationBox');
  document.getElementById('explanationText').textContent =
    question.explanation || 'No explanation available.';
  box.classList.remove('hidden');
}

function showNextButton() {
  const nextBtn = document.getElementById('nextBtn');
  nextBtn.textContent =
    currentIndex === questions.length - 1 ? 'See Results 🏁' : 'Next Question →';
  nextBtn.classList.remove('hidden');
  nextBtn.onclick = nextQuestion;
}

function nextQuestion() {
  currentIndex += 1;
  if (currentIndex >= questions.length) {
    finishQuiz();
    return;
  }
  // Re-trigger the card fade-in animation.
  const card = document.getElementById('questionCard');
  card.classList.remove('fade-in');
  void card.offsetWidth;
  card.classList.add('fade-in');
  renderQuestion();
}

// ---------- Finish ----------
async function finishQuiz() {
  const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);

  try {
    // POST /api/quiz/result — the server grades using the DB's correct
    // answers and stores the result for the leaderboard/history.
    const result = await apiFetch('/quiz/result', {
      method: 'POST',
      body: JSON.stringify({ category, difficulty, answers, timeTaken }),
    });
    sessionStorage.setItem('lastResult', JSON.stringify({ ...result, category, difficulty }));
    location.href = 'result.html';
  } catch (error) {
    showError(error.message);
  }
}

function showError(message) {
  document.getElementById('loadingBox').classList.add('hidden');
  document.getElementById('quizBox').classList.add('hidden');
  document.getElementById('errorText').textContent = message;
  document.getElementById('errorBox').classList.remove('hidden');
}
