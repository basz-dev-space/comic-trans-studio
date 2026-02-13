# Production Deployment Guide

## Overview

Comic Translation Studio is a production-ready SvelteKit application designed for comic translation workflows. This guide covers deployment best practices, security considerations, and infrastructure recommendations.

## Architecture

### Technology Stack

- **Framework:** SvelteKit 2.x with SSR (Server-Side Rendering)
- **Runtime:** Node.js 18+
- **Database:** Prisma ORM (supports SQLite, PostgreSQL, MySQL, etc.)
- **Canvas Engine:** Fabric.js 6.x for visual editing
- **Auth:** Session-based authentication with bcryptjs
- **File Handling:** JSZip, jsPDF, PDF.js for import/export

### Application Structure

```
src/
├── routes/              # SvelteKit file-based routing
│   ├── +layout.svelte   # Global layout with i18n
│   ├── +page.svelte     # Landing page
│   ├── login/           # Authentication
│   ├── projects/        # Project dashboard
│   └── project/         # Project & chapter editors
├── lib/
│   ├── server/          # Server-only code (DB, auth)
│   │   ├── db/          # Prisma client setup
│   │   ├── repository/  # Data access layer
│   │   └── adminSessions.ts
│   └── i18n.ts          # Internationalization
└── hooks.server.ts      # Global auth middleware
```

## Environment Configuration

### Required Environment Variables

```bash
# Database connection (see Database Configuration below)
DATABASE_URL=postgresql://user:password@host:5432/database

# Admin credentials (change these!)
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password

# Environment
NODE_ENV=production
```

### Optional Environment Variables

```bash
# Session timeout (default: 24 hours)
ADMIN_SESSION_TTL_MS=86400000

# For alternative database URLs
PRISMA_DATABASE_URL=...
POSTGRES_PRISMA_URL=...
POSTGRES_URL=...
```

## Database Configuration

### Development (SQLite)

SQLite is great for development and small deployments:

```bash
DATABASE_URL=file:./prisma/dev.db
```

### Production (PostgreSQL Recommended)

For production, use a managed PostgreSQL database:

#### Neon (Recommended)

```bash
DATABASE_URL=postgresql://user:password@ep-example.us-east-2.aws.neon.tech/neondb
```

**Setup:**
1. Create account at https://neon.tech
2. Create new project
3. Copy connection string to `DATABASE_URL`
4. Run `npm run db:push` to create schema

#### Supabase

```bash
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
```

**Setup:**
1. Create project at https://supabase.com
2. Go to Project Settings → Database
3. Copy connection string (Transaction pooler recommended)
4. Run `npm run db:push`

#### PlanetScale

```bash
DATABASE_URL=mysql://user:password@host.us-east-3.psdb.cloud/database?sslaccept=strict
```

**Setup:**
1. Create database at https://planetscale.com
2. Create password for branch
3. Copy connection string
4. Run `npm run db:push`

## Deployment Platforms

### Vercel (Recommended)

Comic Translation Studio is optimized for Vercel deployment.

**Deployment Steps:**

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Link project
   vercel link
   ```

2. **Configure Environment Variables**

   In Vercel Dashboard → Project Settings → Environment Variables:
   
   ```
   DATABASE_URL=postgresql://...
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=secure_password_here
   NODE_ENV=production
   ```

3. **Build Configuration**

   Vercel auto-detects SvelteKit. No special configuration needed.
   
   Build Command: `npm run build`
   Output Directory: `.vercel/output`

4. **Deploy**
   ```bash
   vercel --prod
   ```

**Automatic Deployments:**

Connect your GitHub repository to Vercel for automatic deployments on push.

### Docker Deployment

Dockerfile included for containerized deployments:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run db:generate
RUN npm run build
EXPOSE 3000
CMD ["node", "build"]
```

**Build and Run:**

```bash
docker build -t comic-translation-studio .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=password \
  comic-translation-studio
```

### Other Platforms

The application can be deployed to any Node.js hosting platform:

- **Railway:** Connect repo, add env vars, deploy
- **Render:** Web Service → Connect repo → Add env vars
- **Fly.io:** `fly launch` → Configure → Deploy
- **AWS/GCP/Azure:** Use Docker container with appropriate DB connection

## Security Best Practices

### Authentication

