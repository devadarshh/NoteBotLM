# Sage RAG App

A RAG (Retrieval-Augmented Generation) application built with the [T3 Stack](https://create.t3.gg/), featuring document processing, vector search, and AI-powered chat.

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com)
- **Backend**: [tRPC](https://trpc.io), [Prisma](https://prisma.io)
- **Authentication**: [NextAuth.js](https://next-auth.js.org)
- **Vector Database**: [Qdrant](https://qdrant.tech/)
- **Job Queue**: [BullMQ](https://docs.bullmq.io/) with Valkey/Redis
- **AI/ML**: [Google Gemini](https://ai.google.dev/), [HuggingFace](https://huggingface.co/)
- **Storage**: [Supabase](https://supabase.com/)

## Prerequisites

- Node.js 18+ and npm/pnpm
- Docker and Docker Compose
- Supabase account
- Google Cloud account (for Gemini API)
- HuggingFace account (for embeddings)

## Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd sage-rag-app-main
npm install
```

### 2. Start Docker Services

Start Valkey (Redis) and Qdrant containers:

```bash
docker-compose up -d
```

Verify containers are running:

```bash
docker-compose ps
```

You should see:

- `sage-valkey` running on port 6379
- `sage-qdrant` running on ports 6333 (HTTP) and 6334 (gRPC)

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

```env
# Database
DATABASE_URL="your-supabase-connection-pooling-url"
DIRECT_URL="your-supabase-direct-connection-url"

# Authentication
AUTH_SECRET="generate-with-npx-auth-secret"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# AI Services
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
HUGGINGFACE_API_KEY="your-huggingface-api-key"

# Supabase
SUPABASE_KEY="your-supabase-anon-key"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"

# Redis/Valkey (Docker defaults)
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Qdrant (Docker defaults)
QDRANT_URL="http://localhost:6333"
```

### 4. Set Up Database

Run Prisma migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start the Application

Start the Next.js development server:

```bash
npm run dev
```

### 6. Start the Background Worker

In a separate terminal, start the BullMQ worker for processing file uploads:

```bash
npx tsx src/server/api/routers/chat/worker.ts
```

The application should now be running at `http://localhost:3000`

## Docker Services

### Valkey (Redis)

- **Port**: 6379
- **Purpose**: Job queue for BullMQ (file processing)
- **Data persistence**: `valkey_data` volume
- **Health check**: `redis-cli ping`

### Qdrant

- **Ports**: 6333 (HTTP/REST), 6334 (gRPC)
- **Purpose**: Vector database for document embeddings
- **Data persistence**: `qdrant_data` volume
- **Health check**: `http://localhost:6333/healthz`
- **Dashboard**: `http://localhost:6333/dashboard`

### Managing Docker Services

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f valkey
docker-compose logs -f qdrant

# Restart services
docker-compose restart

# Remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── chat/         # Chat endpoint
│   └── (private)/        # Protected pages
├── components/            # React components
│   ├── chat/             # Chat interface
│   ├── pdf/              # PDF viewer
│   └── sidebar/          # Navigation
├── server/               # Backend logic
│   ├── api/
│   │   └── routers/
│   │       └── chat/
│   │           ├── create.ts    # tRPC chat router
│   │           ├── helper.ts    # File upload & queue
│   │           └── worker.ts    # Background job processor
│   ├── auth/             # NextAuth configuration
│   └── db.ts             # Prisma client
└── lib/                  # Utilities
```

## How It Works

1. **File Upload**: Users upload PDF documents through the UI
2. **Job Queue**: Files are queued in Valkey/Redis via BullMQ
3. **Processing**: Background worker:
   - Downloads file from Supabase
   - Splits into chunks using LangChain
   - Generates embeddings via HuggingFace
   - Stores vectors in Qdrant
4. **Chat**: User queries are:
   - Embedded using the same model
   - Searched in Qdrant for relevant chunks
   - Sent to Gemini with context for RAG response

## Troubleshooting

### Docker containers won't start

```bash
# Check if ports are already in use
lsof -i :6379
lsof -i :6333

# Remove old containers and volumes
docker-compose down -v
docker-compose up -d
```

## UI Feedback (Toasts)

The project uses the [Sonner](https://sonner.emilkowal.ski/) library for toast notifications.

Global setup is handled in `src/app/layout.tsx` by rendering `<AppToaster />` once. A small wrapper `useToast()` exists at `src/components/ui/use-toast.ts` to provide a simple API plus helpers (`success`, `error`, `info`, `warning`, `promise`).

### Showing a toast

```tsx
import { useToast } from "@/components/ui/use-toast";

function ExampleButton() {
  const { toast, success } = useToast();
  return (
    <button
      onClick={() =>
        success("Uploaded", { description: "Your document is now processing." })
      }
    >
      Notify
    </button>
  );
}
```

You can also import the raw `toast` function directly:

```tsx
import { toast } from "sonner";
toast.success("All good");
```

Default position is top-right with rich colors enabled. Adjust in `AppToaster` if needed.

### Worker not processing files

- Ensure Valkey is running: `docker-compose ps`
- Check worker logs for errors
- Verify `REDIS_HOST` and `REDIS_PORT` in `.env`

### Qdrant connection errors

- Verify Qdrant is running: `curl http://localhost:6333/healthz`
- Check `QDRANT_URL` in `.env`
- View Qdrant logs: `docker-compose logs qdrant`

## Learn More

- [T3 Stack Documentation](https://create.t3.gg/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [LangChain Documentation](https://js.langchain.com/docs/)

## Deployment

For production deployment, ensure:

1. Update Docker Compose for production (add resource limits, networks)
2. Use managed Redis/Qdrant services or deploy containers with proper persistence
3. Set up proper environment variables in your hosting platform
4. Configure CORS and security headers
5. Set up monitoring and logging
