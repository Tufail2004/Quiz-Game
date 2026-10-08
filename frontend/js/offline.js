// js/offline.js
// OFFLINE MODE — the whole game runs in the browser, no backend needed.
//
// How it works: this file replaces common.js's apiFetch() with a local
// version that answers every API call the pages make, using:
//   - ARFUS_QUESTIONS (js/questions-data.js) for the question bank
//   - localStorage ('arfus_players', 'arfus_results') for players & scores
//
// The page scripts (dashboard.js, quiz.js, ...) don't change at all — they
// keep calling apiFetch('/quiz/questions?...') like before, and this file
// answers from the device. If a backend is ever connected again, just stop
// loading this script and the real apiFetch() takes over.

(function () {
  if (typeof ARFUS_QUESTIONS === 'undefined') {
    console.error('offline.js: questions-data.js must be loaded first.');
    return;
  }

  const POINTS = { easy: 10, medium: 20, hard: 30 };
  const LS_RESULTS = 'arfus_results';
  const LS_PLAYERS = 'arfus_players';

  // ---------- tiny storage helpers ----------
  function loadResults() {
    try {
      return JSON.parse(localStorage.getItem(LS_RESULTS)) || [];
    } catch {
      return [];
    }
  }
  function saveResults(results) {
    localStorage.setItem(LS_RESULTS, JSON.stringify(results));
  }
  function loadPlayers() {
    try {
      return JSON.parse(localStorage.getItem(LS_PLAYERS)) || {};
    } catch {
      return {};
    }
  }
  function savePlayers(players) {
    localStorage.setItem(LS_PLAYERS, JSON.stringify(players));
  }

  function shuffle(array) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function parseQuery(path) {
    const qIndex = path.indexOf('?');
    const params = {};
    if (qIndex === -1) return params;
    for (const pair of path.slice(qIndex + 1).split('&')) {
      const [k, v] = pair.split('=');
      params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    }
    return params;
  }

  function route(path) {
    const qIndex = path.indexOf('?');
    return qIndex === -1 ? path : path.slice(0, qIndex);
  }

  // Find-or-create a player by name (case-insensitive), like POST /api/auth/play.
  function findOrCreatePlayer(name) {
    const players = loadPlayers();
    const key = name.toLowerCase();
    if (!players[key]) {
      players[key] = {
        _id: 'p' + Date.now().toString(36),
        name: name,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      savePlayers(players);
    }
    return players[key];
  }

  // Grade answers exactly like the backend: points per difficulty,
  // unanswered when the timer ran out (selected == null).
  function grade(category, difficulty, answers, timeTaken) {
    const byId = new Map(ARFUS_QUESTIONS.map((q) => [String(q._id), q]));
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    let score = 0;

    for (const a of answers) {
      const q = byId.get(String(a.questionId));
      if (!q) {
        unanswered += 1;
        continue;
      }
      if (a.selected == null || a.selected === '') {
        unanswered += 1;
      } else if (a.selected === q.correctAnswer) {
        correct += 1;
        score += POINTS[q.difficulty] || 0;
      } else {
        incorrect += 1;
      }
    }

    const totalQuestions = answers.length;
    return {
      correct,
      incorrect,
      unanswered,
      score,
      totalQuestions,
      percentage: totalQuestions ? Math.round((correct / totalQuestions) * 100) : 0,
    };
  }

  // ---------- the offline apiFetch (replaces common.js's version) ----------
  apiFetch = async function (path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const r = route(path);
    const body = options.body ? JSON.parse(options.body) : {};

    // POST /api/auth/play — { name } -> { user, token }
    if (r === '/auth/play' && method === 'POST') {
      const name = (body.name || '').trim();
      if (name.length < 2) throw new Error('Please tell us your name (at least 2 letters) 😊');
      const user = findOrCreatePlayer(name);
      return { user, token: 'offline-token' };
    }

    // GET /api/auth/me -> { user }
    if (r === '/auth/me') {
      const user = getUser();
      if (!user) throw new Error('Please enter your name again to keep playing 😊');
      return { user };
    }

    // GET /api/users/profile -> { user, stats, recent }
    if (r === '/users/profile') {
      const user = getUser();
      const mine = loadResults().filter((x) => x.userId === user._id);
      const quizzesPlayed = mine.length;
      return {
        user,
        stats: {
          quizzesPlayed,
          highestScore: mine.reduce((m, x) => Math.max(m, x.score), 0),
          averageScore: quizzesPlayed
            ? Math.round(mine.reduce((s, x) => s + x.percentage, 0) / quizzesPlayed)
            : 0,
          totalCorrect: mine.reduce((s, x) => s + x.correctAnswers, 0),
        },
        recent: mine
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(({ category, difficulty, score, percentage, createdAt }) => ({
            category,
            difficulty,
            score,
            percentage,
            createdAt,
          })),
      };
    }

    // GET /api/quiz/questions?category=..&difficulty=.. -> { count, questions }
    if (r === '/quiz/questions') {
      const q = parseQuery(path);
      if (!q.category) throw new Error('Pick a topic first! 🎨');
      let pool = ARFUS_QUESTIONS.filter((x) => x.category === q.category);
      if (q.difficulty && q.difficulty !== 'mixed') {
        pool = pool.filter((x) => x.difficulty === q.difficulty);
      }
      if (pool.length === 0) throw new Error('No questions found for this topic — try another! 🎲');
      const picked = shuffle(pool).slice(0, 10);
      return { count: picked.length, questions: picked };
    }

    // POST /api/quiz/result — grade, store, and return the result card data
    if (r === '/quiz/result' && method === 'POST') {
      const user = getUser();
      const g = grade(body.category, body.difficulty, body.answers || [], body.timeTaken || 0);
      const stored = {
        _id: 'r' + Date.now().toString(36),
        userId: user._id,
        playerName: user.name,
        category: body.category,
        difficulty: body.difficulty || 'mixed',
        score: g.score,
        totalQuestions: g.totalQuestions,
        correctAnswers: g.correct,
        incorrectAnswers: g.incorrect,
        unanswered: g.unanswered,
        percentage: g.percentage,
        timeTaken: body.timeTaken || 0,
        createdAt: new Date().toISOString(),
      };
      const all = loadResults();
      all.push(stored);
      saveResults(all);
      return {
        resultId: stored._id,
        score: stored.score,
        totalQuestions: stored.totalQuestions,
        correctAnswers: stored.correctAnswers,
        incorrectAnswers: stored.incorrectAnswers,
        unanswered: stored.unanswered,
        percentage: stored.percentage,
        timeTaken: stored.timeTaken,
      };
    }

    // GET /api/leaderboard — top 20 of all players on this device
    if (r === '/leaderboard') {
      return loadResults()
        .slice()
        .sort((a, b) => b.score - a.score || new Date(a.createdAt) - new Date(b.createdAt))
        .slice(0, 20)
        .map((x) => ({ ...x, user: { name: x.playerName } }));
    }

    // GET /api/users/history — this player's results, newest first
    if (r === '/users/history') {
      const user = getUser();
      return loadResults()
        .filter((x) => x.userId === user._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Admin routes need the real backend (question management, all users).
    if (
      r === '/users' ||
      r === '/quiz/results' ||
      r === '/questions' ||
      r.startsWith('/questions/')
    ) {
      throw new Error('The admin panel needs the backend — the game itself works offline 🛠️');
    }

    throw new Error('Offline mode does not support ' + path);
  };

  // ---------- fix: the dashboard's topic dropdown was never filled in ----------
  // (It used to say "Loading..." forever.) Fill it from the offline bank.
  const sel = document.getElementById('categorySelect');
  if (sel) {
    const cats = [...new Set(ARFUS_QUESTIONS.map((q) => q.category))].sort();
    sel.innerHTML = cats.map((c) => `<option value="${c}">${c}</option>`).join('');
  }

  console.log('📴 Offline mode ready —', ARFUS_QUESTIONS.length, 'questions on board.');
})();
