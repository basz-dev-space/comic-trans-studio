#!/bin/bash

# Initialize Prisma database for Comic Translation Studio

echo "🔧 Initializing Comic Translation Studio Database..."
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

if [ $? -eq 0 ]; then
  echo "✅ Prisma Client generated successfully"
  echo ""
else
  echo "❌ Failed to generate Prisma Client"
  exit 1
fi

# Push database schema
echo "🔄 Pushing database schema..."
npx prisma db push --skip-generate

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Database initialized successfully!"
  echo ""
  echo "📋 Summary:"
  echo "   - Prisma Client: Generated"
  echo "   - Database: Ready"
  echo "   - Tables: Created"
  echo ""
  echo "🚀 You can now start the application!"
  echo ""
else
  echo "❌ Failed to push database schema"
  exit 1
fi