- ✅ Session-based auth with HTTP-only cookies
- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ CSRF protection via SameSite cookies
- ✅ Global auth middleware in `hooks.server.ts`

**Production Checklist:**

- [ ] Change default `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- [ ] Use strong passwords (12+ characters, mixed case, numbers, symbols)
- [ ] Consider implementing rate limiting for login attempts
- [ ] Set `secure: true` for cookies in production (auto-enabled when NODE_ENV=production)

### Database

- ✅ Parameterized queries via Prisma (SQL injection protection)
- ✅ Foreign key constraints and cascading deletes
- ✅ Connection pooling handled by Prisma

**Production Checklist:**

- [ ] Use connection pooling for PostgreSQL (e.g., PgBouncer)
- [ ] Enable SSL/TLS for database connections
- [ ] Regular backups (daily recommended)
- [ ] Database credentials in environment variables only

### Application

- ✅ Environment variables via `$env/dynamic/private` (SvelteKit best practice)
- ✅ CORS handled by SvelteKit
- ✅ Input validation with Zod schemas

**Production Checklist:**

- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (handled by hosting platform)
- [ ] Configure CSP headers if needed
- [ ] Monitor error logs

## Database Management

### Initial Setup

```bash
# Generate Prisma Client
npm run db:generate

# Create/update database schema
npm run db:push
```

### Migrations (Production)

For production databases, use migrations instead of `db:push`:

```bash
# Create migration
npx prisma migrate dev --name initial_setup

# Apply migrations in production
npx prisma migrate deploy
```

### Backup & Restore

**PostgreSQL:**

```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

**SQLite:**

```bash
# Backup
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db

# Restore
cp prisma/backup-20240101.db prisma/dev.db
```

## Monitoring & Logging

### Application Logs

SvelteKit logs to stdout/stderr. Configure your platform:

- **Vercel:** Automatic log streaming in dashboard
- **Docker:** `docker logs <container-id>`
- **Railway/Render:** Built-in log viewer

### Database Monitoring

- **Neon:** Built-in monitoring dashboard
- **Supabase:** Database health metrics
- **Self-hosted:** Use pg_stat_statements, pgAdmin, or Grafana

### Error Tracking

Consider integrating:

- **Sentry:** `@sentry/sveltekit`
- **LogRocket:** Session replay
- **Datadog:** Full-stack monitoring

## Performance Optimization

### Database

- Create indexes on frequently queried columns
- Use connection pooling
- Optimize Prisma queries (select only needed fields)

### Application

- Enable SvelteKit prerendering for static pages
- Use route-level data loading (`+page.server.ts`)
- Compress images before storage
- Enable gzip/brotli compression (handled by hosting)

### Caching

Consider adding:

- Redis for session storage (replace in-memory sessions)
- CDN for static assets (images, fonts)
- Browser caching headers

## Scaling Considerations

### Horizontal Scaling

The application is stateless except for in-memory sessions. To scale:

1. **Option A:** Use Redis for session storage
   ```typescript
   // Replace src/lib/server/adminSessions.ts with Redis implementation
   ```

2. **Option B:** Sticky sessions at load balancer

### Database Scaling

- **Read replicas:** For read-heavy workloads
- **Connection pooling:** Use PgBouncer or Prisma Data Proxy
- **Vertical scaling:** Increase database resources as needed

### File Storage

For large deployments, consider external storage:

- **AWS S3:** Store page images
- **Cloudflare R2:** Cost-effective alternative
- **Vercel Blob:** Integrated blob storage

## Troubleshooting

### Common Issues

**"Cannot find module '.prisma/client'"**

```bash
npm run db:generate
```

**Database connection errors**

- Check `DATABASE_URL` format
- Verify database is accessible
- Check firewall rules

**Session issues**

- Clear cookies
- Check `ADMIN_SESSION_TTL_MS`
- Verify server time is correct

**Build failures**

```bash
# Clear cache
rm -rf .svelte-kit node_modules
npm install
npm run db:generate
npm run build
```

## Support & Resources

- **Repository:** [GitHub](https://github.com/your-org/comic-trans-studio)
- **SvelteKit Docs:** https://kit.svelte.dev
- **Prisma Docs:** https://prisma.io/docs
- **Fabric.js Docs:** http://fabricjs.com/docs

## License

See LICENSE file in repository.
