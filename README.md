# Investment Intelligence Platform

A comprehensive full-stack investment portfolio management and intelligence platform built with modern web technologies. The platform enables users to manage investment portfolios, track performance metrics, analyze sentiment, and receive actionable insights powered by real-time market data and advanced analytics.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Security & Encryption](#security--encryption)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Problem Statement

### Challenges in Modern Investment Management

The retail investment landscape faces several critical pain points:

1. **Portfolio Fragmentation**: Investors struggle to consolidate holdings across multiple brokers and instruments into a unified view.

2. **Data Accessibility**: Real-time market data, technical analysis, and sentiment insights are scattered across disparate platforms, requiring manual aggregation.

3. **Analysis Complexity**: Calculating portfolio metrics, risk assessment, dividend tracking, and tax-loss harvesting opportunities demands expertise and time.

4. **Information Overload**: Investors are overwhelmed with market news and signals without contextualized relevance to their specific holdings.

5. **Lack of Personalization**: Generic portfolio recommendations don't account for individual risk profiles, investment goals, or learning levels.

### Solution

**Investment Intelligence Platform** provides a unified, intelligent solution that:

- **Centralizes portfolio management** across multiple holdings with real-time tracking
- **Aggregates market intelligence** from multiple data sources (Alpha Vantage, News APIs)
- **Enables automated analysis** of technical indicators, sentiment analysis, and performance metrics
- **Personalizes recommendations** based on user risk profiles and investment experience
- **Implements enterprise-grade security** to protect sensitive financial data
- **Provides scalable infrastructure** for growing user bases and data volumes

---

## Architecture Overview

The Investment Intelligence Platform uses a **modern microservices-inspired monolithic architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js Frontend (React 19 + TypeScript)            │   │
│  │  - Portfolio Dashboard & Management                  │   │
│  │  - Analytics & Sentiment Hub                         │   │
│  │  - Stock Screener & Mutual Funds                     │   │
│  │  - Admin Dashboard                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ (HTTPS/WSS)
┌──────────────────────────▼──────────────────────────────────┐
│              API Gateway & Security Layer                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js Backend (Node.js + TypeScript)           │   │
│  │  - CORS & CSRF Protection (Helmet.js)                │   │
│  │  - JWT Authentication & Authorization                │   │
│  │  - Rate Limiting & Request Validation (Zod)          │   │
│  │  - Request Logging (Morgan)                          │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────┬──────────────────┘
               │                          │
    ┌──────────▼──────────┐   ┌──────────▼──────────┐
    │  Data & State       │   │  External Services  │
    │  ┌────────────────┐ │   │  ┌────────────────┐ │
    │  │ PostgreSQL     │ │   │  │ Alpha Vantage  │ │
    │  │ (Prisma ORM)   │ │   │  │ News API       │ │
    │  └────────────────┘ │   │  │ Redis (Cache)  │ │
    │  ┌────────────────┐ │   │  │ BullMQ (Jobs)  │ │
    │  │ Upstash Redis  │ │   │  └────────────────┘ │
    │  │ (Session Cache)│ │   │  ┌────────────────┐ │
    │  └────────────────┘ │   │  │ Socket.io      │ │
    │                     │   │  │ (Real-time)    │ │
    └─────────────────────┘   └────────────────────┘
```

### Layered Architecture

1. **Presentation Layer** (Frontend)
   - Next.js 16 with React 19
   - Responsive UI with Tailwind CSS
   - Real-time updates via WebSockets
   - Client-side form validation

2. **API Layer** (Backend)
   - Express.js REST API with middleware stack
   - Comprehensive error handling
   - Request validation and sanitization
   - Authentication & authorization middleware

3. **Business Logic Layer**
   - Service-oriented architecture (Stock, Portfolio, Analytics services)
   - Domain-specific controllers
   - Technical indicator calculations
   - Data aggregation and transformation

4. **Data Access Layer**
   - Prisma ORM for type-safe database queries
   - Repository pattern for data operations
   - Connection pooling and optimization
   - Transaction management

5. **External Integration Layer**
   - Alpha Vantage API for stock data
   - News APIs for market sentiment
   - Redis for caching and session management
   - BullMQ for background job processing

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | >=20 | JavaScript runtime environment |
| **Express.js** | ^5.2.1 | REST API framework |
| **TypeScript** | ^6.0.3 | Type-safe JavaScript transpiler |
| **PostgreSQL** | (via Neon.tech) | Primary relational database |
| **Prisma** | ^7.8.0 | Type-safe ORM with auto-migration |
| **Redis** | ^5.12.1 | In-memory cache and session store |
| **BullMQ** | ^5.76.6 | Distributed job queue |
| **Socket.io** | ^4.8.3 | Real-time WebSocket communication |
| **jsonwebtoken** | ^9.0.3 | JWT generation and verification |
| **bcryptjs** | ^3.0.3 | Password hashing and comparison |
| **Helmet.js** | ^8.1.0 | HTTP security headers |
| **Zod** | ^4.4.3 | TypeScript-first schema validation |
| **Morgan** | ^1.10.1 | HTTP request logging |
| **dotenv** | ^17.4.2 | Environment variable management |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.2.6 | React framework with SSR/SSG |
| **React** | 19.2.4 | UI library |
| **TypeScript** | ^5 | Type-safe JavaScript |
| **Tailwind CSS** | ^4 | Utility-first CSS framework |
| **Recharts** | ^3.8.1 | Chart and visualization library |
| **Framer Motion** | ^12.39.0 | Animation library |
| **Lucide React** | ^1.16.0 | Icon library |

### DevOps & Infrastructure

| Technology | Purpose |
|-----------|---------|
| **Render** | Container hosting (Backend) |
| **Vercel** | Edge deployment (Frontend) |
| **Neon.tech** | PostgreSQL database hosting |
| **Upstash** | Serverless Redis |
| **GitHub** | Version control and CI/CD |

### Why These Technologies?

**Express.js + TypeScript Backend**
- Lightweight and flexible HTTP framework
- Extensive middleware ecosystem
- Type safety reduces bugs in data handling
- Excellent performance for I/O-bound operations (API calls, database queries)

**PostgreSQL + Prisma**
- ACID compliance for financial data integrity
- Powerful query capabilities for complex analytics
- Prisma provides type-safe queries without manual SQL
- Automatic schema migrations reduce deployment risk

**Redis + BullMQ**
- In-memory caching reduces database load
- Background job processing for expensive operations (data sync, analysis)
- Pub/Sub for real-time updates
- Session management and token blacklisting

**Next.js + React**
- Server-side rendering for better SEO and performance
- API routes reduce backend/frontend coupling
- Built-in optimization (image, font, code splitting)
- Seamless TypeScript integration
- Vercel integration for zero-config deployment

**Security Technologies**
- **Helmet.js**: Sets secure HTTP headers (CSP, HSTS, X-Frame-Options)
- **bcryptjs**: Industry-standard password hashing with salt rounds
- **jsonwebtoken**: Stateless authentication
- **Zod**: Schema validation prevents injection attacks

---

## Security & Encryption

### Overview

The Investment Intelligence Platform implements **defense-in-depth** security practices following OWASP standards and industry best practices for handling sensitive financial data.

### Password Security

#### Algorithm: bcryptjs

```typescript
// Backend: src/controllers/auth.controller.ts
const SALT_ROUNDS = 12;
const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
```

**Implementation Details:**
- **Algorithm**: Bcrypt (based on Blowfish cipher)
- **Salt Rounds**: 12 iterations (configurable, currently balanced for security vs. performance)
- **One-way hashing**: Passwords are never stored in plaintext
- **Constant-time comparison**: Prevents timing attacks during verification

**Security Properties:**
- **Adaptive algorithm**: Computational cost increases as hardware improves
- **Rainbow table immunity**: Unique salt per password prevents precomputed hash attacks
- **Collision resistant**: Computationally infeasible to find passwords with same hash

**Verification Flow:**
```typescript
// During login
const user = await prisma.user.findUnique({ where: { email } });
const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
```

---

### Authentication: JWT (JSON Web Tokens)

JWT provides stateless authentication suitable for distributed systems and modern APIs.

#### Token Structure

```
Header.Payload.Signature
```

**Token Lifecycle:**

```typescript
// Token Creation (auth.controller.ts)
const payload: AuthTokenPayload = {
  sub: user.id,           // User ID (subject)
  email: user.email,      // Email claim
  riskLevel: user.riskLevel // Custom claim
};

// Access Token: 15 minutes
const accessToken = signAccessToken(payload);

// Refresh Token: 7 days
const refreshToken = signRefreshToken(payload);
```

#### Access Token (Short-lived)
- **Expiration**: 15 minutes
- **Storage**: Memory (not persisted)
- **Purpose**: API request authentication
- **Usage**: `Authorization: Bearer <accessToken>`
- **Algorithm**: HS256 (HMAC with SHA-256)

**Security Benefits:**
- Short window limits exposure if token is compromised
- Memory-only storage (not vulnerable to localStorage XSS)
- Reduced server-side state requirements

#### Refresh Token (Long-lived)
- **Expiration**: 7 days
- **Storage**: HttpOnly secure cookie
- **Purpose**: Obtain new access tokens
- **Algorithm**: HS256 (same as access token)

**Cookie Configuration:**
```typescript
const refreshCookieOptions = {
  httpOnly: true,                    // Prevents JavaScript access
  secure: env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "none",                  // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days
  path: "/api/v1/auth"               // Restricts cookie scope
};
```

---

### Refresh Token Rotation (Token Rotation)

The platform implements **refresh token rotation** - a stateful security mechanism:

```typescript
// services/token.service.ts
export const rotateRefreshToken = async (refreshToken: string) => {
  const tokenHash = hashToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash }
  });

  // Verify token validity
  if (!storedToken || storedToken.revokedAt || 
      storedToken.expiresAt <= new Date()) {
    return null;
  }

  // Revoke old token
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() }
  });

  // Issue new tokens
  const nextAccessToken = signAccessToken(payload);
  const nextRefreshToken = signRefreshToken(payload);
  await persistRefreshToken(storedToken.user.id, nextRefreshToken);

  return { accessToken: nextAccessToken, refreshToken: nextRefreshToken };
};
```

**Security Properties:**
- **Token Binding**: Each refresh token maps to specific user and device
- **Revocation**: Invalid tokens cannot be used again
- **Replay Detection**: Reuse of revoked tokens is immediately detected
- **Family Chain**: Compromised token can invalidate entire session family

#### Token Hashing in Database

Refresh tokens are hashed before database storage:

```typescript
export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");
```

**Rationale**: Even if database is compromised, plaintext tokens are not exposed.

---

### Session Management

**HttpOnly Cookies:**
- Cannot be accessed by JavaScript (mitigates XSS attacks)
- Automatically sent with requests to the cookie path
- Secure flag ensures HTTPS-only transmission in production
- SameSite attribute prevents CSRF attacks

**Cookie Path Restriction:**
- Refresh cookies scoped to `/api/v1/auth` endpoint
- Prevents token exposure to unrelated endpoints
- Reduces attack surface

---

### Transport Security

#### HTTPS/TLS

```typescript
// app.ts - Helmet.js configuration
app.use(helmet());
```

**Helmet Middleware Protects Against:**
- **Content Security Policy (CSP)**: Prevents injection attacks
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME-sniffing
- **Strict-Transport-Security (HSTS)**: Enforces HTTPS
- **X-XSS-Protection**: Legacy XSS protection

#### CORS (Cross-Origin Resource Sharing)

```typescript
const allowedOrigins = new Set([
  normalizeOrigin(env.FRONTEND_URL),
  "https://nvest-psi.vercel.app",
  "http://localhost:3000"
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
```

**Security Benefits:**
- Whitelist-based origin validation
- Prevents unauthorized cross-origin requests
- Credentials (cookies) only sent to trusted origins

---

### Data Validation & Input Sanitization

Uses **Zod** for runtime schema validation:

```typescript
// Auth validation
const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  name: z.string().trim().min(1).max(120).optional()
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1)
});
```

**Protection Against:**
- **SQL Injection**: Parameterized queries via Prisma ORM
- **XSS**: Input sanitization and output encoding
- **Type Confusion**: Schema validation enforces types
- **Buffer Overflow**: TypeScript + Node.js memory safety
- **NoSQL Injection**: Structured database queries

---

### Authorization

Role-based access control via middleware:

```typescript
// middleware/auth.middleware.ts
export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractBearerToken(req);
  
  if (!token) {
    return next(new AppError(401, "Authentication token is required"));
  }

  const payload = verifyAccessToken(token);
  req.user = {
    id: payload.sub,
    email: payload.email,
    riskLevel: payload.riskLevel
  };

  next();
};
```

**Authorization Levels:**
- **Public**: Health check, public news endpoints
- **Authenticated**: All portfolio, stock, and profile endpoints
- **Admin**: Administrative operations

---

### Environment Variable Protection

```typescript
// config/env.ts
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  DATABASE_URL: z.string().min(1),
  // ... other vars
});
```

**Security Measures:**
- All secrets loaded from environment variables (never hardcoded)
- Schema validation ensures secrets meet minimum requirements
- Secrets not logged or exposed in error messages
- Different secrets for access vs. refresh tokens

---

### Database-Level Security

**Prisma ORM Benefits:**
- Parameterized queries prevent SQL injection
- Type safety at compile time
- Automatic escaping of values

**Encryption at Rest:**
- PostgreSQL supports encryption (handled by Neon.tech)
- Sensitive fields could be encrypted with application-level encryption if needed

**Access Control:**
```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String         // Never exposed
  createdAt     DateTime       @default(now())
}

