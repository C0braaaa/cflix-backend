<div align="center">
  <img src="https://nodejs.org/static/images/logo.svg" alt="Node.js Logo" width="180" />
  <h1>🚀 CFLIX Core Services (Backend API)</h1>

  <p align="center">
    <strong>A highly scalable, real-time Node.js/Express REST API powering the CFLIX streaming ecosystem.</strong>
  </p>

  <p align="center">
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/Node.js-18.x-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" /></a>
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/Express.js-4.x-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express" /></a>
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/MongoDB-7.x-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" /></a>
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/JWT-Secure-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" /></a>
  </p>
</div>

<br />

## 📖 System Overview

Welcome to the **CFLIX Backend Architecture**. This repository serves as the central nervous system for the CFLIX streaming platform. Engineered for high performance and scalability, this RESTful API handles everything from secure user authentication to complex data aggregations and real-time bidirectional communication.

Our architecture is built on a modern **Node.js/Express** foundation, utilizing **MongoDB** for flexible data storage and **Socket.io** for real-time interactions, ensuring a seamless and engaging experience for users worldwide.

---

## ✨ Enterprise-Grade Features

*   **🔐 Robust Security & Auth Engine:**
    *   State-of-the-art JWT (JSON Web Token) authentication strategy.
    *   Secure password hashing utilizing `bcryptjs`.
    *   Seamless Single Sign-On (SSO) via **Google OAuth 2.0**.
    *   Rate limiting and advanced CORS protection to prevent DDoS and XSS attacks.
*   **📡 Real-Time Communication Hub:**
    *   Powered by `Socket.io` for instantaneous data delivery.
    *   Live commenting systems with typing indicators.
    *   Instant push notifications for user interactions and system alerts.
*   **🧠 AI-Powered Insights:**
    *   Deep integration with **Google Gemini** & **Groq SDKs**.
    *   Intelligent chatbot for personalized movie recommendations and user support.
*   **🏗️ Advanced Data Management:**
    *   Complex MongoDB aggregations for content ranking and analytics.
    *   Comprehensive user profiles: watch history tracking, custom playlists, and unified favorites management.
    *   Hierarchical/Nestable comment threads with granular rating systems (likes/dislikes).

---

## 🏗️ Architecture & Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Runtime Environment** | **Node.js (v18+)** | High-performance, event-driven JavaScript runtime. |
| **Web Framework** | **Express.js** | Fast, unopinionated, minimalist web framework. |
| **Database & ORM** | **MongoDB & Mongoose** | NoSQL database for flexible schema design and fast querying. |
| **Real-Time Engine** | **Socket.IO** | Bi-directional communication between web clients and servers. |
| **Data Validation** | **Joi** | Powerful schema description language and data validator. |
| **Security Suite** | **JWT, bcryptjs, Helmet** | Comprehensive security mechanisms and encryption. |
| **AI Integration** | **@google/generative-ai** | Generative AI models for enhanced user experiences. |

---

## 📂 Codebase Anatomy

We enforce a strict separation of concerns following the MVC (Model-View-Controller) architectural pattern adapted for API design:

```text
cflix-backend/
├── src/
│   ├── config/          # Environment configuration, DB connections & third-party setup
│   ├── controllers/     # Application logic and request/response handling
│   ├── middlewares/     # Custom pipeline steps (Auth, Error handling, Rate Limits)
│   ├── models/          # MongoDB Mongoose schemas and data access layer
│   ├── routes/          # RESTful API route definitions (v1)
│   ├── services/        # Heavy lifting and core business logic
│   ├── sockets/         # WebSocket event listeners and emitters
│   ├── utils/           # Shared utilities (Nodemailer, token generators, formatters)
│   ├── validations/     # Joi validation schemas for strict payload checking
│   └── server.js        # Application bootstrap and entry point
├── .env.example         # Template for environment variables
└── package.json         # Dependency management and script definitions
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites

Ensure your development environment meets the following requirements:
*   **Node.js**: `v18.0.0` or higher
*   **MongoDB**: Local instance running on port `27017` or a MongoDB Atlas URI.
*   **Package Manager**: `npm`, `yarn`, or `pnpm`.

### 2. Installation

Clone the repository and install the necessary dependencies:

```bash
git clone https://github.com/C0braaaa/cflix-backend.git
cd cflix-backend
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure your local variables:

```bash
cp .env.example .env
```

*Update `.env` with your specific credentials:*

```env
# Server Configuration
APP_HOST=0.0.0.0
APP_PORT=5001
CLIENT_URL=http://localhost:5173

# Database Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net
DATABASE_NAME=cflix_production

# Security & Authentication
JWT_SECRET=generate_a_strong_random_string_here
GOOGLE_CLIENT_ID=your_google_cloud_oauth_client_id

# Mail Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Artificial Intelligence Integrations
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Launching the Server

**For Local Development (with Hot Reload):**
```bash
npm run dev
```

**For Production Deployment:**
```bash
npm run build
npm run production
```

---

## 📡 Core API Endpoints Reference

> **Base URL:** `/v1`

### Authentication & Identity
| Method | Endpoint | Access | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/auth/register` | Public | Register a new user account |
| `POST` | `/auth/login` | Public | Authenticate and issue JWT |
| `POST` | `/auth/login-google` | Public | Authenticate via Google SSO |

### User Domain
| Method | Endpoint | Access | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/user/me` | **Private** | Retrieve active user profile |
| `PUT` | `/user/update` | **Private** | Modify user preferences and data |
| `POST` | `/user/favorite` | **Private** | Toggle content in favorites list |

### Social & Interaction
| Method | Endpoint | Access | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/comment/add` | **Private** | Create a new comment or reply thread |
| `GET` | `/comment/:slug` | Public | Fetch comment tree for specific content |
| `POST` | `/chatbot` | Public | Dispatch query to AI recommendation engine |

*Refer to the Postman collection (if available) or the `/routes` directory for the exhaustive API documentation.*

---

## 👨‍💻 Author & Maintainer

Designed and engineered by **Hieu C0bra Dev**.

*   **GitHub:** [@C0braaaa](https://github.com/C0braaaa)
