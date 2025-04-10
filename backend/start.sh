#!/bin/sh

# Check if migrations folder exists
if [ ! -d "prisma/migrations" ] || [ -z "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "No migrations found, creating initial migration..."
  npx prisma migrate dev --name init --create-only
fi

# Deploy migrations
echo "Deploying migrations..."
npx prisma migrate deploy

# Run seed script
echo "Seeding database..."
npx prisma db seed

# Start the app
echo "Starting the application..."
npm run start:dev 