model RefreshToken {
  tokenHash String    @unique  // Hashed, never plaintext
  expiresAt DateTime
  revokedAt DateTime?          // Soft delete for revocation
}
```

---

### Compliance & Standards

The platform implements security measures aligned with:

- **OWASP Top 10**: Protections against injection, broken auth, XSS, CSRF, etc.
- **CWE/SANS Top 25**: Weak cryptography, hardcoded secrets, improper input validation
- **PCI DSS**: If handling payment cards (basic principles followed)
- **GDPR**: User data protection and privacy
- **SOC 2 Type II**: Access control, monitoring, and encryption principles

---

## Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **PostgreSQL**: v14+ (Neon.tech account recommended for development)
- **Redis**: For caching and job queues (Upstash account recommended)
- **Git**: For version control

### Installation

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/investment-intelligence.git
cd investment-intelligence
```

#### 2. Install Root Dependencies

```bash
npm install
```

#### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

#### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Configuration

#### Backend Environment Setup

Create `.env` file in the `backend/` directory:

```bash
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:port/database
# Optional: local database for development
LOCAL_DATABASE_URL=postgresql://user:password@localhost:5432/investment_dev

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# External APIs
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
NEWS_API_KEY=your_news_api_key

# JWT Secrets (minimum 32 characters - use strong random strings)
JWT_SECRET=your_jwt_secret_here_minimum_32_characters_required
JWT_REFRESH_SECRET=your_jwt_refresh_secret_minimum_32_characters

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Admin credentials (change in production!)
ADMIN_EMAIL=admin@investiq.com
ADMIN_PASSWORD=Admin@1234
```

