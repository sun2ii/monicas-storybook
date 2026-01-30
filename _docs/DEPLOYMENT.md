# Deployment Guide

## Environment Setup

### Development Environment

**Prerequisites:**
- Node.js 18.x or higher
- npm or yarn
- Git
- PostgreSQL (optional, for Phase 6+)

**Setup Steps:**

1. Clone repository
   ```bash
   git clone <repo-url>
   cd monicas-storybook
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create environment file
   ```bash
   cp .env.example .env.local
   ```

4. Configure environment variables (see below)

5. Start development server
   ```bash
   npm run dev
   ```

6. Open browser: http://localhost:3000

---

## Environment Variables

### .env.local (Development)

```bash
# ======================
# Data Layer Toggle
# ======================
# Phase 1-5: Use mock data (true)
# Phase 6+: Use PostgreSQL (false)
NEXT_PUBLIC_USE_MOCK_DATA=true

# ======================
# Dropbox OAuth (Phase 4+)
# ======================
DROPBOX_APP_KEY=your_dropbox_app_key
DROPBOX_APP_SECRET=your_dropbox_app_secret
DROPBOX_REDIRECT_URI=http://localhost:3000/api/auth/callback

# ======================
# Neon PostgreSQL (Phase 6+)
# ======================
DATABASE_URL=postgresql://user:password@host:5432/database

# ======================
# NextAuth (if using NextAuth.js)
# ======================
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=http://localhost:3000

# ======================
# Environment
# ======================
NODE_ENV=development
```

### .env.production (Production)

```bash
# Data Layer
NEXT_PUBLIC_USE_MOCK_DATA=false

# Dropbox OAuth
DROPBOX_APP_KEY=your_production_app_key
DROPBOX_APP_SECRET=your_production_app_secret
DROPBOX_REDIRECT_URI=https://yourdomain.com/api/auth/callback

# Database
DATABASE_URL=postgresql://user:password@production-host:5432/database

# NextAuth
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://yourdomain.com

# Environment
NODE_ENV=production
```

---

## Dropbox App Setup

### Creating Dropbox App

1. Go to https://www.dropbox.com/developers/apps

2. Click "Create app"

3. Choose:
   - **API:** Scoped access
   - **Type of access:** Full Dropbox
   - **App name:** monicas-storybook (or your preferred name)

4. Click "Create app"

### Configure App Permissions

1. Go to "Permissions" tab

2. Enable these scopes:
   - `files.metadata.read` - Read file metadata
   - `files.content.read` - Read file content
   - `files.content.write` - Move files (for duplicate handling)

3. Click "Submit"

### Get OAuth Credentials

1. Go to "Settings" tab

2. Note your:
   - **App key** → `DROPBOX_APP_KEY`
   - **App secret** → `DROPBOX_APP_SECRET`

3. Add to `.env.local`

### Configure Redirect URI

1. In "Settings" tab, find "OAuth 2" section

2. Add redirect URI:
   - Development: `http://localhost:3000/api/auth/callback`
   - Production: `https://yourdomain.com/api/auth/callback`

3. Click "Add"

---

## Neon PostgreSQL Setup

### Creating Neon Database

1. Go to https://neon.tech

2. Sign up / Log in

3. Click "Create Project"

4. Configure:
   - **Project name:** monicas-storybook
   - **Region:** Choose closest to your users
   - **PostgreSQL version:** 15 or 16

5. Click "Create Project"

### Get Connection String

1. In project dashboard, find "Connection Details"

2. Copy connection string (format: `postgresql://user:password@host/database`)

3. Add to `.env.local`:
   ```bash
   DATABASE_URL=postgresql://user:password@host/database
   ```

### Run Migrations

```bash
# Using psql
psql $DATABASE_URL -f migrations/001_initial_schema.sql

# Or using Node.js migration script
npm run migrate
```

### Verify Connection

```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

---

## Local Development Setup

### Phase 1-5 (Mock Data)

1. Set environment variable:
   ```bash
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ```

2. Ensure mock data files exist:
   ```bash
   ls src/mocks/
   # Should show: photos.json, collections.json, users.json
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

4. Test in browser: http://localhost:3000/viewer

### Phase 6+ (PostgreSQL)

1. Set environment variable:
   ```bash
   NEXT_PUBLIC_USE_MOCK_DATA=false
   DATABASE_URL=postgresql://...
   ```

2. Run migrations:
   ```bash
   npm run migrate
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

4. Verify database connection in logs

---

## Production Deployment

### Vercel Deployment (Recommended)

**Prerequisites:**
- Vercel account
- GitHub repository

**Steps:**

1. Push code to GitHub

2. Go to https://vercel.com

3. Click "New Project"

4. Import your GitHub repository

5. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next

6. Add environment variables:
   - `NEXT_PUBLIC_USE_MOCK_DATA=false`
   - `DATABASE_URL=postgresql://...`
   - `DROPBOX_APP_KEY=...`
   - `DROPBOX_APP_SECRET=...`
   - `DROPBOX_REDIRECT_URI=https://yourdomain.vercel.app/api/auth/callback`
   - `NEXTAUTH_SECRET=...`
   - `NEXTAUTH_URL=https://yourdomain.vercel.app`

7. Click "Deploy"

