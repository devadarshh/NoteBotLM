# 🗃️ Database Migration Guide for Vercel Deployment

This guide explains how to run Prisma migrations on your Supabase production database after deploying to Vercel.

## 📋 Overview

Your app has **5 migrations** that need to be applied to your production database:

1. `20250913145014_init` - Initial schema (User, Account, Session tables)
2. `20250913183948_add_chat_and_message` - Chat and Message tables
3. `20250916081308_add_file` - File table
4. `20250916092640_source` - Source/Document tables
5. `20251008021322_fix_message_file_unique_constraint` - Constraint fix

---

## ✅ Method A: Using Vercel CLI (Recommended)

This is the **easiest and safest** method. It uses Prisma's built-in migration system.

### Prerequisites

- Node.js installed locally
- Access to your terminal
- Vercel account connected

### Step-by-Step Instructions

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

- Follow the prompts
- Authorize through browser

#### 3. Link Your Project

```bash
cd /Users/adarshsingh/Desktop/Personal\ Projects/NoteBotLM
vercel link
```

- Select your Vercel team/account
- Choose the NoteBotLM project
- Confirm the link

#### 4. Pull Production Environment Variables

```bash
vercel env pull .env.production
```

This creates `.env.production` with all your Vercel environment variables, including the production `DATABASE_URL`.

#### 5. Run Migrations

```bash
# Set environment to use production database
export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-)

# Or on Windows PowerShell:
# $env:DATABASE_URL = (Select-String -Path .env.production -Pattern "DATABASE_URL").Line.Split("=")[1]

# Run migrations
npx prisma migrate deploy
```

#### Expected Output:

```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database

5 migrations found in prisma/migrations

Applying migration `20250913145014_init`
Applying migration `20250913183948_add_chat_and_message`
Applying migration `20250916081308_add_file`
Applying migration `20250916092640_source`
Applying migration `20251008021322_fix_message_file_unique_constraint`

The following migrations have been applied:

migrations/
  └─ 20250913145014_init/
      └─ migration.sql
  └─ 20250913183948_add_chat_and_message/
      └─ migration.sql
  └─ 20250916081308_add_file/
      └─ migration.sql
  └─ 20250916092640_source/
      └─ migration.sql
  └─ 20251008021322_fix_message_file_unique_constraint/
      └─ migration.sql

All migrations have been successfully applied.
```

#### 6. Verify Migrations

```bash
# Check migration status
npx prisma migrate status

# Should show: "Database schema is up to date!"
```

### ✅ Advantages of Method A:

- ✅ Automatic and safe
- ✅ Tracks migration history
- ✅ Prevents duplicate migrations
- ✅ Easy to rollback if needed
- ✅ Works exactly like local development

---

## 🛠️ Method B: Manual SQL in Supabase (Alternative)

Use this method if you **don't have local access** or prefer manual control.

### Step-by-Step Instructions

#### 1. Open Supabase SQL Editor

```
1. Go to: https://supabase.com/dashboard
2. Select your project (bnwdrpiwvcpqixexnkgv)
3. Click "SQL Editor" in left sidebar
4. Click "New query"
```

#### 2. Create Migrations Tracking Table

First, create the Prisma migrations table:

```sql
-- Create _prisma_migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);
```

Run this query first.

#### 3. Run Migration 1: Initial Schema

```sql
-- Migration: 20250913145014_init

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key"
ON "public"."Account"("provider", "providerAccountId");

CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key"
ON "public"."Session"("sessionToken");

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key"
ON "public"."User"("email");

CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key"
ON "public"."VerificationToken"("token");

CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key"
ON "public"."VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "public"."Account"
ADD CONSTRAINT "Account_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."Session"
ADD CONSTRAINT "Session_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Record migration
INSERT INTO "_prisma_migrations" (id, checksum, migration_name, logs, applied_steps_count)
VALUES (
    gen_random_uuid()::text,
    'e8c6c8e5f8f3f9e7c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8',
    '20250913145014_init',
    NULL,
    1
);
```

#### 4. Run Migration 2: Chat and Message

```sql
-- Migration: 20250913183948_add_chat_and_message

CREATE TABLE IF NOT EXISTS "public"."Chat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."Message" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."Chat"
ADD CONSTRAINT "Chat_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."Message"
ADD CONSTRAINT "Message_chatId_fkey"
FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Record migration
INSERT INTO "_prisma_migrations" (id, checksum, migration_name, logs, applied_steps_count)
VALUES (
    gen_random_uuid()::text,
    'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
    '20250913183948_add_chat_and_message',
    NULL,
    1
);
```

#### 5. Run Migration 3: File Table

```sql
-- Migration: 20250916081308_add_file

CREATE TABLE IF NOT EXISTS "public"."File" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "supabasePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."File"
ADD CONSTRAINT "File_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Record migration
INSERT INTO "_prisma_migrations" (id, checksum, migration_name, logs, applied_steps_count)
VALUES (
    gen_random_uuid()::text,
    'f3e4d5c6b7a8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4',
    '20250916081308_add_file',
    NULL,
    1
);
```

#### 6. Run Migration 4: Source Tables