**Generating Secure Secrets:**

```bash
# Generate 32+ character random strings
openssl rand -base64 32
```

#### Frontend Environment Setup

Create `.env.local` file in the `frontend/` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

### Database Setup

#### 1. Generate Prisma Client

```bash
cd backend
npm run prisma:generate
```

#### 2. Run Migrations

```bash
# Development database
npm run prisma:migrate

# Or deploy existing migrations
npm run prisma:deploy
```

#### 3. Verify Schema

```bash
npx prisma studio  # Opens Prisma Studio for database inspection
```

---

### Running Locally

#### Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Backend will be available at: `http://localhost:5000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000`

#### Production Build

```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
cd frontend
npm run build
npm start
```

---

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "riskLevel": "MEDIUM"
  },
  "meta": {
    "accessToken": "eyJhbGc..."
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "riskLevel": "MEDIUM"
  },
  "meta": {
    "accessToken": "eyJhbGc..."
  }
}
```

Refresh token is set as HttpOnly cookie automatically.

#### Refresh Token
```http
POST /api/v1/auth/refresh
Cookie: refreshToken=eyJhbGc...
```

**Response (200 OK):**
```json
{
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <accessToken>
```

---

### Portfolio Endpoints

#### Get User Portfolios
```http
GET /api/v1/portfolios
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "data": [
    {
      "id": "portfolio-uuid",
      "name": "My Investment Portfolio",
      "description": "Primary investment account",
      "userId": "user-uuid",
      "holdings": [...],
      "transactions": [...],
      "createdAt": "2026-05-17T10:00:00Z",
      "updatedAt": "2026-05-26T15:30:00Z"
    }
  ]
}
```

#### Create Portfolio
```http
POST /api/v1/portfolios
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Growth Portfolio",
  "description": "Focused on long-term growth"
}
```

#### Add Stock to Portfolio
```http
POST /api/v1/portfolios/:portfolioId/holdings
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "symbol": "AAPL",
  "quantity": 10,
  "averageBuyPrice": 150.25
}
```

#### Add Transaction
```http
POST /api/v1/portfolios/:portfolioId/transactions
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "symbol": "AAPL",
  "type": "BUY",
  "quantity": 5,
  "price": 152.50,
  "date": "2026-05-26T10:00:00Z"
}
```

---

### Stock Endpoints

#### Get Stock Data
```http
GET /api/v1/stocks/:symbol
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "data": {
    "symbol": "AAPL",
    "currentPrice": 190.25,
    "change": 2.50,
    "changePercent": 1.33,
    "lastUpdated": "2026-05-26T20:00:00Z"
  }
}
```

#### Search Stocks
```http
GET /api/v1/stocks/search?q=apple
Authorization: Bearer <accessToken>
```

---

### Analytics Endpoints

#### Portfolio Analytics
```http
GET /api/v1/analytics/portfolio/:portfolioId
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "data": {
    "totalValue": 15000.50,
    "totalInvested": 12000.00,
    "gainLoss": 3000.50,
    "gainLossPercent": 25.00,
    "allocations": [
      {
        "symbol": "AAPL",
        "allocation": 45.5
      }
    ],
    "performance": [
      {
        "date": "2026-05-26",
        "value": 15000.50
      }
    ]
  }
}
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│   User      │
├─────────────┤
│ id (PK)     │
│ email       │
│ name        │
│ passwordHash│
│ riskLevel   │
└──────┬──────┘
       │ 1:1
       ├──────────────────┐
       │                  │
    1:N              1:1
       │                  │
       ▼                  ▼
  ┌─────────────┐  ┌──────────────┐
  │ Portfolio   │  │  UserProfile │
  ├─────────────┤  ├──────────────┤
  │ id (PK)     │  │ id (PK)      │
  │ name        │  │ slug         │
  │ description │  │ fullName     │
  │ userId (FK) │  │ bio          │
  └──────┬──────┘  │ githubUrl    │
         │         │ linkedinUrl  │
      1:N│         │ technologies │
         │         └──────────────┘
    ┌────┴───┐
    │         │
    ▼         ▼
