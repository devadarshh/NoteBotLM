# 🔧 Vercel Deployment Troubleshooting Guide

## 🚨 Build & Deployment Errors

### Error: "Cannot find module '@tailwindcss/postcss'"

**Symptom:**

```
Error: Cannot find module '@tailwindcss/postcss'
Failed to compile.
```

**Solution:**
✅ Already fixed! Your `postcss.config.js` is configured correctly.

**Verify:**

```javascript
// postcss.config.js should contain:
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

---

### Error: "Module not found" during build

**Symptom:**

```
Module not found: Can't resolve 'X'
```

**Solutions:**

1. Check package is in `package.json` dependencies
2. Ensure `node_modules` is not in `.vercelignore`
3. Try deleting and redeploying
4. Check import paths are correct

**Action:**

```bash
# Locally test the build
npm run build
```

---

### Error: "Build exceeded maximum duration"

**Symptom:**

```
Build exceeded maximum time limit of 45 minutes
```

**Solutions:**

1. Remove unused dependencies
2. Optimize build process
3. Check for infinite loops in build scripts
4. Upgrade Vercel plan for longer builds

---

## 🔐 Authentication Errors

### Error: "Callback URL mismatch" or OAuth fails

**Symptom:**

- Redirect after Google login fails
- "Error: invalid_request" from Google
- Stuck on authentication page

**Solutions:**

1. **Check NEXTAUTH_URL:**

```env
# Must match your actual Vercel URL (no trailing slash)
NEXTAUTH_URL=https://your-actual-project.vercel.app
```

2. **Update Google Cloud Console:**

```
1. Go to: https://console.cloud.google.com
2. APIs & Services → Credentials
3. Click your OAuth 2.0 Client ID
4. Under "Authorized redirect URIs", add:
   https://your-actual-project.vercel.app/api/auth/callback/google
5. Save changes
```

3. **Redeploy after changing:**

```
Vercel Dashboard → Your Project → Deployments → Redeploy
```

---

### Error: "NextAuth configuration error"

**Symptom:**

```
[next-auth][error][NO_SECRET]
```

**Solutions:**

1. **Verify AUTH_SECRET is set:**

```bash
# Generate new secret
npx auth secret

# Add to Vercel env vars
```

2. **Check environment variable:**

- Go to Vercel → Settings → Environment Variables
- Ensure `AUTH_SECRET` exists for Production, Preview, Development

---

## 💾 Database Errors

### Error: "Can't reach database server"

**Symptom:**

```
P1001: Can't reach database server at `db.xxx.supabase.co`
```

**Solutions:**

1. **Check Supabase is running:**

- Visit Supabase Dashboard
- Ensure project is not paused
- Check database is healthy

2. **Verify DATABASE_URL:**

```env
# Format should be:
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/postgres
```

3. **Check IP restrictions:**

- Supabase → Settings → Database → Connection Pooling
- Ensure "Restrict to trusted IPs only" is OFF
- Or add Vercel's IPs

4. **SSL Mode:**

```env
# Try adding SSL mode to DATABASE_URL
DATABASE_URL=postgresql://...?sslmode=require
```

---

### Error: "Prisma migration not applied"

**Symptom:**

```
Error: Table 'User' does not exist
```

**Solutions:**

1. **Run migrations on production database:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Pull production env
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy
```

2. **Alternative - Manual migration:**

- Go to Supabase → SQL Editor
- Copy content from `prisma/migrations/*/migration.sql`
- Run each migration in order

---

## 📦 Supabase Storage Errors

### Error: "Failed to upload file"

**Symptom:**

- Files don't upload
- Network error on upload
- 403 Forbidden

**Solutions:**

1. **Check Storage Bucket exists:**

```
Supabase Dashboard → Storage → Check "files" bucket exists
```

2. **Verify Bucket Policies:**

```sql
-- In Supabase SQL Editor, check policies
SELECT * FROM storage.policies WHERE bucket_id = 'files';

-- If needed, create public policy
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'files');
```

