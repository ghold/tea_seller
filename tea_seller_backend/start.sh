#!/bin/sh

# Run migrations and start server
echo "Running database migrations..."
npx medusa db:migrate

echo "Seeding database..."
npm run seed || echo "Seeding failed, continuing..."

npx medusa build
cd .medusa/server && npm install
export NODE_ENV=production
cp ../../.env.prodution .env
npm run start

#echo "Starting Medusa development server..."
#npm run dev
