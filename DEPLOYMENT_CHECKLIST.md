# ✅ Vercel Deployment Checklist

Use this checklist to ensure you don't miss any steps!

## 📋 Pre-Deployment (Do These First)

### External Services Setup

- [ ] **Upstash Redis**
  - [ ] Create account at console.upstash.com
  - [ ] Create new database
  - [ ] Copy REST URL → `UPSTASH_REDIS_REST_URL`
  - [ ] Copy REST Token → `UPSTASH_REDIS_REST_TOKEN`
  - [ ] Copy Endpoint → `REDIS_HOST`
  - [ ] Note Port (6379) → `REDIS_PORT`

- [ ] **Qdrant Cloud**
  - [ ] Create account at cloud.qdrant.io
  - [ ] Create new cluster (free tier)
  - [ ] Copy Cluster URL → `QDRANT_URL`
  - [ ] Create & copy API Key → `QDRANT_API_KEY`

- [ ] **Verify Supabase** (already set up)
  - [ ] Database is accessible
  - [ ] Storage bucket exists
  - [ ] All keys are valid

### Code Preparation

- [ ] All code committed to Git
- [ ] Pushed to GitHub main branch
- [ ] `postcss.config.js` is configured
- [ ] `next.config.js` has `output: 'standalone'`

---

## 🚀 Vercel Dashboard Deployment

### Project Setup

- [ ] Logged into vercel.com/dashboard
- [ ] Clicked "Add New" → "Project"
- [ ] Connected GitHub account
- [ ] Imported NoteBotLM repository
- [ ] Framework detected as Next.js

### Environment Variables (25 total)

#### Authentication (3)

- [ ] `AUTH_SECRET`
- [ ] `NEXTAUTH_URL` (use https://your-project.vercel.app)
- [ ] `NODE_ENV` = production

#### Database (2)

- [ ] `DATABASE_URL`
- [ ] `DIRECT_URL`

#### Google (3)

- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_GENERATIVE_AI_API_KEY`

#### Supabase (5)

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Redis/Upstash (4)

- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`
- [ ] `REDIS_HOST`
- [ ] `REDIS_PORT`

#### Qdrant (2)

- [ ] `QDRANT_URL`
- [ ] `QDRANT_API_KEY`

#### HuggingFace (1)

- [ ] `HUGGINGFACE_API_KEY`

#### Build Flags (2)

- [ ] `SKIP_ENV_VALIDATION` = 1
- [ ] `NEXT_TELEMETRY_DISABLED` = 1

### Deploy

- [ ] Clicked "Deploy" button
- [ ] Build completed successfully (3-5 minutes)
- [ ] Got deployment URL
- [ ] Can access the site

---

## 🔧 Post-Deployment Configuration

### Update NEXTAUTH_URL

- [ ] Got actual Vercel URL
- [ ] Updated `NEXTAUTH_URL` in env variables
- [ ] Redeployed the application

### Google OAuth Setup

- [ ] Opened Google Cloud Console
- [ ] Navigated to Credentials
- [ ] Added Vercel URL to Authorized redirect URIs:
  - [ ] `https://your-url.vercel.app/api/auth/callback/google`
- [ ] Saved changes

### Supabase CORS

- [ ] Opened Supabase dashboard
- [ ] Went to Settings → API
- [ ] Added Vercel URL to CORS configuration
- [ ] Saved changes

### Database Migrations

Choose one method (see [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) for detailed instructions):

- [ ] **Method A (Recommended):** Used Vercel CLI + `prisma migrate deploy`

  ```bash
  vercel login
  vercel link
  vercel env pull .env.production
  npx prisma migrate deploy
  ```

- [ ] **Method B (Manual):** Ran migrations manually in Supabase SQL Editor
  - [ ] Created `_prisma_migrations` table
  - [ ] Ran all 5 migration SQL files in order
  - [ ] Verified all tables exist

---

## 🧪 Testing

### Basic Functionality

- [ ] Homepage loads without errors
- [ ] Styling looks correct
- [ ] No console errors

### Authentication

- [ ] Sign in button works
- [ ] Google OAuth popup appears
- [ ] Can sign in successfully
- [ ] Redirected to dashboard after sign in

### Features

- [ ] Can navigate to chat page
- [ ] Can upload PDF files
- [ ] Files appear in file list
- [ ] Can create new chat
- [ ] Can send messages
- [ ] AI responds correctly
- [ ] Can select documents for chat

### Logs & Monitoring

- [ ] Checked Vercel logs for errors
- [ ] Verified no critical errors
- [ ] All API routes responding

---

## 🎯 Final Steps

### Documentation

- [ ] Noted deployment URL
- [ ] Saved environment variables securely
- [ ] Updated README with deployment info

### Monitoring Setup

- [ ] Bookmarked Vercel dashboard
- [ ] Bookmarked Upstash dashboard
- [ ] Bookmarked Qdrant dashboard
- [ ] Bookmarked Supabase dashboard

### Optional (But Recommended)

- [ ] Set up custom domain (if desired)
- [ ] Configure deployment notifications
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Document for team members

---

## 📊 Service Limits to Monitor

### Vercel Free Tier

- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ⚠️ 10s serverless function timeout
- ⚠️ 1024MB function memory

### Upstash Free Tier

- ✅ 10,000 commands/day
- ✅ 256 MB storage
- ⚠️ Monitor daily usage

### Qdrant Free Tier

- ✅ 1 GB vector storage
- ✅ Unlimited requests
- ⚠️ Monitor storage usage

### Supabase Free Tier

- ✅ 500 MB database
- ✅ 1 GB bandwidth
- ✅ 2 GB file storage
- ⚠️ Monitor all three

---

## 🚨 Troubleshooting Quick Reference

| Issue               | Check                                        |
| ------------------- | -------------------------------------------- |
| Build fails         | Check build logs, verify `postcss.config.js` |
| 404 on routes       | Check `next.config.js` configuration         |
| Auth fails          | Verify `NEXTAUTH_URL` and Google OAuth URIs  |
| DB errors           | Check `DATABASE_URL` and Supabase status     |
| Redis errors        | Verify Upstash credentials                   |
| Vector search fails | Check Qdrant URL and API key                 |
| PDF upload fails    | Check Supabase storage settings              |
| Timeout errors      | Large files may exceed 10s limit             |

---

## ✅ Deployment Complete!

When all boxes are checked, your NoteBotLM is successfully deployed! 🎉

**Important URLs:**

- **App:** https://your-project.vercel.app
- **Dashboard:** https://vercel.com/dashboard
- **Upstash:** https://console.upstash.com
- **Qdrant:** https://cloud.qdrant.io
- **Supabase:** https://supabase.com/dashboard

**Next Steps:**

1. Share with users
2. Monitor performance
3. Watch service usage limits
4. Upgrade if needed

---

**Date Deployed:** **\*\***\_**\*\***

**Deployment URL:** **\*\***\_**\*\***

**Notes:**

---

---

---