3. **Check CORS settings:**

```
Supabase → Settings → API → CORS Configuration
Add: https://your-project.vercel.app
```

4. **Verify environment variables:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## 🔴 Redis/Upstash Errors

### Error: "Connection to Redis failed"

**Symptom:**

```
Error: Failed to connect to Redis
ERR_INVALID_URL
```

**Solutions:**

1. **Verify Upstash credentials:**

```env
# Check these 4 variables
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxx...
REDIS_HOST=xxx.upstash.io
REDIS_PORT=6379
```

2. **Test connection:**

- Visit Upstash Dashboard
- Check database is active
- Verify credentials match

3. **Check worker.ts configuration:**

```typescript
// Should check for UPSTASH variables first
connection: process.env.UPSTASH_REDIS_REST_URL
  ? {
      host: process.env.UPSTASH_REDIS_REST_URL.replace(...)
      password: process.env.UPSTASH_REDIS_REST_TOKEN,
    }
  : {
      host: process.env.REDIS_HOST ?? "localhost",
      port: parseInt(process.env.REDIS_PORT ?? "6379"),
    }
```

---

### Error: "Queue job timeout"

**Symptom:**

- PDF processing never completes
- Jobs stuck in "waiting" state

**Solutions:**

1. **Vercel function timeout (10s limit):**

- Large PDFs may exceed limit
- Consider processing in smaller chunks
- Or use external worker service

2. **Check Upstash limits:**

- Free tier: 10,000 commands/day
- Monitor usage in Upstash Dashboard

3. **Alternative - Disable worker on Vercel:**

```typescript
// In worker.ts, add check:
if (process.env.VERCEL) {
  console.log("Worker disabled on Vercel");
  process.exit(0);
}
```

---

## 🔍 Qdrant Vector Database Errors

### Error: "Failed to connect to Qdrant"

**Symptom:**

```
Error: Connection to Qdrant failed
```

**Solutions:**

1. **Verify Qdrant credentials:**

```env
QDRANT_URL=https://xxx.cloud.qdrant.io:6333
QDRANT_API_KEY=eyJhbGc...
```

2. **Check cluster status:**

- Visit Qdrant Cloud Dashboard
- Ensure cluster is running
- Verify not paused/stopped

3. **Check URL format:**

```env
# Must include port :6333
QDRANT_URL=https://your-cluster.cloud.qdrant.io:6333
```

4. **Test API key:**

- Qdrant Dashboard → Your Cluster → API Keys
- Regenerate if needed

---

### Error: "Collection not found"

**Symptom:**

```
Error: Collection 'documents' does not exist
```

**Solutions:**

1. **Collection needs to be created:**

- First PDF upload should create it
- Or create manually via Qdrant Dashboard

2. **Check collection name matches:**

```typescript
// In worker.ts
const collectionName = "documents"; // Must match
```

---

## 🤖 AI/HuggingFace Errors

### Error: "HuggingFace API error"

**Symptom:**

```
Error: Unauthorized
Error: Rate limit exceeded
```

**Solutions:**

1. **Verify API key:**

```env
HUGGINGFACE_API_KEY=hf_xxx...
```

2. **Check key validity:**

- Visit huggingface.co/settings/tokens
- Ensure token is active
- Regenerate if needed

3. **Rate limits:**

- Free tier has limits
- Wait a few minutes
- Consider upgrading HF plan

---

## ⚡ Performance & Timeout Errors

### Error: "Function execution timeout"

**Symptom:**

```
Error: Task timed out after 10.00 seconds
```

**Solutions:**

1. **Vercel Free Tier Limit: 10 seconds**

- Can't be increased on free tier
- Need to optimize code

2. **Optimize large file processing:**

```typescript
// Process in smaller chunks
// Reduce embedding batch size
// Use streaming responses
```

3. **Upgrade Vercel plan:**