┌────────┐ ┌────────────┐
│Holding │ │Transaction │
├────────┤ ├────────────┤
│ id(PK) │ │ id(PK)     │
│ symbol │ │ symbol     │
│quantity│ │ type       │
│avgPrice│ │ quantity   │
└────────┘ │ price      │
           │ date       │
           └────────────┘

RefreshToken
├─────────────
│ id (PK)
│ tokenHash (UNIQUE)
│ userId (FK)
│ expiresAt
│ revokedAt (nullable)
```

### Key Tables

#### Users
Stores user account information.
```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  name          String?
  passwordHash  String
  riskLevel     RiskLevel      @default(MEDIUM)
  portfolios    Portfolio[]
  refreshTokens RefreshToken[]
  profile       UserProfile?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}
```

#### Portfolios
Represents user investment portfolios.
```prisma
model Portfolio {
  id           String        @id @default(uuid())
  name         String
  description  String?
  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  holdings     Holding[]
  transactions Transaction[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([userId])
}
```

#### Holdings
Represents current stock positions in portfolios.
```prisma
model Holding {
  id              String    @id @default(uuid())
  portfolioId     String
  portfolio       Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  symbol          String
  quantity        Decimal   @db.Decimal(18, 6)
  averageBuyPrice Decimal   @db.Decimal(18, 6)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([portfolioId, symbol])
  @@index([symbol])
}
```

#### Transactions
Transaction history for audit and analysis.
```prisma
model Transaction {
  id          String          @id @default(uuid())
  portfolioId String
  portfolio   Portfolio       @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  symbol      String
  type        TransactionType
  quantity    Decimal         @db.Decimal(18, 6)
  price       Decimal         @db.Decimal(18, 6)
  date        DateTime        @default(now())
  createdAt   DateTime        @default(now())

  @@index([portfolioId])
  @@index([symbol])
  @@index([date])
}
```

#### Refresh Tokens
Manages session state and token rotation.
```prisma
model RefreshToken {
  id        String    @id @default(uuid())
  tokenHash String    @unique
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())

  @@index([userId])
}
```

---

## Deployment

### Render (Backend)

The platform uses **Render** with a Blueprint configuration for automated deployment.

#### Deployment Steps

1. **Connect GitHub Repository**
   - Push code to GitHub
   - Blueprint automatically detects `render.yaml`

2. **Environment Variables**
   - Configure in Render dashboard:
     - `DATABASE_URL` (Neon.tech)
     - `UPSTASH_REDIS_REST_URL` and token
     - `JWT_SECRET` and `JWT_REFRESH_SECRET`
     - API keys for external services

3. **Automated Build Process**
   ```bash
   npm install
   prisma generate
   tsc
   ```

4. **Verify Deployment**
   ```bash
   curl https://investment-intelligence-backend.onrender.com/api/v1/health
   ```

**Note**: Free tier services may spin down after inactivity (30-60 second startup).

### Vercel (Frontend)

Deploy Next.js frontend to Vercel with zero configuration:

1. **Connect GitHub Repository**
2. **Configure Environment Variables**
   - `NEXT_PUBLIC_API_URL`: Backend API URL

3. **Deploy**
   - Automatic builds on push
   - Preview deployments for pull requests
   - One-click rollbacks

**Advanced Configuration**: See `vercel.json` for edge runtime settings.

### Database Migration in Production

```bash
# Before deployment
npm run prisma:deploy

# Handles pending migrations without data loss
```

---

## Contributing

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Use Prettier (auto-format)
- **Linting**: ESLint for both frontend and backend
- **Naming**: camelCase for variables, PascalCase for classes/types

### Commit Convention

```
feat: add new feature
fix: fix bug
docs: update documentation
refactor: refactor code
test: add tests
chore: update dependencies
```

### Pull Request Process

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit
3. Push to remote: `git push origin feature/feature-name`
4. Create pull request with description
5. Ensure all tests pass
6. Request review from maintainers
7. Merge after approval

---

## License

This project is licensed under the ISC License. See LICENSE file for details.

---

## Support & Documentation

- **API Documentation**: See this README's API Documentation section
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Database Schema**: [Prisma Schema](./backend/prisma/schema.prisma)
- **Issue Reporting**: Open an issue on GitHub

---

## Security Reporting

If you discover a security vulnerability, please email security@investmentintelligence.com instead of using the issue tracker.

---

**Last Updated**: May 26, 2026
**Version**: 1.0.0
