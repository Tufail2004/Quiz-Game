# Build Notes — Quiz Game

Learning notes written while building the project, section by section.

---

## 1. Backend (Node.js + Express + MongoDB)

### What was created
- `backend/package.json` — project manifest with dependencies (`express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`) and scripts: `npm start`, `npm run dev` (nodemon), `npm run seed`.
- `backend/.env.example` — template for secrets (`PORT`, `MONGO_URI`, `JWT_SECRET`). The real `.env` is git-ignored and never committed.
- `backend/server.js` — entry point: loads env vars, sets up Express + CORS + JSON parsing, connects to MongoDB, mounts all `/api/...` routers, adds 404 + central error handlers, then listens.
- `backend/config/db.js` — `connectDB()` opens the Mongoose connection; the app exits if it fails.
- `backend/models/` — three Mongoose schemas:
  - `User.js` — name, unique email, password (hashed in a pre-save hook with bcryptjs), role (`user`/`admin`). `toJSON` strips the password from every API response.
  - `Question.js` — question text, exactly 4 options (validated), `correctAnswer` (must match one option), category, difficulty (`easy`/`medium`/`hard`), explanation.
  - `QuizResult.js` — references the `User`, stores category, difficulty, score, correct/incorrect/unanswered counts, percentage, time taken.
- `backend/utils/generateToken.js` — signs a JWT containing only the user id.
- `backend/middleware/authMiddleware.js` (`protect`) — verifies the `Authorization: Bearer <token>` header and attaches `req.user`.
- `backend/middleware/adminMiddleware.js` (`admin`) — runs after `protect`; returns 403 unless `req.user.role === 'admin'`.
- `backend/controllers/` — the actual logic:
  - `authController.js` — register (validates fields, email format, min length, duplicate email → 400s), login (401 on bad credentials), me.
  - `questionController.js` — CRUD; non-admins never see `correctAnswer` on the generic question endpoints.
  - `quizController.js` — `GET /api/quiz/questions` uses MongoDB `$sample` to pick 10 random questions (no repeats possible); `POST /api/quiz/result` re-fetches the questions and grades server-side (easy=10, medium=20, hard=30 pts), then saves a `QuizResult`.
  - `userController.js` — profile aggregates (quizzes played, highest score, average %, total correct) + quiz history.
- `backend/routes/` — thin routers mapping URLs to controllers with the right middleware.
- `backend/seed/seed.js` — wipes the questions collection and inserts 50 questions (10 × JavaScript/HTML/CSS/Node.js/MongoDB, mixed difficulties). Run with `npm run seed`.

### Why it is structured this way
Routes only declare URLs + middleware; controllers hold the logic; models hold the data rules. This separation means you can change one layer (e.g. swap the database) without rewriting the others — the standard Express project layout employers expect.

### How it works (request lifecycle)
1. Frontend `fetch()`es e.g. `POST http://localhost:5000/api/auth/login` with JSON.
2. Express matches the route in `routes/`, runs middleware (`protect` checks the JWT), then the controller.
3. The controller talks to MongoDB through a Mongoose model and returns JSON (with proper status codes: 200/201/400/401/403/404/500).
4. The frontend stores the JWT in `localStorage` and sends it back on every protected call.

### How to test it
1. `cd backend && cp .env.example .env` and set `MONGO_URI` + `JWT_SECRET`.
2. `npm install && npm run dev`.
3. `npm run seed` to load questions.
4. `curl -X POST localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","password":"secret123"}'`
5. Copy the returned token and try `curl localhost:5000/api/quiz/questions?category=JavaScript -H "Authorization: Bearer <token>"`.

---

## 2. Seed data (`backend/seed/seed.js`)

### What was created
A script that wipes the `questions` collection and inserts **50 questions**: 10 each for
JavaScript, HTML, CSS, Node.js and MongoDB, each with 4 options, a `correctAnswer` (exact
option text), category, difficulty (mix of easy/medium/hard) and an explanation. Run with
`npm run seed` from `backend/`.

### Why
A quiz game with an empty database is untestable. The seed gives you instant playable
content and shows the exact document shape the app expects.

### How to test
`cd backend && npm run seed` → you should see "Seeded 50 questions successfully."
Check in MongoDB Compass or `db.questions.countDocuments()`.

---

## 3. Frontend (vanilla HTML/CSS/JS)

### What was created
- **Pages**: `index.html` (landing), `login.html`, `register.html`, `dashboard.html`
  (stats + category/difficulty picker + recent quizzes), `quiz.html` (timer, progress bar,
  question card, 4 answer buttons, explanation, Next button), `result.html` (score, counts,
  accuracy, time, Play Again / Choose Category / View Leaderboard), `leaderboard.html`,
  `history.html`, `admin.html` (tabbed panel: questions list, add/edit form, users, results).
- **`js/common.js`** — the shared core every page loads: `API_BASE` (backend URL,
  overridable via `localStorage`), JWT storage helpers, `apiFetch()` (attaches
  `Authorization: Bearer <token>`, redirects to login on 401), `requireAuth()` /
  `requireGuest()` page guards, the dark/light theme toggle (saved in `localStorage`),
  and `renderNav()` (user name, admin link, logout).
- **Page scripts** (`auth.js`, `dashboard.js`, `quiz.js`, `result.js`, `leaderboard.js`,
  `history.js`, `admin.js`) — one small file per page, each owning a single screen's logic.
- **`css/style.css`** — theme variables (`[data-theme="dark"]` default + light overrides),
  navbar, buttons, cards, forms, tables, dashboard stats, responsive breakpoints and subtle
  animations. **`css/auth.css`** — centered login/register cards. **`css/quiz.css`** —
  timer (pulses red under 10s), progress bar, answer buttons and the green/red feedback states.

### Why
No framework was used on purpose: with plain files you can see exactly how the browser
talks to the API. `common.js` keeps the repeated plumbing (auth headers, theme, nav) in
one place so page scripts stay short.

### How frontend ↔ backend communicate
Every dynamic page follows the same pattern:
1. `common.js` loads → theme + navbar set up.
2. Page script calls `requireAuth()` if the page needs login.
3. It calls `apiFetch('/some/endpoint', { method, body })` → JSON from Express.
4. It renders the JSON into the DOM (e.g. quiz questions → answer buttons).

Example — starting a quiz: `dashboard.html` → `quiz.html?category=JavaScript&difficulty=easy`
→ `quiz.js` fetches `GET /api/quiz/questions?...` → renders questions one by one with a
30s timer → on finish, `POST /api/quiz/result` with the answers → the **server** grades
using the database's correct answers (so scores can't be faked) → result saved in
`sessionStorage` → `result.html` displays it.

### How to test it
1. Backend running + seeded (`npm run dev`, `npm run seed`).
2. Serve `frontend/` (e.g. VS Code Live Server) and open `index.html`.
3. Register → you land on the dashboard with zeroed stats.
4. Pick JavaScript / Mixed → Start Quiz → answer, let one timer expire, finish.
5. Result page shows the breakdown; leaderboard and history update.
6. Toggle the theme button (🌙/☀️), resize the browser to mobile width, reload —
   the theme and layout should persist/adapt.
