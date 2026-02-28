<h1 align="center">🎬 cflix‑v2 backend</h1>

<div align="center">
  A scalable Node.js/Express REST API powering a video‑streaming service with user
  management, playlists, ratings, comments, notifications and more.
</div>

---

## 🏷️ Badges

![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![Express](https://img.shields.io/badge/express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/mongodb-7.x-%2345a248)
![Babel](https://img.shields.io/badge/babel-7.x-yellow)
![Socket.IO](https://img.shields.io/badge/socket.io-4.x-black)
![Joi](https://img.shields.io/badge/joi-validation-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🚀 Introduction

This repository contains the **backend** of the `cflix` project – a RESTful API
designed for a streaming/entertainment platform. It handles everything from
authentication and user profiles to real‑time notifications and analytics via
Socket.IO. The codebase is written in modern JavaScript, transpiled with Babel
for compatibility, and targets Node 18+.

---

## 🛠 Tech Stack

- **Runtime:** Node.js (≥18)
- **Framework:** Express
- **Database:** MongoDB (official driver)
- **Realtime:** Socket.IO
- **Validation:** Joi
- **Authentication:** JWT, bcryptjs, Google OAuth
- **Env management:** dotenv
- **Email:** nodemailer
- **Rate limiting:** express-rate-limit
- **Build:** Babel (ESM support)
- **Dev tooling:** Nodemon, ESLint

---

## 📂 Project Structure

```
src/
  server.js                 # entry point
  config/
    environment.js          # load .env and expose env vars
    cors.js
    mongodb.js
  controllers/              # request handlers grouped by feature
  services/                 # business logic
  models/                   # MongoDB schemas
  routes/
    v1/                     # versioned API routes
    v2/                     # workspace for future versions
  middlewares/              # authentication, rate‑limit, etc.
  validations/              # Joi schemas
  utils/                    # helpers (email, etc.)
  sockets/                  # socket.io event wiring
```

Each sub‑folder roughly corresponds to a domain (auth, user, comment, etc.).
Files follow a clear _controller → service → model_ pattern.

---

## ⚙️ Installation Guide

1. **Clone & cd**

   ```bash
   git clone <repo-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment**

   Copy `.env.example` to `.env` and fill in values (see table below).

4. **Run in development**

   ```bash
   npm run dev
   ```

   This uses `nodemon` + `babel-node` for hot reload.

5. **Build for production**

   ```bash
   npm run build
   npm run production
   ```

---

## 🔑 Environment Variables

| Variable           | Description                         | Example                 |
| ------------------ | ----------------------------------- | ----------------------- |
| `MONGODB_URI`      | Connection string to MongoDB        | `mongodb://localhost`   |
| `DATABASE_NAME`    | MongoDB database name               | `cflix`                 |
| `APP_HOST`         | Host for the server                 | `0.0.0.0`               |
| `APP_PORT`         | Port for the server                 | `3000`                  |
| `JWT_SECRET`       | Secret key for signing JWTs         | `supersecret`           |
| `CLIENT_URL`       | Frontend origin (CORS, cookies)     | `http://localhost:8080` |
| `GOOGLE_CLIENT_ID` | OAuth client ID for Google login    |                         |
| `SMTP_HOST`        | Outgoing mail server host           |                         |
| `SMTP_PORT`        | Outgoing mail server port           |                         |
| `SMTP_USER`        | SMTP username                       |                         |
| `SMTP_PASS`        | SMTP password                       |                         |
| `GEMINI_API_KEY`   | API key for Google Gemini (chatbot) |                         |

> _Tip:_ Use a `.env.local` file or secret manager in production.

---

## 🔌 API Endpoints

All routes are mounted under `/api/v1` by default. Below is a non‑exhaustive
reference; consult the route files in `src/routes/v1` for updates.

| Method | Path                        | Auth | Description                      |
| ------ | --------------------------- | :--: | -------------------------------- |
| POST   | `/auth/login`               |  ❌  | user login, returns cookie       |
| POST   | `/auth/register`            |  ❌  | create new account               |
| POST   | `/auth/login-google`        |  ❌  | Google OAuth login               |
| POST   | `/auth/logout`              |  ✅  | clear access cookie              |
| POST   | `/auth/forgot-password`     |  ❌  | send reset email                 |
| POST   | `/auth/reset-password`      |  ❌  | reset password using token       |
| PUT    | `/auth/change-password`     |  ✅  | change logged‑in user’s password |
| PUT    | `/users/update`             |  ✅  | update own profile               |
| GET    | `/users/me`                 |  ✅  | get logged‑in user               |
| GET    | `/users/all-users`          |  ✅  | admin: list all users            |
| PUT    | `/users/admin/update/:id`   |  ✅  | admin: edit other user           |
| DELETE | `/users/user/:id`           |  ✅  | admin: delete user               |
| POST   | `/users/favorite`           |  ✅  | toggle favorite item             |
| GET    | `/users/favorite`           |  ✅  | list favorites                   |
| POST   | `/users/playlist`           |  ✅  | toggle playlist item             |
| GET    | `/users/playlist`           |  ✅  | get playlist                     |
| POST   | `/users/continue-watching`  |  ✅  | save watch progress              |
| DELETE | `/users/continue-watching`  |  ✅  | remove watch progress            |
| GET    | `/users/check-status/:slug` |  ✅  | video status (fav/playlist/etc.) |
| GET    | `/users/progress/:slug`     |  ✅  | retrieve progress                |
| POST   | `/views`                    |  ❌  | increment view counter           |
| GET    | `/views`                    |  ❌  | top viewed items                 |

Other controllers (comments, ratings, notifications, reports, traffic,
sliders, chatbot) follow the same pattern; see `src/routes/v1/*Route.js`.

> **Example request**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'
```

> **Example response**

```json
{
  "status": true,
  "msg": "Login successfully",
  "user": { "email": "user@example.com", "_id": "..." }
}
```

---

## 📸 Screenshots

_No frontend included._
⏳ _Add screenshots here once the UI is available._

---

## 🚀 Deployment

This project currently has no Dockerfile. Typical deployment steps:

1. Build assets: `npm run build`
2. Set environment variables on server/host.
3. Run with `node build/src/server.js` (or use a process manager like PM2).
4. Ensure MongoDB is reachable and CORS `CLIENT_URL` is configured.

For containerization, create a simple `Dockerfile` using Node 18 base image
and copy the build output.

---

## 🤝 Contributing

1. Fork repository.
2. Create feature branch: `git checkout -b feature/your-idea`.
3. Commit changes with clear messages.
4. Open a pull request describing your improvement.
5. Ensure `npm run lint` passes.

Please follow the existing code style (ESLint + Babel).

---

## 📜 License

This project is licensed under the **MIT License** – see `LICENSE` for details.

---

## 👨‍💻 Author

**HieuC0raDev**
–– Building modern full‑stack applications.
Feel free to connect on GitHub!
