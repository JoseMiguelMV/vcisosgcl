#!/bin/bash
set -e

echo "=== vCISOSGCI Production Deployment ==="

# Check environment variables
if [ -z "$JWT_SECRET" ] || [ -z "$JWT_REFRESH_SECRET" ]; then
    echo "ERROR: JWT_SECRET and JWT_REFRESH_SECRET must be set"
    echo "Generate secrets with: openssl rand -hex 64"
    exit 1
fi

# Start services
docker-compose up -d --build

echo ""
echo "=== Services Started ==="
echo "Frontend: http://localhost:80"
echo "Backend API: http://localhost:3050"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
