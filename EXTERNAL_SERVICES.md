# External Services Setup for Vercel Deployment

Since Vercel's free tier doesn't support running Docker containers with multiple services, you'll need to replace your local Docker services with cloud alternatives.

## 1. Database (Already using Supabase) ✅

Your app is already configured to use Supabase PostgreSQL, which is perfect for Vercel deployment.

## 2. Redis/Valkey Replacement

For the job queue functionality, you have several free options:

### Option A: Upstash Redis (Recommended - Free Tier)

1. Sign up at [https://upstash.com/](https://upstash.com/)
2. Create a new Redis database
3. Get the connection URL
4. Update your environment variables:
   ```
   REDIS_HOST=your-upstash-redis-url (without redis://)
   REDIS_PORT=6379
   REDIS_URL=your-complete-upstash-redis-url
   ```

### Option B: Railway Redis

1. Sign up at [https://railway.app/](https://railway.app/)
2. Deploy a Redis service
3. Get the connection details

### Option C: Redis Labs (RedisCloud)

1. Sign up at [https://redislabs.com/](https://redislabs.com/)
2. Create a free subscription
3. Get connection details

## 3. Qdrant Vector Database Replacement

### Option A: Qdrant Cloud (Recommended)

1. Sign up at [https://cloud.qdrant.io/](https://cloud.qdrant.io/)
2. Create a free cluster (1GB free tier)
3. Update environment variable:
   ```
   QDRANT_URL=https://your-cluster-url.qdrant.cloud
   QDRANT_API_KEY=your-api-key
   ```

### Option B: Weaviate Cloud

1. Sign up at [https://console.weaviate.cloud/](https://console.weaviate.cloud/)
2. Create a free cluster
3. You'll need to modify your vector search code to use Weaviate instead of Qdrant

### Option C: Pinecone

1. Sign up at [https://www.pinecone.io/](https://www.pinecone.io/)
2. Create a free index
3. You'll need to modify your vector search code to use Pinecone instead of Qdrant

## 4. Disable Worker in Vercel Build

Since Vercel functions have limitations, you might need to:

1. **Option A**: Disable the worker for Vercel and handle file processing synchronously
2. **Option B**: Use Vercel Edge Functions or API routes for processing
3. **Option C**: Use external services like Zapier or n8n for job processing

## Environment Variables for Vercel

After setting up external services, add these to your Vercel project:

```bash
# Database (Already configured)
DATABASE_URL=your-supabase-connection-string
DIRECT_URL=your-supabase-direct-connection-string

# Authentication
AUTH_SECRET=your-auth-secret
NEXTAUTH_URL=https://your-vercel-app.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-api-key

# Supabase
SUPABASE_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Redis (Upstash or alternative)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_URL=your-redis-connection-url

# Qdrant (Cloud or alternative)
QDRANT_URL=https://your-qdrant-cluster.qdrant.cloud
QDRANT_API_KEY=your-qdrant-api-key

# HuggingFace
HUGGINGFACE_API_KEY=your-huggingface-api-key

# Production flag
NODE_ENV=production
SKIP_ENV_VALIDATION=1
```

## Code Modifications Needed

You may need to update your worker configuration to handle cloud services:

1. Update Redis connection in `src/server/api/routers/chat/helper.ts`
2. Update Qdrant connection in `src/server/api/routers/chat/worker.ts`
3. Consider adding authentication for cloud services
