# 📺 YouTube Clone — Full Stack Project

A full-featured YouTube-inspired video platform built with **React** on the frontend and **Node.js + Express + MongoDB** on the backend. Users can register, create channels, upload video links, browse/search/filter content, like/dislike videos, and leave comments.

---

## 🗂️ Project Structure

```
youtube_clone_final_project/
├── frontend/                  ← React + Vite SPA
│   └── src/
│       ├── components/        ← Reusable UI (Header, Sidebar, VideoCard)
│       ├── pages/             ← Route-level views (Home, VideoPlayer, Channel, Login, Register)
│       ├── context/           ← Global auth state (AuthContext)
│       └── utils/             ← Axios API instance
│
└── backend/                   ← Node.js REST API
    └── src/
        ├── models/            ← Mongoose schemas (User, Video, Channel)
        ├── routes/            ← Express routers (auth, videos, channels, comments)
        └── middleware/        ← JWT auth guard
```

---

## 🔧 Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, React Router v6, Vite, Axios  |
| Backend    | Node.js, Express 5, Mongoose            |
| Database   | MongoDB (via Mongoose ODM)              |
| Auth       | JWT (jsonwebtoken) + bcryptjs           |
| Dev Tools  | Nodemon, Vite HMR                       |

---

## 🖥️ Frontend Pages & Components

```
┌──────────────────────────────────────────────────────────────┐
│                        App.jsx (Root)                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                     AuthProvider                        │ │
│  │  ┌───────────────────────────────────────────────────┐  │ │
│  │  │                 BrowserRouter                     │  │ │
│  │  │                                                   │  │ │
│  │  │  Route "/"          →  Layout > Home              │  │ │
│  │  │  Route "/video/:id" →  Layout > VideoPlayer       │  │ │
│  │  │  Route "/channel/my"→  Layout > Channel           │  │ │
│  │  │  Route "/login"     →  Login  (no layout)         │  │ │
│  │  │  Route "/register"  →  Register (no layout)       │  │ │
│  │  └───────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

Layout Wrapper (shared across main pages):
┌──────────────────────────────────────────────────────────────┐
│  Header  ← search bar, sidebar toggle, auth buttons         │
├────────────────────────────────────────────────────────────  │
│ Sidebar │             <Page Content>                         │
│  (open  │   e.g. Home, VideoPlayer, or Channel              │
│   or    │                                                    │
│ closed) │                                                    │
└─────────┴──────────────────────────────────────────────────-─┘
```

### Components

| Component    | Description                                                        |
|--------------|--------------------------------------------------------------------|
| `Header`     | Top navigation bar with logo, search input, sidebar toggle, login/logout |
| `Sidebar`    | Left nav with category links; collapsible                         |
| `VideoCard`  | Thumbnail card shown in the video grid (title, views, channel)    |

### Pages

| Page          | Description                                                         |
|---------------|---------------------------------------------------------------------|
| `Home`        | Video grid with category filter chips and search results            |
| `VideoPlayer` | Embedded video, like/dislike, comment section                       |
| `Channel`     | User's own channel — create channel, upload/edit/delete videos      |
| `Login`       | Email + password login form                                         |
| `Register`    | Username, email, password registration form                         |

---

## 🗄️ Database Models

### User
```
User {
  username   : String  (unique, min 3 chars)
  email      : String  (unique, validated)
  password   : String  (hashed with bcrypt, min 6 chars)
  avatar     : String  (URL, optional)
  channels   : [ObjectId → Channel]
  timestamps : createdAt, updatedAt
}
```

### Channel
```
Channel {
  channelName   : String  (required)
  handle        : String  (unique, e.g. "@MyChannel1234")
  owner         : ObjectId → User
  description   : String
  channelBanner : String  (URL)
  channelAvatar : String  (URL)
  subscribers   : Number  (default 0)
  videos        : [ObjectId → Video]
  timestamps    : createdAt, updatedAt
}
```

### Video
```
Video {
  title        : String  (required)
  description  : String
  videoUrl     : String  (required — external URL)
  thumbnailUrl : String
  channelId    : ObjectId → Channel
  uploader     : ObjectId → User
  category     : Enum ["All", "Web Development", "JavaScript",
                        "Data Structures", "Server", "Music",
                        "Gaming", "News", "Sports", "Education"]
  views        : Number  (auto-incremented on fetch)
  likes        : [ObjectId → User]
  dislikes     : [ObjectId → User]
  comments     : [{ userId, text, timestamps }]  ← embedded
  timestamps   : createdAt, updatedAt
}
```

