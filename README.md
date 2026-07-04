<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
</p>

# 🎬 CFlix Backend — RESTful API Server

> Backend API cho nền tảng xem phim trực tuyến **CFlix**, xây dựng trên Node.js/Express với kiến trúc phân lớp, real-time qua Socket.IO và tích hợp AI Chatbot.

---

## 📑 Mục lục

- [Tổng quan](#-tổng-quan)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cài đặt & Chạy](#-cài-đặt--chạy)
- [Biến môi trường](#-biến-môi-trường)
- [API Endpoints](#-api-endpoints)
- [WebSocket Events](#-websocket-events)
- [Scripts](#-scripts)

---

## 🌟 Tổng quan

CFlix Backend cung cấp đầy đủ API cho nền tảng xem phim:

- **Xác thực** — Email + Google OAuth 2.0, JWT, quên mật khẩu
- **Người dùng** — Hồ sơ, yêu thích, lịch sử xem, phân quyền admin
- **Bình luận** — CRUD comment real-time qua Socket.IO
- **Đánh giá** — Rating phim 1–10 sao
- **Slider** — CRUD banner trang chủ (admin)
- **Trending** — Thống kê lượt xem, danh sách trending
- **AI Chatbot** — Tích hợp Google Gemini & Groq AI gợi ý phim
- **Thông báo** — Notification real-time
- **Báo cáo** — Người dùng báo cáo phim lỗi/vi phạm
- **Traffic** — Thống kê truy cập hàng ngày
- **Chặn phim** — Quản lý blacklist phim (admin)

---

## 🏛 Kiến trúc hệ thống

Mô hình **3-Layer Architecture**:

```
Client Request
      │
      ▼
┌─────────────┐
│   Routes    │  ← Endpoints + Middleware
└──────┬──────┘
       ▼
┌─────────────┐
│ Controllers │  ← Request/Response handling
└──────┬──────┘
       ▼
┌─────────────┐
│  Services   │  ← Business logic + DB queries
└──────┬──────┘
       ▼
┌─────────────┐
│   Models    │  ← MongoDB schema + data access
└─────────────┘
```

---

## 🛠 Công nghệ sử dụng

| Công nghệ | Mô tả |
|---|---|
| **Node.js** ≥ 18 | Runtime JavaScript |
| **Express.js** 4.x | Web framework |
| **MongoDB** Native Driver 7.x | NoSQL Database (Atlas) |
| **Socket.IO** 4.x | Real-time WebSocket |
| **JWT** + **bcryptjs** | Auth & mã hoá password |
| **Joi** | Validate dữ liệu |
| **Google Auth Library** | Google OAuth 2.0 |
| **Google Generative AI** | Gemini AI Chatbot |
| **Groq SDK** | Groq AI |
| **Nodemailer** | Gửi email |
| **Babel** + **Nodemon** | Transpile ES Modules + Hot-reload |
| **express-rate-limit** | Chống DDoS/brute-force |

---

## 📂 Cấu trúc thư mục

```
backend/
├── .babelrc                  # Babel config (preset-env, module-resolver)
├── .env                      # Biến môi trường (không commit)
├── jsconfig.json             # Alias path (~/ → ./src/)
├── package.json
└── src/
    ├── server.js             # Entry point
    ├── config/
    │   ├── environment.js    # Export biến môi trường
    │   ├── mongodb.js        # Kết nối MongoDB Atlas
    │   └── cors.js           # Cấu hình CORS
    ├── routes/v1/
    │   ├── index.js          # Mount tất cả sub-routes
    │   ├── authRoute.js      # /v1/auth
    │   ├── userRoute.js      # /v1/user
    │   ├── commentRoute.js   # /v1/comment
    │   ├── ratingRoute.js    # /v1/rating
    │   ├── viewsRoute.js     # /v1/trending
    │   ├── sliderRoute.js    # /v1/slider
    │   ├── notificationRoute.js
    │   ├── chatbotRoute.js   # /v1/chatbot
    │   ├── reportRoute.js    # /v1/report
    │   ├── trafficRoute.js   # /v1/traffic
    │   └── blockedMovieRoute.js
    ├── controllers/          # Xử lý request/response
    ├── services/             # Business logic
    ├── models/               # MongoDB schema & data access
    ├── middlewares/
    │   ├── authMiddleware.js     # JWT verification
    │   └── rateLimitMiddleware.js
    ├── validations/
    │   └── authValidations.js    # Joi schema
    └── utils/
        └── email.js              # Email utility
```

---

## 🚀 Cài đặt & Chạy

### Yêu cầu

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB Atlas** account (hoặc MongoDB local)

### Cài đặt

```bash
# 1. Clone repository
git clone <repository-url>
cd cflix-v2/backend

# 2. Cài đặt dependencies
npm install

# 3. Tạo file .env (xem mục bên dưới)
cp .env.example .env
# Điền đầy đủ thông tin vào .env

# 4. Chạy development server
npm run dev
```

Server chạy tại: **http://localhost:5001**

---

## 🔐 Biến môi trường

Tạo file `.env` tại thư mục gốc `backend/`:

```env
# ─── Database ───────────────────────────
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/
DATABASE_NAME=cflixDb

# ─── Server ─────────────────────────────
APP_HOST=localhost
APP_PORT=5001
CLIENT_URL=http://localhost:5000

# ─── Authentication ─────────────────────
GOOGLE_CLIENT_ID=<your-google-client-id>
JWT_SECRET=<your-jwt-secret>

# ─── Email (SMTP) ───────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASS=<your-smtp-password>

# ─── AI Services ────────────────────────
GEMINI_API_KEY=<your-gemini-key>
GROQ_API_KEY=<your-groq-key>

# ─── Misc ───────────────────────────────
RESEND_API_KEY=<your-resend-key>
```

> ⚠️ File `.env` đã nằm trong `.gitignore`. Không commit file này lên repository.

---

## 📡 API Endpoints

Prefix chung: `/v1`

| Module | Prefix | Chức năng chính |
|---|---|---|
| **Auth** | `/v1/auth` | Đăng ký, đăng nhập, Google OAuth, quên mật khẩu, đăng xuất |
| **User** | `/v1/user` | Profile, favorites, history, quản lý user (admin) |
| **Slider** | `/v1/slider` | CRUD banner trang chủ |
| **Comment** | `/v1/comment` | Bình luận theo slug phim (real-time) |
| **Rating** | `/v1/rating` | Đánh giá phim |
| **Trending** | `/v1/trending` | Lượt xem, danh sách trending |
| **Notification** | `/v1/notifications` | Thông báo real-time |
| **Chatbot** | `/v1/chatbot` | AI chatbot gợi ý phim |
| **Report** | `/v1/report` | Báo cáo phim lỗi |
| **Traffic** | `/v1/traffic` | Thống kê truy cập |
| **Blocked Movie** | `/v1/movie` | Chặn/bỏ chặn phim (admin) |

### Xác thực & Phân quyền

- **JWT** lưu trong HTTP-Only Cookie
- **Auth Middleware** kiểm tra token hợp lệ
- **Role-based** phân quyền `user` / `admin`
- **Rate Limiting** chống brute-force

---

## 🔌 WebSocket Events

| Event | Hướng | Mô tả |
|---|---|---|
| `connection` | Client → Server | Kết nối mới |
| `disconnect` | Client → Server | Ngắt kết nối |
| `join_room` | Client → Server | Tham gia room theo slug phim |
| `join_user_room` | Client → Server | Tham gia room cá nhân |
| `req_online_users` | Client → Server | Yêu cầu số người online |
| `online_users` | Server → Client | Broadcast số người online |

---

## 📜 Scripts

| Script | Mô tả |
|---|---|
| `npm run dev` | Dev server (Nodemon + Babel) |
| `npm run build` | Build production (→ `build/`) |
| `npm run production` | Build + chạy production |
| `npm run lint` | Kiểm tra ESLint |
| `npm run clean` | Xoá thư mục `build/` |

---

<p align="center">
  <sub>Built with ❤️ by C0bra — CFlix Backend v1.0.0</sub>
</p>