- Pro plan: 60s timeout
- Enterprise: 900s timeout

---

### Error: "Memory limit exceeded"

**Symptom:**

```
Error: JavaScript heap out of memory
```

**Solutions:**

1. **Reduce memory usage:**

- Process files in chunks
- Clear buffers after use
- Avoid loading entire file in memory

2. **Free tier limit: 1024MB**

- Can't be increased on free tier
- Optimize code
- Upgrade plan if needed

---

## 🌐 CORS & Network Errors

### Error: "CORS policy blocked"

**Symptom:**

```
Access to fetch at 'https://...' has been blocked by CORS policy
```

**Solutions:**

1. **Add Vercel URL to Supabase CORS:**

```
Supabase → Settings → API → CORS Configuration
Add: https://your-project.vercel.app
```

2. **Check API route CORS headers:**

```typescript
// In API routes
export async function GET(request: Request) {
  return new Response(data, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });
}
```

---

## 📊 Environment Variable Issues

### Error: "Environment variable not found"

**Symptom:**

```
Error: GOOGLE_CLIENT_ID is not defined
```

**Solutions:**

1. **Check variable is set:**

- Vercel → Settings → Environment Variables
- Ensure it exists for all environments (Production, Preview, Dev)

2. **Redeploy after adding:**

- Adding env vars requires redeploy
- Deployments → Latest → Redeploy

3. **Check variable name spelling:**

- Must match exactly (case-sensitive)
- No extra spaces

4. **For client-side variables:**

```env
# Must have NEXT_PUBLIC_ prefix
NEXT_PUBLIC_SUPABASE_URL=https://...
```

---

## 🔍 Debugging Tips

### 1. Check Vercel Logs

```
Vercel Dashboard → Your Project → Logs
- Filter by: Error
- Look for stack traces
- Check timestamps
```

### 2. Check Build Logs

```
Vercel Dashboard → Deployments → Click deployment → Building
- See full build output
- Check for warnings
- Verify all steps pass
```

### 3. Test Locally First

```bash
# Use production environment locally
vercel env pull .env.production

# Test build
npm run build

# Test production mode
npm run start
```

### 4. Enable Debug Logging

```env
# Add to environment variables
DEBUG=*
NODE_ENV=development  # Temporarily for more logs
```

### 5. Check Service Status Pages

- Vercel Status: status.vercel.com
- Supabase Status: status.supabase.com
- Upstash Status: status.upstash.com

---

## 🆘 Still Having Issues?

### Quick Checklist:

- [ ] All 25 environment variables are set
- [ ] NEXTAUTH_URL matches actual Vercel URL
- [ ] Google OAuth redirect URI includes Vercel URL
- [ ] Database migrations have been run
- [ ] Upstash Redis is active
- [ ] Qdrant cluster is running
- [ ] All service API keys are valid
- [ ] Code builds locally with `npm run build`
- [ ] Checked Vercel logs for specific errors
- [ ] Supabase project is not paused

### Get Help:

1. **Review logs carefully** - Error messages are usually specific
2. **Check service dashboards** - Verify all services are running
3. **Test locally first** - Reproduce issue in development
4. **Search error message** - Often others have solved it
5. **Vercel Support** - vercel.com/support
6. **Community** - Vercel Discord, GitHub Discussions

---

## 📚 Useful Commands

```bash
# View deployment logs
vercel logs

# Pull environment variables
vercel env pull

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Test build locally
npm run build

# Check for errors
npm run lint
npm run typecheck

# Deploy from CLI
vercel --prod
```

---

## ✅ Prevention Tips

1. **Always test builds locally before deploying**
2. **Keep environment variables documented**
3. **Monitor service usage/limits regularly**
4. **Set up deployment notifications**
5. **Use staging environment for testing**
6. **Keep dependencies up to date**
7. **Review Vercel logs after each deployment**

---

**Remember:** Most deployment issues are environment variable or service configuration problems. Always start by verifying those first! 🎯
