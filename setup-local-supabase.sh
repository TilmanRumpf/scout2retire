#!/bin/bash

echo "🚀 Scout2Retire Local Supabase Setup"
echo "===================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and run this script again."
    exit 1
fi

echo "✅ Docker is running"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Supabase CLI is installed"

# Stop any existing Supabase containers
echo "🛑 Stopping any existing Supabase containers..."
npx supabase stop

# Start local Supabase
echo "🚀 Starting local Supabase..."
npx supabase start

# Get the status
echo ""
echo "📊 Local Supabase Status:"
npx supabase status

# Link to remote project
echo ""
echo "🔗 Linking to remote project..."
npx supabase link --project-ref axlruvvsjepsulcbqlho

# Pull remote database schema
echo ""
echo "📥 Pulling remote database schema to local..."
npx supabase db pull

# Run existing migrations
echo ""
echo "🔄 Running migrations..."
npx supabase db reset

echo ""
echo "✅ Setup complete!"
echo ""
echo "📌 Important URLs:"
echo "   - Local API: http://localhost:54321"
echo "   - Local Studio: http://localhost:54323"
echo "   - Inbucket (emails): http://localhost:54324"
echo ""
echo "📌 Next steps:"
echo "   1. Update your .env to use local URLs for development"
echo "   2. Run 'npx supabase studio' to open the local dashboard"
echo "   3. Make database changes locally, then push to remote"