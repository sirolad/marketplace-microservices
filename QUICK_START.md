# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Everything
```bash
./start-local.sh
```
This script starts the entire stack: MongoDB, RabbitMQ, Microservices, and the API Gateway.

### 3. Verify Installation
Check the API Gateway health:
```bash
curl http://localhost:4000/health
```

## 🔗 Service URLs

All services are accessible through the **API Gateway (Nginx)** on port **4000**.

| Service | Type | URL |
|---------|------|-----|
| **API Gateway** | Base URL | http://localhost:4000 |
| **Order Service** | API | http://localhost:4000/api/orders |
| **Order Service** | Swagger Docs | http://localhost:4000/api/orders/docs |
| **Invoice Service** | API | http://localhost:4000/api/invoices |
| **Invoice Service** | Swagger Docs | http://localhost:4000/api/invoices/docs |
| **RabbitMQ** | Management UI | http://localhost:15672 (admin/admin123) |
| **MongoDB** | Database | localhost:27017 (admin/admin123) |

> **Note:** Direct access to services (ports 3001, 3002) is still possible but recommended to use the Gateway.

## 📝 Test the System

### Create an Order
```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-001",
    "customerId": "customer-001",
    "sellerId": "seller-001",
    "price": 149.99,
    "quantity": 1
  }'
```

Response:
```json
{
  "id": "uuid-here",
  "productId": "product-001",
  "customerId": "customer-001",
  "sellerId": "seller-001",
  "price": 149.99",
  "quantity": 1,
  "status": "Created",
  "totalPrice": 149.99,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### List Orders
```bash
curl http://localhost:4000/api/orders
```

### Get Order by ID
```bash
curl http://localhost:4000/api/orders/{orderId}
```

### Update Order Status
```bash
curl -X PATCH http://localhost:4000/api/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Accepted"}'
```

Valid status transitions:
- Created → Accepted or Rejected
- Accepted → Shipping in progress
- Shipping in progress → Shipped

### Upload Invoice (requires a PDF file)
```bash
curl -X POST http://localhost:4000/api/invoices \
  -F "orderId={orderId}" \
  -F "file=@path/to/invoice.pdf"
```

### Get Invoice
```bash
curl http://localhost:4000/api/invoices/{orderId}
```

## 🎯 Complete Workflow Script

```bash
# 1. Create order
ORDER_ID=$(curl -s -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":"p1","customerId":"c1","sellerId":"s1","price":100,"quantity":1}' \
  | jq -r '.id')

echo "Created order: $ORDER_ID"

# 2. Create a test PDF (macOS)
echo "Test Invoice" > test-invoice.txt
textutil -convert pdf test-invoice.txt
mv test-invoice.pdf invoice-$ORDER_ID.pdf

# 3. Upload invoice
curl -X POST http://localhost:4000/api/invoices \
  -F "orderId=$ORDER_ID" \
  -F "file=@invoice-$ORDER_ID.pdf"

# 4. Accept order
curl -X PATCH http://localhost:4000/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Accepted"}'

# 5. Start shipping
curl -X PATCH http://localhost:4000/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Shipping in progress"}'

# 6. Mark as shipped (triggers automatic invoice sending!)
curl -X PATCH http://localhost:4000/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Shipped"}'

# 7. Verify invoice was sent automatically
curl -s http://localhost:4000/api/invoices/$ORDER_ID | jq '.sentAt'
```

## 🐳 Docker Commands

```bash
# Start all services
./start-local.sh
# OR
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild images (if you made changes)
docker-compose up -d --build
```

## 🔍 Debugging

### Check RabbitMQ Messages
1. Open http://localhost:15672
2. Login with `admin` / `admin123`
3. Go to Queues tab
4. Check `invoice-service.order-shipped` queue

### Check MongoDB Data
```bash
docker exec -it marketplace-mongodb mongosh -u admin -p admin123

use marketplace
db.orders.find().pretty()
db.invoices.find().pretty()
```

## ❓ Common Issues

### "Port already in use"
- The API Gateway uses port **4000**.
- Services use internal ports 3001 and 3002.
- Check usage: `lsof -i :4000`

### "Cannot connect to MongoDB/RabbitMQ"
- Ensure containers are healthy: `docker ps`
- Check logs: `docker-compose logs -f`

## 🎓 Architecture Overview

```
                                  ┌─────────────────┐
                                  │   Order Service │
                          ┌──────►│ (Port 3001)     │
                          │       └────────┬────────┘
┌─────────────┐    ┌──────┴──┐             │ OrderShipped Event
│   Client    │───►│ Gateway │             │
│ (Port 4000) │    │ (Nginx) │             │
└─────────────┘    └──────┬──┘             ▼
                          │       ┌─────────────────┐
                          │       │    RabbitMQ     │
                          │       └────────┬────────┘
                          │                │
                          │                ▼
                          │       ┌─────────────────┐
                          └──────►│ Invoice Service │
                                  │ (Port 3002)     │
                                  └─────────────────┘
```
