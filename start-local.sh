#!/bin/bash

# Start local development environment for Marketplace Microservices

echo "🚀 Starting Marketplace Microservices..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi

# Start infrastructure (MongoDB and RabbitMQ)
echo "📦 Starting infrastructure (MongoDB & RabbitMQ)..."
docker-compose up -d mongodb rabbitmq

# Wait for services to be healthy
echo "⏳ Waiting for MongoDB and RabbitMQ to be ready..."
sleep 10

# Check if MongoDB is ready
until docker exec marketplace-mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; do
  echo "Waiting for MongoDB..."
  sleep 2
done
echo "✅ MongoDB is ready"

# Check if RabbitMQ is ready
until docker exec marketplace-rabbitmq rabbitmq-diagnostics ping > /dev/null 2>&1; do
  echo "Waiting for RabbitMQ..."
  sleep 2
done
echo "✅ RabbitMQ is ready"

echo ""
echo "🎉 Infrastructure is ready!"
echo ""
echo "🚀 Starting all microservices..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

echo ""
echo "✅ All services are running!"
echo ""
echo "📡 API Gateway (Nginx) is available at: http://localhost:4000"

echo ""
echo "Available endpoints:"
echo "  - Gateway Root:    http://localhost:4000/"
echo "  - Swagger UI:      http://localhost:4000/api/orders/docs (Orders)"
echo "                     http://localhost:4000/api/invoices/docs (Invoices)"
echo "  - Orders API:      http://localhost:4000/api/orders"
echo "  - Invoices API:    http://localhost:4000/api/invoices"
echo "  - Health Check:    http://localhost:4000/health"
echo "Direct service access:"
echo "  - Order Service:   http://localhost:3001"
echo "  - Invoice Service: http://localhost:3002"
echo "  - RabbitMQ UI:     http://localhost:15672 (admin/admin123)"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop all:  docker-compose down"
echo ""
