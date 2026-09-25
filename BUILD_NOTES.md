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