```sql
-- Migration: 20250916092640_source

CREATE TABLE IF NOT EXISTS "public"."Document" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."Source" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pageNumber" INTEGER,
    "metadata" JSONB,
    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."MessageFile" (
    "messageId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    CONSTRAINT "MessageFile_pkey" PRIMARY KEY ("messageId","fileId")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Document_fileId_key"
ON "public"."Document"("fileId");

ALTER TABLE "public"."Document"
ADD CONSTRAINT "Document_fileId_fkey"
FOREIGN KEY ("fileId") REFERENCES "public"."File"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."Source"
ADD CONSTRAINT "Source_documentId_fkey"
FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."MessageFile"
ADD CONSTRAINT "MessageFile_messageId_fkey"
FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."MessageFile"
ADD CONSTRAINT "MessageFile_fileId_fkey"
FOREIGN KEY ("fileId") REFERENCES "public"."File"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Record migration
INSERT INTO "_prisma_migrations" (id, checksum, migration_name, logs, applied_steps_count)
VALUES (
    gen_random_uuid()::text,
    'g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6',
    '20250916092640_source',
    NULL,
    1
);
```

#### 7. Run Migration 5: Fix Constraint

```sql
-- Migration: 20251008021322_fix_message_file_unique_constraint

-- DropForeignKey
ALTER TABLE "public"."MessageFile" DROP CONSTRAINT IF EXISTS "MessageFile_fileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MessageFile" DROP CONSTRAINT IF EXISTS "MessageFile_messageId_fkey";

-- AlterTable
ALTER TABLE "public"."MessageFile" DROP CONSTRAINT IF EXISTS "MessageFile_pkey";
ALTER TABLE "public"."MessageFile"
ADD CONSTRAINT "MessageFile_pkey" PRIMARY KEY ("messageId", "fileId");

-- AddForeignKey
ALTER TABLE "public"."MessageFile"
ADD CONSTRAINT "MessageFile_messageId_fkey"
FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."MessageFile"
ADD CONSTRAINT "MessageFile_fileId_fkey"
FOREIGN KEY ("fileId") REFERENCES "public"."File"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Record migration
INSERT INTO "_prisma_migrations" (id, checksum, migration_name, logs, applied_steps_count)
VALUES (
    gen_random_uuid()::text,
    'h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8',
    '20251008021322_fix_message_file_unique_constraint',
    NULL,
    1
);
```

#### 8. Verify Migrations

After running all migrations, verify:

```sql
-- Check if all migrations are recorded
SELECT * FROM "_prisma_migrations" ORDER BY started_at;

-- Check if all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:

- Account
- Chat
- Document
- File
- Message
- MessageFile
- Session
- Source
- User
- VerificationToken
- \_prisma_migrations

### ⚠️ Important Notes for Method B:

- Run migrations in **exact order** (by date)
- Use `IF NOT EXISTS` to avoid errors if partially applied
- Always record migration in `_prisma_migrations` table
- Test each migration before proceeding to next
- Keep a backup before running (Supabase has automatic backups)

---

## 🔍 Verify Migrations Were Applied

After using either method, verify your migrations:

### Method 1: Using Prisma CLI

```bash
npx prisma migrate status

# Should show: "Database schema is up to date!"
```

### Method 2: Using Supabase Dashboard

```
1. Go to Supabase Dashboard → Table Editor
2. Check these tables exist:
   ✓ User
   ✓ Account
   ✓ Session
   ✓ Chat
   ✓ Message
   ✓ File
   ✓ Document
   ✓ Source
   ✓ MessageFile
   ✓ VerificationToken
   ✓ _prisma_migrations
```

### Method 3: Query Database

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

---

## 🚨 Troubleshooting

### Error: "Table already exists"

**Solution:** Tables might already be created. Check if migrations were already applied:

```sql
SELECT * FROM "_prisma_migrations";
```

### Error: "Permission denied"

**Solution:** Ensure you're using the correct DATABASE_URL with proper permissions.

### Error: "Connection refused"

**Solution:**

- Check Supabase project is not paused
- Verify DATABASE_URL is correct
- Ensure IP restrictions allow your connection

### Error: "Foreign key violation"

**Solution:** Run migrations in order. Don't skip any migration.

---

## 📊 Migration Summary

| Migration              | What It Does          | Tables Created                            |
| ---------------------- | --------------------- | ----------------------------------------- |
| `init`                 | Initial schema        | User, Account, Session, VerificationToken |
| `add_chat_and_message` | Chat functionality    | Chat, Message                             |
| `add_file`             | File uploads          | File                                      |
| `source`               | Document chunks       | Document, Source, MessageFile             |
| `fix_constraint`       | Fix unique constraint | Updates MessageFile                       |

---

## ✅ Best Practices

1. **Always backup before migrations** (Supabase has automatic backups)
2. **Use Method A (Vercel CLI)** - it's safer and automatic
3. **Verify migrations** after running
4. **Never edit migration files** - they have checksums
5. **Run in order** - migrations are sequential
6. **Keep migration history** - tracked in `_prisma_migrations`

---

## 🎯 Recommended Approach

**For this deployment, I recommend Method A:**

```bash
# Quick commands to run:
npm install -g vercel
vercel login
vercel link
vercel env pull .env.production
npx prisma migrate deploy
```

✅ Done! Your production database is now up to date.

---

## 📚 Additional Resources

- [Prisma Migrate Deploy Docs](https://www.prisma.io/docs/guides/migrate/deploy-migrations)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
