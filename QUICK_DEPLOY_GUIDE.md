# 🚀 Quick Deploy to Vercel - 5 Minute Guide

## 🎯 The Essentials (What You MUST Do)

### ⏰ Before You Start (10 minutes)

#### 1. Set Up Upstash Redis

```
1. Go to: https://console.upstash.com
2. Sign up with GitHub
3. Create database → Regional → Name: "notebot-redis"
4. Copy these 4 values:
   ✓ REST URL
   ✓ REST Token
   ✓ Endpoint (for REDIS_HOST)
   ✓ Port: 6379
```

#### 2. Set Up Qdrant Cloud

```
1. Go to: https://cloud.qdrant.io
2. Sign up
3. Create cluster → Free tier → Name: "notebot-vectors"
4. Copy these 2 values:
   ✓ Cluster URL (includes :6333)
   ✓ API Key
```

#### 3. Push Your Code

```bash
cd /Users/adarshsingh/Desktop/Personal\ Projects/NoteBotLM
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

### 🚀 Deploy (5 minutes)

#### Step 1: Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Connect GitHub
3. Import **NoteBotLM** repository
4. **DON'T CLICK DEPLOY YET!**

#### Step 2: Add Environment Variables (The Critical Part!)

Click "Environment Variables" and add these **25 variables**:

**Quick Copy-Paste Format:**

```env
# Auth (3)
AUTH_SECRET=9NPhCRHAaVmyYlERbC4rSbup8CIyhqKNfjtalLfuK9Q=
NEXTAUTH_URL=https://YOUR-PROJECT-NAME.vercel.app
NODE_ENV=production

# Database (2)
DATABASE_URL=postgresql://postgres:Adarsh8468024985@db.bnwdrpiwvcpqixexnkgv.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:Adarsh8468024985@db.bnwdrpiwvcpqixexnkgv.supabase.co:5432/postgres

# Google (3)
GOOGLE_CLIENT_ID=847594701051-df1hnnpokrgra2vqcd5lovp8urns2au3.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyCLSvABDx2Fae9drgEsxZ7JRDb7fRFRee0

# Supabase (5)
NEXT_PUBLIC_SUPABASE_URL=https://bnwdrpiwvcpqixexnkgv.supabase.co
SUPABASE_URL=https://bnwdrpiwvcpqixexnkgv.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2RycGl3dmNwcWl4ZXhua2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjAwMzgsImV4cCI6MjA3MTY5NjAzOH0.6uhO4LP_ySfj_dXQwPmFlnJkeBdzR5P-vVDSUGM0Jbo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2RycGl3dmNwcWl4ZXhua2d2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjEyMDAzOCwiZXhwIjoyMDcxNjk2MDM4fQ.yDI0osH6YgaaZ26FWaAazp08pOajpfSuuJ0Gi4T5JCE
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2RycGl3dmNwcWl4ZXhua2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjAwMzgsImV4cCI6MjA3MTY5NjAzOH0.6uhO4LP_ySfj_dXQwPmFlnJkeBdzR5P-vVDSUGM0Jbo

# Upstash Redis (4) - USE YOUR VALUES FROM STEP 1
UPSTASH_REDIS_REST_URL=YOUR_UPSTASH_REST_URL
UPSTASH_REDIS_REST_TOKEN=YOUR_UPSTASH_REST_TOKEN
REDIS_HOST=YOUR_UPSTASH_ENDPOINT
REDIS_PORT=6379

# Qdrant (2) - USE YOUR VALUES FROM STEP 2
QDRANT_URL=YOUR_QDRANT_CLUSTER_URL
QDRANT_API_KEY=YOUR_QDRANT_API_KEY

# HuggingFace (1)
HUGGINGFACE_API_KEY=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

# Build (2)
SKIP_ENV_VALIDATION=1
NEXT_TELEMETRY_DISABLED=1
```

⚠️ **IMPORTANT:** Replace these with YOUR values:

- `YOUR-PROJECT-NAME` in NEXTAUTH_URL
- All `YOUR_UPSTASH_*` values
- All `YOUR_QDRANT_*` values

#### Step 3: Deploy

1. Click **"Deploy"** 🚀
2. Wait 3-5 minutes
3. Get your URL: `https://your-project.vercel.app`

---

### 🔧 After First Deploy (5 minutes)

#### 1. Update NEXTAUTH_URL

```
1. Copy your actual Vercel URL
2. Go to Project → Settings → Environment Variables
3. Edit NEXTAUTH_URL
4. Replace with actual URL
5. Redeploy
```

#### 2. Update Google OAuth

```
1. Go to: https://console.cloud.google.com
2. APIs & Services → Credentials
3. Click your OAuth Client ID
4. Add to Authorized redirect URIs:
   https://your-actual-url.vercel.app/api/auth/callback/google
5. Save
```

#### 3. Run Migrations

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link
vercel login
vercel link

# Pull env and migrate
vercel env pull .env.production
npx prisma migrate deploy
```

---

## ✅ Test Your App

Visit: `https://your-project.vercel.app`

1. ✅ Homepage loads
2. ✅ Click "Sign In" → Google OAuth works
3. ✅ Can upload PDF
4. ✅ Can create chat
5. ✅ AI responds

---

## 🆘 If Something Breaks

| Problem                | Solution                         |
| ---------------------- | -------------------------------- |
| **Build fails**        | Check Vercel logs                |
| **Auth doesn't work**  | Update Google OAuth redirect URI |
| **Can't upload files** | Check Supabase storage settings  |
| **Chat doesn't work**  | Check Vercel function logs       |
| **Timeout errors**     | Large PDFs may exceed 10s limit  |

**Check logs:** Vercel Dashboard → Your Project → Logs

---

## 📊 Monitor Your Free Tier Limits

| Service  | Limit                   | Dashboard              |
| -------- | ----------------------- | ---------------------- |
| Vercel   | 100GB bandwidth/month   | vercel.com/dashboard   |
| Upstash  | 10K commands/day        | console.upstash.com    |
| Qdrant   | 1GB storage             | cloud.qdrant.io        |
| Supabase | 500MB DB, 1GB bandwidth | supabase.com/dashboard |

---

## 🎉 That's It!

Your NoteBotLM is live at: **https://your-project.vercel.app**

**Bookmark these:**

- 📱 Your App
- 🎛️ [Vercel Dashboard](https://vercel.com/dashboard)
- 🔴 [Upstash Console](https://console.upstash.com)
- 🔍 [Qdrant Cloud](https://cloud.qdrant.io)
- 💾 [Supabase Dashboard](https://supabase.com/dashboard)

---

## 📚 Full Guides Available

For detailed step-by-step with screenshots:

- `VERCEL_DEPLOYMENT_DASHBOARD_GUIDE.md` - Complete guide
- `DEPLOYMENT_CHECKLIST.md` - Printable checklist
- `ENVIRONMENT_VARIABLES.md` - All env var documentation

---

**Need help?** Check the full guide or Vercel logs for detailed error messages.
