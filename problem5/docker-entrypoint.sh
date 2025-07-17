#!/bin/sh

# Docker entrypoint script for the User Management API

echo "🚀 Starting User Management API..."

# Initialize database if it doesn't exist
if [ ! -f "prisma/users.db" ]; then
    echo "📦 Initializing database..."
    npx prisma db push --accept-data-loss
else
    echo "✅ Database already exists"
fi

# Generate Prisma client (in case it's missing)
echo "🔧 Generating Prisma client..."
npx prisma generate

# Start the application
echo "🌟 Starting Node.js server..."
exec node dist/index.js
