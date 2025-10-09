# 🚀 Deploy NoteBotLM to Vercel - Complete Dashboard Guide

This is your step-by-step guide to deploy NoteBotLM on Vercel using only the Vercel Dashboard (no CLI needed).

## 📋 Pre-Deployment Checklist

Before starting, ensure you have:

- ✅ GitHub account with your code pushed
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ All environment variables ready (see `.env` file)

---

## 🎯 Phase 1: Set Up External Services (Required for Production)

Your app uses services that need cloud alternatives for Vercel:

### 1️⃣ Upstash Redis (Replaces local Redis)

**Why:** For BullMQ job queue (PDF processing)

1. Go to [console.upstash.com](https://console.upstash.com)
2. Sign up/Login with GitHub
3. Click **"Create Database"**
4. Choose:
   - **Type:** Regional
   - **Name:** notebot-redis
   - **Region:** Choose closest to your users (e.g., us-east-1)
5. Click **"Create"**
6. On database page, copy:
   - **REST URL** → Save as `UPSTASH_REDIS_REST_URL`
   - **REST Token** → Save as `UPSTASH_REDIS_REST_TOKEN`
7. In **"Details"** tab, also note:
   - **Endpoint** → Save as `REDIS_HOST` (remove `redis://` and port)
   - **Port** → Should be `6379` for `REDIS_PORT`

### 2️⃣ Qdrant Cloud (Vector Database)

**Why:** For storing PDF embeddings and semantic search

1. Go to [cloud.qdrant.io](https://cloud.qdrant.io)
2. Sign up/Login
3. Click **"Create Cluster"**
4. Choose:
   - **Name:** notebot-vectors
   - **Cloud:** AWS (or your preference)
   - **Region:** Same as Upstash if possible
   - **Plan:** Free tier (1GB)
5. Click **"Create"**
6. Wait for cluster to be ready (2-3 minutes)
7. Click on your cluster, then **"API Keys"**
8. Click **"Create API Key"**
9. Copy:
   - **Cluster URL** → Save as `QDRANT_URL` (includes `:6333`)
   - **API Key** → Save as `QDRANT_API_KEY`

### 3️⃣ Supabase (Already Set Up) ✅

You already have:

- ✅ DATABASE_URL
- ✅ SUPABASE_URL
- ✅ SUPABASE_SERVICE_ROLE_KEY

---

## 🎯 Phase 2: Prepare Your Repository

### Step 1: Ensure Latest Code is Pushed

```bash
# In your terminal
cd /Users/adarshsingh/Desktop/Personal\ Projects/NoteBotLM

# Check status
git status

# If you have changes, commit them
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Verify Critical Files Exist

Check that these files are in your repository:

- ✅ `next.config.js` - Has `output: 'standalone'`
- ✅ `package.json` - Has build scripts
- ✅ `postcss.config.js` - Has Tailwind config
- ✅ `prisma/schema.prisma` - Database schema

---

## 🎯 Phase 3: Deploy to Vercel Dashboard

### Step 1: Create New Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. If GitHub not connected:
   - Click **"Connect GitHub Account"**
   - Authorize Vercel
   - Select repositories you want to access
5. Find **"NoteBotLM"** repository
6. Click **"Import"**

### Step 2: Configure Project Settings

**Framework Preset:**

- Should auto-detect as **"Next.js"** ✅

**Root Directory:**

- Leave as `./` (root)

**Build Settings:**

- **Build Command:** `npm run build` (should be auto-filled)
- **Output Directory:** `.next` (should be auto-filled)
- **Install Command:** `npm install` (should be auto-filled)

**Don't click Deploy yet!** We need to add environment variables first.

### Step 3: Add Environment Variables

Click on **"Environment Variables"** section (expand if collapsed).

Add each variable below by:

1. Typing the **Name** (e.g., `AUTH_SECRET`)
2. Pasting the **Value** from your `.env` file
3. Select environment: **Production**, **Preview**, **Development** (check all 3)
4. Click **"Add"**

#### 🔐 Authentication Variables (3)

```
Name: AUTH_SECRET
Value: 9NPhCRHAaVmyYlERbC4rSbup8CIyhqKNfjtalLfuK9Q=
```

```
Name: NEXTAUTH_URL
Value: https://YOUR-PROJECT-NAME.vercel.app
Note: Replace YOUR-PROJECT-NAME with the name shown in Vercel
```

```
Name: NODE_ENV
Value: production
```

#### 💾 Database Variables (2)

```
Name: DATABASE_URL
Value: postgresql://postgres:Adarsh8468024985@db.bnwdrpiwvcpqixexnkgv.supabase.co:5432/postgres
```

```
Name: DIRECT_URL
Value: postgresql://postgres:Adarsh8468024985@db.bnwdrpiwvcpqixexnkgv.supabase.co:5432/postgres
```

#### 🔑 Google Variables (3)

```
Name: GOOGLE_CLIENT_ID
Value: 847594701051-df1hnnpokrgra2vqcd5lovp8urns2au3.apps.googleusercontent.com
```

```
Name: GOOGLE_CLIENT_SECRET
Value: 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
```

```
Name: GOOGLE_GENERATIVE_AI_API_KEY
Value: AIzaSyCLSvABDx2Fae9drgEsxZ7JRDb7fRFRee0
```

#### 📦 Supabase Variables (5)

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://bnwdrpiwvcpqixexnkgv.supabase.co
```

```
Name: SUPABASE_URL
Value: https://bnwdrpiwvcpqixexnkgv.supabase.co
```

```
Name: SUPABASE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2RycGl3dmNwcWl4ZXhua2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjAwMzgsImV4cCI6MjA3MTY5NjAzOH0.6uhO4LP_ySfj_dXQwPmFlnJkeBdzR5P-vVDSUGM0Jbo
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2RycGl3dmNwcWl4ZXhua2d2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjEyMDAzOCwiZXhwIjoyMDcxNjk2MDM4fQ.yDI0osH6YgaaZ26FWaAazp08pOajpfSuuJ0Gi4T5JCE
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2RycGl3dmNwcWl4ZXhua2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjAwMzgsImV4cCI6MjA3MTY5NjAzOH0.6uhO4LP_ySfj_dXQwPmFlnJkeBdzR5P-vVDSUGM0Jbo
```

#### 🔴 Redis/Upstash Variables (4)

**Use the values you got from Upstash in Phase 1:**

```
Name: UPSTASH_REDIS_REST_URL
Value: [YOUR UPSTASH REST URL from Phase 1]
```

```
Name: UPSTASH_REDIS_REST_TOKEN
Value: [YOUR UPSTASH REST TOKEN from Phase 1]
```

```
Name: REDIS_HOST
Value: [YOUR UPSTASH ENDPOINT from Phase 1]
```

```
Name: REDIS_PORT
Value: 6379
```

#### 🔍 Qdrant Variables (2)

**Use the values you got from Qdrant in Phase 1:**

```
Name: QDRANT_URL
Value: [YOUR QDRANT CLUSTER URL from Phase 1]
```

```
Name: QDRANT_API_KEY
Value: [YOUR QDRANT API KEY from Phase 1]
```

#### 🤗 HuggingFace Variable (1)

```
Name: HUGGINGFACE_API_KEY
Value: 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
```

#### ⚙️ Build Flags (2)

```
Name: SKIP_ENV_VALIDATION
Value: 1
```

```
Name: NEXT_TELEMETRY_DISABLED
Value: 1
```

**Total: 25 environment variables**

### Step 4: Deploy!

1. Double-check all environment variables are added
2. Scroll to bottom
3. Click **"Deploy"** button 🚀
4. Wait 3-5 minutes for build to complete

---

## 🎯 Phase 4: Post-Deployment Configuration

### Step 1: Get Your Vercel URL

After deployment completes:

1. You'll see: **"Congratulations! Your project has been deployed."**
2. Note your URL: `https://your-project-name.vercel.app`
3. Click **"Visit"** to see your app

### Step 2: Update NEXTAUTH_URL

1. In Vercel dashboard, go to your project
2. Click **"Settings"** tab
3. Click **"Environment Variables"**
4. Find `NEXTAUTH_URL`
5. Click **"Edit"**
6. Update value to your actual Vercel URL: `https://your-actual-url.vercel.app`
7. Click **"Save"**
8. Go to **"Deployments"** tab
9. Click **"..."** on latest deployment → **"Redeploy"**

### Step 3: Update Google OAuth Redirect URIs

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **"Authorized redirect URIs"**, add:
   ```
   https://your-actual-url.vercel.app/api/auth/callback/google
   ```
6. Click **"Save"**

### Step 4: Update Supabase CORS (if needed)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Scroll to **"CORS Configuration"**
5. Add your Vercel URL: `https://your-actual-url.vercel.app`
6. Click **"Save"**

### Step 5: Run Database Migrations

Since Prisma migrations need to run:

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Pull production environment
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy
```

**Option B: Using Supabase SQL Editor**

1. Go to Supabase Dashboard → SQL Editor
2. Run your migration SQL files manually from `prisma/migrations/`

---

## 🎯 Phase 5: Test Your Deployment

### Checklist:

1. **Homepage Loads:**
   - ✅ Visit `https://your-url.vercel.app`
   - ✅ No build errors
   - ✅ Styling looks correct

2. **Authentication Works:**
   - ✅ Click "Sign In"
   - ✅ Google OAuth popup appears
   - ✅ Can sign in successfully
   - ✅ Redirected to dashboard

3. **File Upload Works:**
   - ✅ Can upload PDF files
   - ✅ Files appear in Supabase storage
   - ✅ Processing completes (check Upstash Redis for jobs)

4. **Chat Works:**
   - ✅ Can create new chat
   - ✅ Can send messages
   - ✅ AI responds correctly
   - ✅ Can select documents

5. **Check Logs:**
   - In Vercel dashboard → **"Logs"** tab
   - Look for any errors

---

## 🚨 Common Issues & Solutions

### Issue 1: Build Failed with "Cannot find module '@tailwindcss/postcss'"

**Solution:** Already fixed! Your `postcss.config.js` is configured correctly.

### Issue 2: "Authentication callback error"

**Solution:**

- Make sure `NEXTAUTH_URL` matches your actual Vercel URL
- Verify Google OAuth redirect URI includes your Vercel URL

### Issue 3: "Database connection failed"

**Solution:**

- Verify `DATABASE_URL` is correct
- Check Supabase database is running
- Ensure IP allowlisting in Supabase allows all (or add Vercel IPs)

### Issue 4: "Redis connection timeout"

**Solution:**

- Verify Upstash credentials are correct
- Check that both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set

### Issue 5: "Qdrant connection failed"

**Solution:**

- Verify Qdrant cluster is running
- Check `QDRANT_URL` and `QDRANT_API_KEY` are correct

### Issue 6: "PDF processing not working"

**Solution:**

- Vercel functions have 10s timeout on free tier
- Large PDFs might need optimization
- Consider processing in smaller chunks

---

## 📊 Monitoring Your Deployment

### Vercel Dashboard Features:

1. **Deployments:** See all deployment history
2. **Logs:** Real-time and historical logs
3. **Analytics:** Traffic and performance metrics (pro plan)
4. **Environment Variables:** Manage all env vars
5. **Domains:** Add custom domains

### Check Service Health:

1. **Upstash Redis:**
   - Dashboard shows requests/day
   - Monitor usage against free tier (10K/day)

2. **Qdrant Cloud:**
   - Dashboard shows storage usage
   - Monitor against 1GB limit

3. **Supabase:**
   - Dashboard shows DB size, bandwidth
   - Monitor against 500MB DB / 1GB bandwidth limits

---

## 🎉 Success!

Your NoteBotLM app is now live on Vercel! 🚀

**What's next?**

- 📱 Share your app with users
- 📊 Monitor usage and performance
- 🔒 Set up custom domain (optional)
- 📈 Upgrade plans if needed
- 🐛 Monitor logs for any issues

**Your deployment URLs:**

- **Production:** `https://your-project-name.vercel.app`
- **Dashboard:** `https://vercel.com/dashboard`

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Upstash Docs](https://docs.upstash.com/)
- [Qdrant Cloud Docs](https://qdrant.tech/documentation/)

---

## 🆘 Need Help?

If you encounter issues:

1. Check **Vercel Logs** in dashboard
2. Review this guide's "Common Issues" section
3. Check **Supabase logs** for database issues
4. Review **Upstash dashboard** for Redis issues
5. Check **Qdrant dashboard** for vector DB issues

Good luck with your deployment! 🎊
