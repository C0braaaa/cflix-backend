<div align="center">
  <img src="https://nodejs.org/static/images/logo.svg" alt="Node.js Logo" width="200" />
  <h1>CFLIX Backend API</h1>

  <p>
    A scalable Node.js/Express REST API powering a video‑streaming service with user
    management, playlists, ratings, comments, real-time notifications and AI integration.
  </p>

  <div>
    <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-45a248?logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/express-4.x-lightgrey?logo=express&logoColor=black" alt="Express" />
    <img src="https://img.shields.io/badge/mongodb-7.x-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/socket.io-4.x-010101?logo=socket.io&logoColor=white" alt="Socket.io" />
    <img src="https://img.shields.io/badge/babel-7.x-F9DC3E?logo=babel&logoColor=black" alt="Babel" />
  </div>
</div>

---

## 📖 Introduction

This repository contains the **backend** services of the **CFLIX** project – a RESTful API designed for a movie/entertainment platform. 

It handles core logics ranging from authentication, user behavior tracking (favorites, history), community interactions (comments, ratings), real‑time notifications via Socket.IO, to an integrated AI chatbot using Google Gemini. The codebase is written in modern ECMAScript, transpiled with Babel for robust compatibility, and targets Node.js 18+.

## ✨ Key Features

- **🔐 Authentication**: Robust JWT-based auth, password hashing with `bcryptjs`, and Google OAuth integration.
- **🙋‍♂️ User Management**: Profiles, watch history (continue watching), playlists, and favorites.
- **💬 Social Interaction**: Nestable comments, rating systems (like/dislike), and content reporting.
- **🔔 Realtime System**: Instant notifications and live comment updates powered by `socket.io`.
- **🤖 AI Integration**: Integrated movie-recommendation chatbot using `Google Gemini` / `Groq` SDKs.
- **🛡️ Security & Validation**: Data validation with `Joi`, rate limiting, and CORS configuration.

## 🛠️ Tech Stack 

- **Runtime**: Node.js (≥18)
- **Framework**: Express.js
- **Database**: MongoDB (Official native driver)
- **Real-time**: Socket.IO
- **Validation**: Joi
- **Security & Auth**: JWT, bcryptjs, google-auth-library, express-rate-limit
- **Mailing**: Nodemailer
- **AI Tooling**: @google/generative-ai, groq-sdk
- **Build & Dev**: Babel (ESM support), Nodemon, ESLint

## 📂 Project Structure

```text
src/
├── config/              # Environment vars, database connections, CORS
├── controllers/         # Request handlers grouped by feature domains
├── middlewares/         # Auth verification, error handling, rate limits
├── models/              # MongoDB schema and query layers
├── routes/              # API Route definitions (v1)
├── services/            # Core business logic
├── sockets/             # Socket.IO event registrations and handlers
├── utils/               # Helper utilities (Mailer, formatters)
├── validations/         # Joi validation schemas
└── server.js            # Express application entry point
```

## 🚀 Getting Started

Follow these instructions to set up the backend on your local machine.

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: A running local instance or MongoDB Atlas cluster

### 1. Clone the repository

```bash
git clone https://github.com/your-username/cflix-backend.git
cd cflix-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Duplicate the `.env.example` file (if available) or create a new `.env` file at the root:

```env
# Application configs
APP_HOST=0.0.0.0
APP_PORT=5001
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net
DATABASE_NAME=cflix

# Authentication
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id

# Mailer (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# AI Chatbot
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the Server

**Development Mode (Live Reload):**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm run production
```

---

## 🔌 API Endpoints Reference

All routes are mounted under `/v1` by default. Below is a quick overview of primary domains:

| Method | Endpoint | Auth Required | Description |
| :---: | --- | :---: | --- |
| `POST` | `/v1/auth/register` | ❌ | Create a new user account |
| `POST` | `/v1/auth/login` | ❌ | Authenticate and receive JWT cookie |
| `POST` | `/v1/auth/login-google`| ❌ | Google OAuth login |
| `GET` | `/v1/user/me` | ✅ | Fetch logged-in user profile |
| `PUT` | `/v1/user/update` | ✅ | Update profile information |
| `POST` | `/v1/user/favorite` | ✅ | Toggle movie in favorites list |
| `POST` | `/v1/comment/add` | ✅ | Add a root comment or reply |
| `GET` | `/v1/comment/:slug` | ❌ | Retrieve comments for a movie |
| `POST` | `/v1/chatbot` | ❌ | Interact with the AI assistant |

*(Please check the `src/routes/v1` directory for the exhaustive list of endpoints).*

## 📦 Available Scripts

- `npm run dev`: Starts the application in development mode using `nodemon` and `babel-node`.
- `npm run build`: Cleans the build directory and transpiles the code using Babel.
- `npm run production`: Runs the transpiled code from the `build` directory.
- `npm run lint`: Checks for coding standard violations using ESLint.

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Make sure tests/linters pass (`npm run lint`)
5. Push to the Branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## 👨‍💻 Author

**Hieu C0bra Dev**
- GitHub: [@C0braaaa](https://github.com/C0braaaa)
