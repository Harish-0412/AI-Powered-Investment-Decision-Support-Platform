# Project Setup Complete! ✅

## Current Status

✅ **Backend Server** - Running on `http://localhost:5000`
✅ **Frontend Server** - Running on `http://localhost:3000`

---

## Project Directories Created/Configured

### Environment Files
- **Root**: `.env` - Main configuration file
- **Backend**: `backend/.env` - Backend-specific environment variables

### Database
- **Prisma Schema**: `backend/prisma/schema.prisma` - Database models
- **Migrations**: Auto-generated for PostgreSQL

---

## What's Installed

### Backend
- Express.js 5.2.1 (API server)
- Prisma ORM 7.8.0 (with PostgreSQL adapter)
- TypeScript 6.0.3
- Socket.io 4.8.3 (for real-time updates)
- BullMQ 5.76.6 (for background jobs)
- Redis support (Upstash)
- JWT authentication with refresh tokens
- Helmet.js (security headers)
- CORS configured

### Frontend
- Next.js 16.2.6 (React framework)
- React 19.2.4
- TypeScript 5
- TailwindCSS 4
- ESLint (code quality)

---

## Environment Configuration

### Database Setup

The project is configured to use **PostgreSQL**. You have several options:

#### Option 1: Free Cloud PostgreSQL (Recommended for Development)

**Neon.tech** (https://neon.tech)
1. Sign up for free account
2. Create a new project
3. Copy the connection string
4. Update `.env` and `backend/.env` with:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database_name
   ```

**Supabase** (https://supabase.com)
1. Create free account
2. Create new project
3. Get PostgreSQL connection string
4. Update environment files

#### Option 2: Local PostgreSQL (Docker Recommended)

```bash
# Using Docker
docker run --name postgres-inv \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=investment_platform \
  -p 5432:5432 \
  -d postgres:15
```

Then update DATABASE_URL:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/investment_platform
```

#### Option 3: Install PostgreSQL Locally
- Download from https://www.postgresql.org/download/
- Create database: `investment_platform`
- Update CONNECTION_URL in `.env`

### Running Migrations

Once PostgreSQL is configured:

```bash
cd backend
npx prisma migrate deploy
```

### Optional Services

These can be configured later for full functionality:

**Redis** (for background jobs):
- Get free tier from https://upstash.com
- Add to `backend/.env`:
  ```
  UPSTASH_REDIS_REST_URL=your_url
  UPSTASH_REDIS_REST_TOKEN=your_token
  ```

**Alpha Vantage API** (stock data):
- Free tier: https://www.alphavantage.co/api/
- Get key and add to `backend/.env`:
  ```
  ALPHA_VANTAGE_API_KEY=your_key
  ```

**News API** (market news):
- Free tier: https://newsapi.org/
- Add to `backend/.env`:
  ```
  NEWS_API_KEY=your_key
  ```

---

## Important Configuration Notes

### JWT Secrets
The `.env` file contains placeholder JWT secrets. For production, generate strong secrets:

**On Windows PowerShell:**
```powershell
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((-join ((65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_}))))
```

**Update these in `backend/.env`:**
```
JWT_SECRET=<32+ character secret>
JWT_REFRESH_SECRET=<32+ character secret>
```

### Admin Credentials
Default admin account:
- Email: `admin@investiq.com`
- Password: `Admin@1234`

**Important**: Change these in production!

---

## Running the Project

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Then visit: **http://localhost:3000**

---

## API Documentation

Base URL: `http://localhost:5000/api/v1`

### Available Endpoints

- **Auth**: `/auth/*` - Login, register, token refresh
- **Portfolio**: `/portfolios/*` - Portfolio management
- **Stocks**: `/stocks/*` - Stock data and search
- **News**: `/news/*` - Market news
- **Profile**: `/profile/*` - User profiles
- **Analytics**: `/analytics/*` - Portfolio analytics
- **Admin**: `/admin/*` - Admin functions
- **Health**: `/health` - Server health check

---

## Project Structure

```
Investment Platform/
├── backend/                 # Express API Server
│   ├── src/
│   │   ├── app.ts          # Express app setup
│   │   ├── server.ts       # Server startup
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── lib/            # Utilities (Prisma, Redis)
│   │   ├── middleware/     # Auth, error handling
│   │   ├── routes/         # API routes
│   │   └── types/          # TypeScript types
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   └── package.json
│
├── frontend/               # Next.js React App
│   ├── app/               # App routes
│   ├── components/        # React components
│   ├── lib/               # Frontend utilities
│   ├── public/            # Static assets
│   └── package.json
│
├── .env                   # Main configuration
├── README.md             # Project documentation
└── DEPLOYMENT_GUIDE.md   # Deployment instructions
```

---

## Database Schema

The following models are available:

- **User**: Authentication and profile data
- **UserProfile**: Extended user information
- **Portfolio**: Investment portfolios
- **Holding**: Stock holdings in portfolio
- **Transaction**: Buy/sell transactions
- **RefreshToken**: JWT refresh token management

---

## Development Commands

### Backend

```bash
cd backend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Prisma commands
npx prisma generate      # Generate client
npx prisma migrate dev   # Create & run migrations
npx prisma studio       # Open Prisma Studio (DB GUI)
```

### Frontend

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

---

## Next Steps

1. **Configure PostgreSQL**:
   - Set up database using one of the options above
   - Update `DATABASE_URL` in `backend/.env`
   - Run migrations: `npx prisma migrate deploy`

2. **Test the Application**:
   - Visit http://localhost:3000
   - Test authentication flow
   - Create portfolio and add stocks

3. **Configure External APIs** (Optional):
   - Get API keys for Alpha Vantage and News API
   - Add to `backend/.env`

4. **Customize Admin Account**:
   - Update default email/password in `backend/.env`

---

## Troubleshooting

### Backend Won't Start
- Check `DATABASE_URL` is correct
- Ensure PostgreSQL is running and accessible
- Run: `npx prisma db push` to sync schema

### Frontend Issues
- Clear node_modules: `rm -r node_modules && npm install`
- Clear Next.js cache: `rm -r .next`

### Database Connection Error
- Verify PostgreSQL service is running
- Test connection string manually
- Check firewall rules

---

## Production Deployment

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

The project is configured to deploy to **Render** with:
- Express backend
- PostgreSQL database
- Next.js frontend on Vercel

---

## Support

For issues or questions, refer to:
- Project README.md
- API documentation in the code
- Prisma docs: https://www.prisma.io/docs
- Next.js docs: https://nextjs.org/docs

---

**Setup Date**: 2026-06-05
**Project**: AI-Powered Investment Decision Support Platform
**Status**: ✅ Ready for Development
