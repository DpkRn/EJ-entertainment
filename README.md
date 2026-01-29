# EJ Entertainment

MERN app that stores and displays EJ Entertainment categories and links (Sites, Creators, Latinas, PornStars, Milf, Wife, BBC, Step Dad, Step Mom, Step Sis, Vintage, MMS, Stories, Japanese, Anime). Folder structure follows LinkBridger: **backend/** and **frontend/**.

## Stack

- **Frontend:** React (Vite) + Context API
- **Backend:** Express.js (controller / model / routes)
- **Database:** MongoDB (Mongoose)

## Folder structure (LinkBridger-style)

```
JITU/
├── backend/
│   ├── config/       # db.js
│   ├── controller/   # CategoryController, LinkController, PreviewController
│   ├── model/        # categoryModel, linkModel
│   ├── routes/       # CategoryRoute, LinkRoute, PreviewRoute
│   ├── scripts/      # seed.js, seedData.js
│   ├── index.js      # entry
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Setup

### Backend

```bash
cd backend
cp .env.example .env   # set PORT, ORIGIN, DATABASE_URL
npm install
npm run seed           # load categories and links (requires DATABASE_URL)
npm run dev            # http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173 (proxies /api to backend:8080)
```

## API

- `GET /api/categories` — list categories with link counts
- `GET /api/categories/:id` — one category with its links
- `GET /api/links/category/:categoryId` — links for a category
- `GET /api/preview?url=...` — Open Graph preview for a URL
- `GET /api/health` — health check

## Data

Seed data: `backend/scripts/seedData.js`. Run `npm run seed` in **backend** to reset and repopulate the database. If `DATABASE_URL` is not set, the server still starts but categories/links API will fail until MongoDB is configured.
