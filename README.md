# 🎯 QuizGame — Full-Stack Quiz Game

A complete, modern, responsive **full-stack quiz game** built as a final-year portfolio project.
Players register, pick a category and difficulty, race a 30-second timer, climb a global
leaderboard and track their progress on a personal dashboard. Admins manage questions,
users and results from a built-in admin panel.

## ✨ Features

- **User authentication** — register, login, logout with bcrypt password hashing + JWT
- **Quiz game** — 10 random questions per session (no repeats), 30s countdown per question
- **Difficulty levels** — Easy (10 pts), Medium (20 pts), Hard (30 pts), or Mixed
- **Answer feedback** — options lock, correct/wrong highlighting, explanations, Next button
- **Result page** — score, correct/incorrect/unanswered counts, accuracy %, time taken
- **Global leaderboard** — top 20 scores of all time with player names
- **User dashboard** — quizzes played, highest score, average %, total correct, recent quizzes
- **Quiz history** — every completed quiz, newest first
- **Admin panel** — add/edit/delete questions, view users, view all results, manage categories
- **Dark / light mode** — toggle saved in localStorage
- **Responsive design** — flexbox/grid + media queries, mobile-optimized quiz UI
- **Seed data** — 50 questions across JavaScript, HTML, CSS, Node.js, MongoDB

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | HTML5, CSS3, JavaScript (ES6+), Fetch API |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB, Mongoose                   |
| Auth       | bcryptjs (hashing), jsonwebtoken (JWT) |
| Tooling    | npm, nodemon, dotenv, CORS          |

## 📸 Screenshots

> Add your screenshots here, e.g.:
>
> - `docs/screenshots/landing.png` — landing page
> - `docs/screenshots/quiz.png` — quiz in progress
> - `docs/screenshots/results.png` — result page
> - `docs/screenshots/dashboard.png` — dashboard

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB running locally **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone the repo
```bash
git clone https://github.com/Tufail2004/Quiz-Game.git
cd Quiz-Game
```

### 2. Set up the backend
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/quiz-game
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

> For MongoDB Atlas, use your cluster connection string, e.g.
> `MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/quiz-game`

### 3. Load the seed questions
```bash
npm run seed
```
This inserts 50 questions (10 each for JavaScript, HTML, CSS, Node.js, MongoDB).

### 4. Start the backend
```bash
npm run dev    # development (auto-restarts with nodemon)
# or
npm start      # production
```
The API runs at `http://localhost:5000`.

### 5. Run the frontend
The frontend is plain HTML/CSS/JS — serve the `frontend/` folder with any static server:

```bash
# option A: VS Code Live Server extension — right-click frontend/index.html → "Open with Live Server"
# option B: from the repo root
npx serve frontend
# option C: python
cd frontend && python3 -m http.server 8080
```

Then open `http://localhost:8080` (or your Live Server URL) in the browser.

> The frontend talks to the backend at `http://localhost:5000/api` by default.
> To point it elsewhere, set `localStorage.setItem('quizApiBase', 'https://your-api/api')`
> in the browser console once.

### 👑 Creating an admin user
1. Register normally through the UI.
2. In MongoDB, set the user's role:
   ```js
   db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
   ```
   (In Compass: open the `users` collection → edit the document → set `role` to `"admin"`.)
3. Log out and log back in — an **Admin** link appears in the navbar.

## 📡 API Documentation

Base URL: `http://localhost:5000/api`

### Authentication
| Method | Endpoint          | Auth   | Description                          |
|--------|-------------------|--------|--------------------------------------|
| POST   | `/auth/register`  | —      | Register `{name, email, password}` → `{user, token}` |
| POST   | `/auth/login`     | —      | Login `{email, password}` → `{user, token}` |
| GET    | `/auth/me`        | Bearer | Get the current user                 |

### Questions
| Method | Endpoint            | Auth        | Description                          |
|--------|---------------------|-------------|--------------------------------------|
| GET    | `/questions`        | Bearer      | List (filter `?category=&difficulty=`; answers hidden from non-admins) |
| GET    | `/questions/:id`    | Bearer      | Get one question                     |
| POST   | `/questions`        | Admin       | Create a question                    |
| PUT    | `/questions/:id`    | Admin       | Update a question                    |
| DELETE | `/questions/:id`    | Admin       | Delete a question                    |

### Quiz
| Method | Endpoint                        | Auth    | Description                              |
|--------|---------------------------------|---------|------------------------------------------|
| GET    | `/quiz/questions?category=&difficulty=` | — | 10 random questions, no repeats          |
| POST   | `/quiz/result`                  | Bearer  | Submit answers → graded + stored result  |
| GET    | `/quiz/results`                 | Admin   | All results, newest first                |

### Leaderboard & Users
| Method | Endpoint            | Auth    | Description                              |
|--------|---------------------|---------|------------------------------------------|
| GET    | `/leaderboard`      | —       | Top 20 scores with player names          |
| GET    | `/users`            | Admin   | List all users                           |
| GET    | `/users/profile`    | Bearer  | User + stats (played, highest, avg, correct) + recent |
| GET    | `/users/history`    | Bearer  | The user's full quiz history             |

Protected routes send the JWT as `Authorization: Bearer <token>`.

## 🗂️ Folder Structure

```
quiz-game/
├── frontend/
│   ├── index.html        # landing page
│   ├── login.html / register.html
│   ├── dashboard.html    # stats + start quiz
│   ├── quiz.html         # game UI (timer, options, feedback)
│   ├── result.html       # score summary
│   ├── leaderboard.html / history.html
│   ├── admin.html        # admin panel
│   ├── css/  (style.css, auth.css, quiz.css)
│   └── js/   (common.js, auth.js, dashboard.js, quiz.js,
│              result.js, leaderboard.js, history.js, admin.js)
├── backend/
│   ├── server.js         # Express app entry point
│   ├── package.json      # deps + scripts (start/dev/seed)
│   ├── .env.example      # env template (real .env is git-ignored)
│   ├── config/db.js      # MongoDB connection
│   ├── models/           # User, Question, QuizResult (Mongoose)
│   ├── controllers/      # auth, question, quiz, user logic
│   ├── routes/           # auth, question, quiz, user, leaderboard
│   ├── middleware/       # protect (JWT), admin (role check)
│   ├── utils/generateToken.js
│   └── seed/seed.js      # 50 starter questions
├── BUILD_NOTES.md        # step-by-step learning notes
└── README.md
```

## 🔮 Future Improvements
- Per-question server-side answer verification endpoint
- Timed multiplayer / head-to-head mode
- Question images and code-snippet rendering
- Password reset via email
- OAuth login (Google/GitHub)
- Pagination + search on the admin question list
- Docker setup for one-command deployment

## 📄 License
MIT — free to use for learning and portfolios.
