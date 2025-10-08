#!/bin/bash

# NoteBotLM Vercel Deployment Script
echo "🚀 Starting NoteBotLM deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel
echo "🔐 Logging into Vercel..."
vercel login

# Set up environment variables
echo "⚙️ Setting up environment variables..."
echo "Please make sure you have updated .env.production with your actual values!"
echo "Key environment variables to set in Vercel dashboard:"
echo "- AUTH_SECRET (generate a new one)"
echo "- DATABASE_URL (your Supabase connection)"
echo "- GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET"
echo "- SUPABASE_KEY & NEXT_PUBLIC_SUPABASE_URL"
echo "- HUGGINGFACE_API_KEY"
echo ""
echo "Upstash Redis and Qdrant Cloud are already configured!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your app should be available at the URL provided by Vercel"
echo ""
echo "📋 Post-deployment checklist:"
echo "1. Set all environment variables in Vercel dashboard"
echo "2. Update Google OAuth redirect URIs"
echo "3. Test file upload and chat functionality"
echo "4. Check Vercel function logs for any errors"