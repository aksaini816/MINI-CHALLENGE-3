# 🌿 CarbonTrack — Carbon Footprint Awareness Platform

> A production-ready, full-stack SaaS sustainability platform for tracking, analyzing, and reducing your carbon footprint through personalized AI insights and gamification.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ed)](https://docker.com)
[![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-green)](https://wcag.com)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Folder Structure](#folder-structure)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [Running Locally](#running-locally)
8. [Docker Deployment](#docker-deployment)
9. [Testing](#testing)
10. [Accessibility](#accessibility)
11. [Security](#security)
12. [API Reference](#api-reference)
13. [Future Enhancements](#future-enhancements)

---

## 🌍 Project Overview

CarbonTrack is a comprehensive sustainability platform that empowers individuals to:

- **Understand** their environmental impact through detailed carbon footprint calculations
- **Track** emissions over time with historical data and trend analysis
- **Act** on personalized AI-powered recommendations to reduce their footprint
- **Engage** with gamification challenges and earn badges for eco-friendly behavior
- **Learn** through a curated knowledge hub with expert-written articles

Built with a clean, minimalist UI inspired by Notion, Linear, and Vercel Dashboard — CarbonTrack feels like a professional SaaS product, not a student project.

---

## ✨ Features

### 🔐 Authentication System
- Secure user registration and login with bcrypt password hashing
- JWT-based authentication with short-lived access tokens (15 min)
- Refresh token rotation for persistent sessions
- Role-based access control (User / Admin)
- Rate-limited auth endpoints (5 req/15min)

### 🧮 Carbon Footprint Calculator
Multi-step wizard that calculates emissions from:
- **Transportation**: Car, bike, public transport, flights
- **Home Energy**: Electricity (kWh), natural gas (m³), LPG (kg)
- **Food**: 4 diet types from vegan to high-meat (EPA/IPCC factors)
- **Waste**: Recycling rate, plastic waste, general household waste

Outputs:
- Monthly & yearly totals
- Category-wise breakdown with percentages
- Sustainability Score (0–100)

### 🤖 AI Insights Engine
Rule-based recommendation engine with LLM-ready architecture:
- Personalized, actionable insights ranked by CO₂ reduction potential
- 8 specialized rule modules (transport switch, diet change, energy savings, etc.)
- Each insight includes quantified CO₂ reduction estimates
- Designed for easy LLM integration (replace `generateInsights()`)

### 📊 Emission Dashboard
- KPI cards: Monthly/Yearly emissions, Reduction achieved, Score
- Line chart: Monthly emission trends
- Pie chart: Category breakdown
- Stacked bar chart: Category trends over time
- Real-time comparison with previous period

### 🎯 Sustainability Goals
- Full CRUD for personal reduction targets
- Progress tracking with visual progress bars
- Deadline tracking with days-remaining counter
- Status management: Active, Completed, Paused, Failed

### 🏆 Carbon Reduction Challenges
- 8 pre-seeded eco-challenges (transport, food, energy, waste, lifestyle)
- Join/complete workflow with progress tracking
- Points system and badge awards
- User statistics dashboard

### 📚 Knowledge Hub
- 6 expert-written articles on climate, sustainability, food, transport
- Full-text search with 400ms debounce
- Category filtering (6 categories)
- Paginated results with reading time estimates

### 🛡️ Admin Panel
- User management with activate/deactivate
- Platform analytics: avg emissions, sustainability score, usage stats
- Content management overview for articles and challenges

---

## 🏗️ Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │                  Browser                     │
                    └──────────────────────┬──────────────────────┘
                                           │
                    ┌──────────────────────▼──────────────────────┐
                    │         Frontend (React + Vite)              │
                    │  Zustand  |  React Router  |  Recharts       │
                    │  React Hook Form  |  shadcn/ui  |  Tailwind  │
                    └──────────────────────┬──────────────────────┘
                                           │ REST API (Axios)
                    ┌──────────────────────▼──────────────────────┐
                    │         Backend (Express + TypeScript)        │
                    │   Controller → Service → Repository Layer    │
                    │   Helmet | CORS | Rate Limit | Zod | JWT     │
                    └──────────────────────┬──────────────────────┘
                                           │ Prisma ORM
                    ┌──────────────────────▼──────────────────────┐
                    │             PostgreSQL 16                     │
                    │  Parameterized queries | Indexes | Migrations │
                    └─────────────────────────────────────────────┘
```

### Backend Pattern: Clean Architecture

```
src/
├── controllers/    # HTTP request/response handling
├── services/       # Business logic (carbon calc, insights engine)
├── repositories/   # Database access layer
├── middleware/     # auth, validate, errorHandler
├── routes/         # Express routers
├── schemas/        # Zod validation schemas
├── utils/          # carbonCalculator, AppError, logger
└── prisma/         # Prisma client singleton
```

---

## 📁 Folder Structure

```
carbon-footprint-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # ProtectedRoute
│   │   │   ├── layout/         # Sidebar, Header, Layout
│   │   │   ├── ui/             # Button, Card, Badge, etc.
│   │   │   └── ErrorBoundary.tsx
│   │   ├── pages/
│   │   │   ├── auth/           # LoginPage, RegisterPage
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── CalculatorPage.tsx
│   │   │   ├── InsightsPage.tsx
│   │   │   ├── GoalsPage.tsx
│   │   │   ├── ChallengesPage.tsx
│   │   │   ├── KnowledgeHubPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── AdminPage.tsx
│   │   ├── stores/             # Zustand (auth, ui)
│   │   ├── lib/                # api.ts, utils.ts
│   │   └── test/               # Vitest setup + tests
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/        # auth, carbon, goals, challenges, articles, admin, user
│   │   ├── services/           # auth, carbon, goals, challenges, articles, insights
│   │   ├── repositories/       # user.repository.ts
│   │   ├── middleware/         # authenticate, validate, errorHandler, notFoundHandler
│   │   ├── routes/             # auth, carbon, goals, challenges, articles, admin, user
│   │   ├── schemas/            # auth, carbon, goal
│   │   ├── utils/              # carbonCalculator, AppError, logger
│   │   ├── config/             # env.ts (Zod-validated)
│   │   ├── prisma/             # client.ts
│   │   └── __tests__/          # carbonCalculator, insights, AppError tests
│   ├── prisma/
│   │   ├── schema.prisma       # Full DB schema with all models
│   │   └── seed.ts             # Seeder with demo data
│   ├── Dockerfile
│   └── package.json
│
├── docs/
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ⚙️ Installation

### Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL 14+ (or use Docker)

### Local Setup

```bash
# 1. Clone and navigate
cd carbon-footprint-platform

# 2. Set up environment variables
cp .env.example backend/.env
# Edit backend/.env with your PostgreSQL credentials and secrets

# 3. Install backend dependencies
cd backend && npm install

# 4. Run database migrations and seed
npx prisma migrate dev --name init
npm run db:seed

# 5. Install frontend dependencies
cd ../frontend && npm install

# 6. Start both servers (in separate terminals)
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

---

## 🔧 Environment Variables

Create `backend/.env` from `.env.example`:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | ✅ | Min 32 chars, used to sign access tokens |
| `JWT_REFRESH_SECRET` | ✅ | Min 32 chars, used to sign refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | | Access token lifetime (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | | Refresh token lifetime (default: `7d`) |
| `CORS_ORIGIN` | | Allowed origins, comma-separated |
| `BCRYPT_ROUNDS` | | Password hash rounds (default: `12`) |
| `NODE_ENV` | | `development` / `production` / `test` |
| `PORT` | | API port (default: `5000`) |

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🚀 Running Locally

```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev
```

### Demo Credentials
| Account | Email | Password |
|---|---|---|
| User | demo@carbontrack.io | Demo@123456 |
| Admin | admin@carbontrack.io | Admin@123456 |

---

## 🐳 Docker Deployment

```bash
# 1. Copy and configure environment
cp .env.example .env
# Edit .env — change POSTGRES_PASSWORD, JWT secrets, CORS_ORIGIN

# 2. Build and start all services
docker compose up --build

# Services:
# Frontend:  http://localhost
# Backend:   http://localhost:5000
# Database:  localhost:5432
```

The Docker Compose setup automatically:
1. Starts PostgreSQL with health checks
2. Runs database migrations on backend startup
3. Seeds the database with demo data
4. Serves the frontend via nginx

---

## 🧪 Testing

### Backend Tests (Jest + Supertest)

```bash
cd backend
npm test                # Run all tests
npm run test:coverage   # Run with coverage report
```

**Test coverage:**
- `carbonCalculator.test.ts` — 7 unit tests for emission calculation logic
- `insights.test.ts` — 7 unit tests for the AI insights engine
- `AppError.test.ts` — 8 unit tests for error class behavior

### Frontend Tests (Vitest + React Testing Library)

```bash
cd frontend
npm test                # Run all tests
npm run test:coverage   # Run with coverage report
```

**Test coverage:**
- `utils.test.ts` — 22 unit tests for utility functions
- `components.test.tsx` — 20 component tests covering all UI primitives

---

## ♿ Accessibility

CarbonTrack targets **WCAG 2.1 Level AA** compliance:

| Feature | Implementation |
|---|---|
| Keyboard navigation | All interactive elements focusable with Tab |
| Focus indicators | Visible ring on all focusable elements |
| Screen reader support | ARIA labels, roles, and live regions throughout |
| Color contrast | Forest green on white meets 4.5:1 minimum |
| Skip link | "Skip to main content" link at page top |
| Semantic HTML | Proper `main`, `nav`, `article`, `section`, `header` |
| Form accessibility | Every input has `<label>`, `aria-describedby`, `aria-invalid` |
| Error messages | `role="alert"` on validation errors |
| Loading states | `aria-busy`, `aria-live` on dynamic content |
| Tables | Proper `scope` on `<th>` elements |
| Charts | `role="img"` with `aria-label` on all Recharts |
| Progress bars | `role="progressbar"` with `aria-valuenow` etc. |
| Dark mode | Respects system preference, toggleable |
| Reduced motion | CSS transitions respect prefers-reduced-motion |

---

## 🔒 Security

### Authentication
- **bcrypt** with cost factor 12 for password hashing
- **JWT** access tokens (15 min expiry) — minimize exposure window
- **Refresh token rotation** — single-use, stored in database
- **Rate limiting** on auth endpoints: 10 req/15min (prevents brute force)

### API Security
- **Helmet.js** — sets security headers (CSP, HSTS, X-Frame-Options, etc.)
- **CORS** — whitelist-based origin control
- **Rate limiting** — 200 req/15min general; 10 req/15min auth
- **Zod validation** on all request bodies — prevents invalid/malicious input
- **Content-type validation** — enforces JSON

### Database Security
- **Prisma parameterized queries** — prevents SQL injection by design
- **No raw SQL** in application code
- **Database credentials** only in environment variables

### OWASP Top 10
| Risk | Mitigation |
|---|---|
| Broken Access Control | Role-based middleware, resource ownership checks |
| Cryptographic Failures | bcrypt, JWT, HTTPS (in prod), secrets in env vars |
| Injection | Prisma parameterized queries, Zod input validation |
| Security Misconfiguration | Helmet defaults, minimal Docker privileges |
| Identification Failures | Short-lived JWTs, refresh token rotation |
| Server-Side Request Forgery | No SSRF vectors in current implementation |

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | None | Create account |
| POST | `/auth/login` | None | Login |
| POST | `/auth/logout` | None | Logout (invalidate refresh token) |
| POST | `/auth/refresh` | None | Refresh access token |
| GET | `/auth/me` | Bearer | Get current user |

### Carbon
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/carbon/calculate` | Bearer | Calculate & save footprint |
| GET | `/carbon/history` | Bearer | Paginated history |
| GET | `/carbon/summary` | Bearer | Dashboard summary |
| GET | `/carbon/insights` | Bearer | AI recommendations |

### Goals
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/goals` | Bearer | List user goals |
| POST | `/goals` | Bearer | Create goal |
| PUT | `/goals/:id` | Bearer | Update goal |
| DELETE | `/goals/:id` | Bearer | Delete goal |

### Challenges
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/challenges` | Bearer | All available challenges |
| GET | `/challenges/my` | Bearer | User's challenges |
| GET | `/challenges/stats` | Bearer | Points & badges |
| POST | `/challenges/:id/join` | Bearer | Join challenge |
| PUT | `/challenges/:id/complete` | Bearer | Complete challenge |

### Articles
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/articles` | None | List articles (search/filter) |
| GET | `/articles/:slug` | None | Get single article |

### Admin (ADMIN role required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | List all users |
| PUT | `/admin/users/:id` | Update user (activate/deactivate/role) |
| GET/POST | `/admin/articles` | Manage articles |
| PUT/DELETE | `/admin/articles/:id` | Update/delete article |
| GET/POST | `/admin/challenges` | Manage challenges |
| GET | `/admin/analytics` | Platform statistics |

---

## 🔭 Future Enhancements

1. **LLM Integration** — Replace `InsightsEngine.generateInsights()` with OpenAI/Gemini API calls
2. **Monthly PDF Reports** — Generate downloadable emission reports with charts
3. **Social Features** — Compare footprint with friends, team challenges
4. **Mobile App** — React Native app using the same API
5. **Carbon Offsetting** — Integration with verified carbon offset providers
6. **IoT Integration** — Connect smart home energy meters for automatic tracking
7. **National Grid Data** — Real-time electricity grid carbon intensity per region
8. **Push Notifications** — Weekly sustainability reminders
9. **Leaderboards** — Community sustainability rankings
10. **SSO** — Google/GitHub OAuth2 integration

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

*Built with 💚 for a sustainable future.*
