# 🚀 Deploying NoteBotLM to Vercel with Docker

This guide will help you deploy your NoteBotLM application to Vercel for free using Docker. Since your app uses multiple services, we'll need to replace local Docker services with cloud alternatives.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [https://vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Cloud Services**: Set up external services (see EXTERNAL_SERVICES.md)

## 🔧 Step 1: Set Up External Services

Since Vercel doesn't support multi-container Docker deployments on the free tier, replace local services:

### 1.1 Redis/Valkey → Upstash Redis (Free)

1. Go to [https://upstash.com](https://upstash.com)
2. Create account and new Redis database
3. Copy the connection details

### 1.2 Qdrant → Qdrant Cloud (Free tier available)

1. Go to [https://cloud.qdrant.io](https://cloud.qdrant.io)
2. Create account and free cluster
3. Copy the URL and API key

### 1.3 PostgreSQL → Supabase (Already configured) ✅

## 🔧 Step 2: Prepare Your Code

The following files have been created/updated for Vercel deployment:

### Files Created:

- `Dockerfile` - Multi-stage Docker build
- `.dockerignore` - Excludes unnecessary files
- `vercel.json` - Vercel configuration
- `EXTERNAL_SERVICES.md` - External services setup guide

### Files Updated:

- `next.config.js` - Added standalone output
- `package.json` - Added Docker and production scripts

## 🔧 Step 3: Update Environment Variables

Create a `.env.production` file or set these in Vercel dashboard:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/[database]
DIRECT_URL=postgresql://postgres:[password]@[host]:[port]/[database]

# Authentication
AUTH_SECRET=your-super-secret-auth-key
NEXTAUTH_URL=https://your-app-name.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-api-key

# Supabase
SUPABASE_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Redis (Upstash)
REDIS_HOST=your-upstash-host
REDIS_PORT=6379
REDIS_URL=redis://your-upstash-connection-url

# Qdrant Cloud
QDRANT_URL=https://your-cluster.qdrant.cloud
QDRANT_API_KEY=your-qdrant-api-key

# HuggingFace
HUGGINGFACE_API_KEY=your-hf-api-key

# Production
NODE_ENV=production
SKIP_ENV_VALIDATION=1
NEXT_TELEMETRY_DISABLED=1
```

## 🚀 Step 4: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

### Option B: Using Vercel Dashboard

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variables**:
   - In project settings, add all environment variables from step 3

4. **Deploy**:
   - Click "Deploy"

## 🔧 Step 5: Post-Deployment Configuration

### 5.1 Database Migration

Run database migrations on your production database:

```bash
# Using Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy
```

### 5.2 Update OAuth Callbacks

Add your Vercel URL to Google OAuth settings:

- Authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`

### 5.3 Update CORS Settings

Update Supabase CORS settings to include your Vercel domain.

## 🎯 Step 6: Test Your Deployment

1. **Check Application**:
   - Visit `https://your-app.vercel.app`
   - Test authentication
   - Test file upload
   - Test chat functionality

2. **Check Logs**:
   ```bash
   vercel logs
   ```

## 🚨 Limitations & Considerations

### Vercel Free Tier Limitations:

- **Function Duration**: 10 seconds max execution time
- **Memory**: 1024MB per function
- **File Processing**: Large PDF processing might timeout
- **Background Jobs**: Worker processes need external service

### Workarounds:

1. **File Processing**: Use chunked processing or external services
2. **Worker Jobs**: Consider serverless alternatives:
   - Vercel Edge Functions
   - External job processors (Zapier, n8n)
   - Process files on upload instead of background

### Cost Optimization:

- **Upstash Redis**: Free tier (10K commands/day)
- **Qdrant Cloud**: Free tier (1GB storage)
- **Supabase**: Free tier (500MB DB, 1GB bandwidth)
- **Vercel**: Free tier (100GB bandwidth)

## 🔧 Alternative Deployment Options

If Vercel limitations are too restrictive:

### 1. Railway (Docker Support)

```bash
railway login
railway init
railway up
```

### 2. Render (Free Docker Deploys)

```bash
# Connect GitHub repo to Render
# Use Dockerfile for deployment
```

### 3. DigitalOcean App Platform

```bash
# Deploy directly from GitHub
# Supports Docker with affordable pricing
```

## 🐛 Troubleshooting

### Common Issues:

1. **Build Timeouts**:
   - Reduce dependencies
   - Use `SKIP_ENV_VALIDATION=1`

2. **Function Timeouts**:
   - Optimize file processing
   - Use edge functions for heavy tasks

3. **Memory Issues**:
   - Optimize image sizes
   - Use streaming for large files

4. **Environment Variables**:
   - Double-check all required variables
   - Verify external service connections

### Debug Commands:

```bash
# Check build locally
npm run build

# Test Docker build
docker build -t notebot-test .
docker run -p 3000:3000 notebot-test

# Check environment
vercel env ls
```

## 📞 Support

- **Vercel Issues**: [Vercel Discord](https://discord.gg/vercel)
- **Next.js Issues**: [Next.js GitHub](https://github.com/vercel/next.js)
- **External Services**: Check respective documentation

---

**🎉 Congratulations!** Your NoteBotLM application should now be deployed on Vercel with Docker support!