8. Update Dropbox redirect URI to match Vercel URL

### Other Platforms

**Netlify:**
- Similar to Vercel
- Use `next export` for static export (if applicable)

**AWS / DigitalOcean / Heroku:**
- Build Docker container
- Deploy to container service
- Configure environment variables
- Set up PostgreSQL database

---

## Production Checklist

### Pre-Deployment

- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Dropbox app configured for production domain
- [ ] HTTPS enabled
- [ ] Secrets are secure (not in version control)

### Post-Deployment

- [ ] OAuth flow works (login with Dropbox)
- [ ] Photos load from database
- [ ] Collections CRUD works
- [ ] Duplicate detection works
- [ ] Error logging configured
- [ ] Database backups enabled

---

## Database Migration Process

### Running Migrations

**Development:**
```bash
psql $DATABASE_URL -f migrations/001_initial_schema.sql
```

**Production:**
```bash
# Set production DATABASE_URL
export DATABASE_URL=postgresql://...

# Run migration
psql $DATABASE_URL -f migrations/001_initial_schema.sql
```

### Migration Script

Create `/scripts/migrate.js`:

```javascript
const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const sql = fs.readFileSync('./migrations/001_initial_schema.sql', 'utf8');
    await pool.query(sql);
    console.log('Migration successful');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
```

Run with:
```bash
node scripts/migrate.js
```

### Rollback Strategy

Create rollback SQL file: `/migrations/001_rollback.sql`

```sql
DROP TABLE IF EXISTS duplicate_groups;
DROP TABLE IF EXISTS collections;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS users;
```

Run rollback:
```bash
psql $DATABASE_URL -f migrations/001_rollback.sql
```

---

## Environment Variable Management

### Development

Use `.env.local` (gitignored):
```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
DATABASE_URL=postgresql://localhost/dev_db
```

### Production

Use platform environment variable management:

**Vercel:**
- Project Settings → Environment Variables
- Add production values
- Separate by environment (Production, Preview, Development)

**AWS:**
- Use AWS Secrets Manager
- Inject secrets at runtime

**Docker:**
- Use Docker secrets
- Or pass via `docker run -e VAR=value`

### Security Best Practices

1. Never commit secrets to version control
2. Use different secrets for dev/production
3. Rotate secrets regularly
4. Use environment-specific values
5. Limit access to production secrets

---

## Monitoring and Logging

### Error Logging

**Sentry Integration:**

```bash
npm install @sentry/nextjs
```

Configure in `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // Your Next.js config
}, {
  // Sentry config
  org: "your-org",
  project: "monicas-storybook",
});
```

### Database Monitoring

**Neon Dashboard:**
- Monitor query performance
- Track connection count
- View error logs

### Application Monitoring

**Vercel Analytics:**
- Automatic with Vercel deployment
- Track page views, performance

**Custom Logging:**

```typescript
// lib/logger.ts
export function logError(error: Error, context: any) {
  console.error('[ERROR]', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });

  // Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error);
  }
}
```

---

## Troubleshooting Common Issues

### Issue: "NEXT_PUBLIC_USE_MOCK_DATA not defined"

**Solution:**
- Ensure `.env.local` exists
- Restart dev server after changing env vars
- Check variable name (must start with `NEXT_PUBLIC_` for client-side access)

### Issue: "Database connection failed"

**Solution:**
- Verify DATABASE_URL is correct
- Check database is running
- Verify network access (firewall, IP whitelist)
- Test connection with `psql $DATABASE_URL`

### Issue: "Dropbox OAuth redirect mismatch"

**Solution:**
- Verify `DROPBOX_REDIRECT_URI` matches Dropbox app settings
- Check for trailing slash (should match exactly)
- Update Dropbox app settings if domain changed

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Restart dev server
npm run dev
```

### Issue: "PostgreSQL migration fails"

**Solution:**
- Check if tables already exist (rollback first)
- Verify PostgreSQL version compatibility
- Check for syntax errors in SQL
- Ensure proper permissions

---

## Performance Optimization

### Production Build

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

### Image Optimization

- Use Next.js `<Image>` component for automatic optimization
- Configure image domains in `next.config.js`:
  ```javascript
  module.exports = {
    images: {
      domains: ['dl.dropboxusercontent.com', 'via.placeholder.com'],
    },
  };
  ```

### Database Optimization

- Add indexes (already in schema)
- Use connection pooling
- Implement caching for frequently accessed data

### Caching Strategy

- API routes: Cache Dropbox responses
- Photos: Cache thumbnails locally (optional)
- Collections: Cache in memory with TTL

---

## Backup Strategy

### Database Backups

**Neon Auto-Backups:**
- Enabled by default
- Point-in-time recovery

**Manual Backup:**
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

### Environment Backups

- Store `.env.production` in secure location (password manager)
- Document all production secrets
- Keep emergency access credentials

---

## Scaling Considerations

### Database Scaling

- Neon supports auto-scaling
- Upgrade plan as needed
- Consider read replicas for high traffic

### Application Scaling

- Vercel scales automatically
- Use Edge Functions for global performance
- Implement CDN for static assets

### Dropbox API Limits

- Monitor API usage
- Implement rate limiting
- Cache Dropbox responses
- Use webhooks for sync instead of polling
