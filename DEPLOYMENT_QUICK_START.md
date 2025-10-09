# 🚀 Deploy NoteBotLM to Vercel - Quick Start Guide

Your Redis and Qdrant services are already configured! Here's how to deploy:

## 📋 Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## 🔐 Step 2: Login to Vercel

```bash
vercel login
```

## ⚙️ Step 3: Set Environment Variables

You have two options:

### Option A: Use Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Connect your GitHub repository
3. Add these environment variables in project settings:

```bash
# Authentication (Generate new secret)
AUTH_SECRET=your-new-auth-secret
NEXTAUTH_URL=https://your-app-name.vercel.app

# Database (Your Supabase credentials)
DATABASE_URL=your-supabase-connection-string
DIRECT_URL=your-supabase-direct-connection-string

# Google OAuth (Your credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-api-key

# Supabase (Your credentials)
SUPABASE_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Upstash Redis (✅ Already configured)
UPSTASH_REDIS_REST_URL=https://accepted-trout-10015.upstash.io
UPSTASH_REDIS_REST_TOKEN=AScfAAIncDI5NmI1YjU5NTBlNWM0YTUxOTU4M2YyMWZhMzQwMGQxZHAyMTAwMTU
REDIS_HOST=accepted-trout-10015.upstash.io
REDIS_PORT=6379

# Qdrant Cloud (✅ Already configured)
QDRANT_URL=https://d2b48889-0f83-41a5-8aba-dd62225f6135.eu-west-1-0.aws.cloud.qdrant.io:6333
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.yTmaUd_-YKNWK3_8-yBUviunSeMaHjt03E3DimczHno

# HuggingFace (Your API key)
HUGGINGFACE_API_KEY=your-huggingface-api-key

# Production flags
NODE_ENV=production
SKIP_ENV_VALIDATION=1
NEXT_TELEMETRY_DISABLED=1
```

### Option B: Use CLI

```bash
# Set each variable individually
vercel env add AUTH_SECRET
vercel env add DATABASE_URL
vercel env add GOOGLE_CLIENT_ID
# ... continue for all variables
```

## 🚀 Step 4: Deploy

```bash
# Quick deploy using the script
./deploy.sh

# OR manual deploy
vercel --prod
```

## 📋 Step 5: Post-Deployment Setup

### 5.1 Generate AUTH_SECRET

```bash
npx auth secret
```

Copy this value to your Vercel environment variables.

### 5.2 Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`

### 5.3 Update Supabase CORS

1. Go to your Supabase dashboard
2. Navigate to Settings > API
3. Add your Vercel domain to allowed origins

### 5.4 Run Database Migrations

```bash
# Pull environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy
```

## 🎯 Step 6: Test Your Deployment

1. **Visit your app**: `https://your-app.vercel.app`
2. **Test authentication**: Login with Google
3. **Test file upload**: Upload a PDF document
4. **Test chat**: Ask questions about your document

## 🐛 Troubleshooting

### Common Issues:

1. **Function Timeout**: If file processing times out, the worker will handle it asynchronously
2. **Redis Connection**: Check Upstash dashboard for connection issues
3. **Qdrant Connection**: Verify your cluster is active in Qdrant Cloud
4. **OAuth Errors**: Ensure redirect URIs are correctly set

### Debug Commands:

```bash
# Check deployment logs
vercel logs

# Check environment variables
vercel env ls

# Redeploy if needed
vercel --prod --force
```

## 📊 Monitor Your Deployment

- **Vercel Analytics**: Monitor performance and usage
- **Upstash Dashboard**: Monitor Redis usage (10K commands/day free)
- **Qdrant Cloud**: Monitor vector database usage (1GB free)
- **Supabase Dashboard**: Monitor database and storage usage

## 🎉 You're Done!

Your NoteBotLM app is now deployed on Vercel with:

- ✅ Upstash Redis for job queuing
- ✅ Qdrant Cloud for vector search
- ✅ Supabase for database and file storage
- ✅ Vercel for hosting and deployment

**🔗 Share your app**: Your deployment URL will be `https://your-app-name.vercel.app`