---

## 🔌 REST API Endpoints

### Auth  `/api/auth`
```
POST   /register    → Create new user, returns JWT
POST   /login       → Login, returns JWT
GET    /me          → Get current user (🔒 protected)
```

### Videos  `/api/videos`
```
GET    /              → List all videos (supports ?search=&category=)
GET    /:id           → Get single video + increments view count
POST   /              → Create video (🔒 owner of channel only)
PUT    /:id           → Update video (🔒 uploader only)
DELETE /:id           → Delete video (🔒 uploader only)
POST   /:id/like      → Toggle like    (🔒 authenticated)
POST   /:id/dislike   → Toggle dislike (🔒 authenticated)
```

### Channels  `/api/channels`
```
GET    /:id                → Get channel + its videos (public)
POST   /                   → Create channel (🔒 authenticated)
GET    /user/my-channels   → List current user's channels (🔒 protected)
```

### Comments  `/api/comments`
```
POST   /:videoId                → Add comment    (🔒 authenticated)
PUT    /:videoId/:commentId     → Edit comment   (🔒 comment owner)
DELETE /:videoId/:commentId     → Delete comment (🔒 comment owner)
```

---

## 🔐 Authentication Flow

```
  Client                          Server
    │                               │
    │── POST /api/auth/register ──► │  Create user, hash password
    │◄── { token: "JWT..." } ───── │
    │                               │
    │── POST /api/auth/login ─────► │  Verify password with bcrypt
    │◄── { token: "JWT..." } ───── │
    │                               │
    │── GET /api/videos (public) ─► │  No auth needed
    │◄── [videos array] ─────────── │
    │                               │
    │── POST /api/videos           │
    │   Authorization: Bearer JWT ─► │  auth.middleware verifies JWT
    │◄── { new video } ──────────── │  Attaches req.user, proceeds
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas cloud)

### Backend Setup
```bash
cd backend
npm install
# Create .env file:
# MONGO_URI=mongodb://localhost:27017/youtube_clone
# JWT_SECRET=your_secret_key
# PORT=5001
npm run dev
```

### Seed the Database (optional)
```bash
cd backend
npm run seed
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

The frontend proxies API calls to `http://localhost:5001` via `vite.config.js`.

---

## ✨ Features Summary

- ✅ User registration & login with JWT authentication
- ✅ Create and manage your own YouTube-style channel
- ✅ Upload videos (by URL), edit, and delete them
- ✅ Browse a video grid on the homepage
- ✅ Search videos by title
- ✅ Filter videos by category (10 categories)
- ✅ Video detail page with view count tracking
- ✅ Like & dislike toggle on videos
- ✅ Nested comment system (add, edit, delete)
- ✅ Collapsible sidebar navigation
- ✅ Responsive layout with open/closed sidebar states

---

## 📁 Key Files at a Glance

```
backend/
  src/index.js                    ← Express app entry point + MongoDB connect
  src/middleware/auth.js          ← JWT protect middleware
  src/models/User.model.js        ← User schema with bcrypt hooks
  src/models/Video.model.js       ← Video + embedded Comment schema
  src/models/Channel.model.js     ← Channel schema
  src/routes/auth.routes.js       ← Register / Login / Me
  src/routes/video.routes.js      ← Full CRUD + like/dislike
  src/routes/channel.routes.js    ← Create & fetch channels
  src/routes/comment.routes.js    ← Add / Edit / Delete comments
  seed.js                         ← Database seeder script

frontend/
  src/main.jsx                    ← React root mount
  src/App.jsx                     ← Router + Layout wrapper
  src/context/AuthContext.jsx     ← Global auth state (token, user)
  src/utils/api.js                ← Axios instance (base URL + auth header)
  src/components/Header.jsx       ← Top navbar
  src/components/Sidebar.jsx      ← Left nav
  src/components/VideoCard.jsx    ← Video thumbnail card
  src/pages/Home.jsx              ← Video grid + category filters
  src/pages/VideoPlayer.jsx       ← Watch page + comments
  src/pages/Channel.jsx           ← My channel management
  src/pages/Login.jsx             ← Login form
  src/pages/Register.jsx          ← Register form
```
