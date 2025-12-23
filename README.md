# Marketplace Microservices

A simplified marketplace ecommerce system for ordering and invoicing, built with NestJS microservices architecture and Domain-Driven Design patterns.

## Architecture

The system consists of two microservices that communicate asynchronously via RabbitMQ:

### Order Service (Port 3001)
Manages the complete order lifecycle with 5 statuses:
- Created
- Accepted
- Rejected
- Shipping in progress
- Shipped

**API Endpoints:**
- `POST /orders` - Create a new order
- `GET /orders` - List all orders (supports filtering by sellerId)
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id/status` - Update order status

### Invoice Service (Port 3002)
Handles invoice management and automatic sending when orders are shipped.

**API Endpoints:**
- `POST /invoices` - Upload invoice PDF for an order
- `GET /invoices/:orderId` - Get invoice details for an order

## Tech Stack

- **Framework:** NestJS 10.x with TypeScript 5.x
- **Database:** MongoDB 7.0
- **Message Broker:** RabbitMQ 3.12
- **Architecture:** Domain-Driven Design with CQRS
- **Testing:** Jest
- **Container:** Docker & Docker Compose

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Infrastructure (MongoDB & RabbitMQ)

```bash
npm run docker:up
```

This will start:
- MongoDB on port 27017
- RabbitMQ on port 5672 (management UI on 15672)

### 3. Start Services

**Order Service:**
```bash
npm run start:dev:order
```

**Invoice Service:**
```bash
npm run start:dev:invoice
```

### 4. Access Services

- Order Service: http://localhost:3001
- Invoice Service: http://localhost:3002
- RabbitMQ Management: http://localhost:15672 (admin/admin123)

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run linting
npm run lint
```

## API Usage Examples

### Create an Order

```bash
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod-123",
    "customerId": "cust-456",
    "sellerId": "seller-789",
    "price": 99.99,
    "quantity": 2
  }'
```

### Update Order Status

```bash
curl -X PATCH http://localhost:3001/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Accepted"
  }'
```

### Upload Invoice

```bash
curl -X POST http://localhost:3002/invoices \
  -F "orderId={orderId}" \
  -F "file=@invoice.pdf"
```

## Project Structure

```
marketplace-microservices/
├── apps/
│   ├── order-service/          # Order management microservice
│   │   ├── src/
│   │   │   ├── domain/         # Domain layer (entities, value objects, events)
│   │   │   ├── application/    # Application layer (use cases)
│   │   │   ├── infrastructure/ # Infrastructure layer (repositories, controllers)
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── invoice-service/        # Invoice management microservice
│       ├── src/
│       │   ├── domain/
│       │   ├── application/
│       │   ├── infrastructure/
│       │   └── main.ts
│       ├── test/
│       ├── Dockerfile
│       └── package.json
├── libs/                       # Shared libraries
│   └── common/                 # Common utilities and types
├── docker-compose.yml
└── package.json
```

## Domain-Driven Design Structure

Each service follows DDD principles:

- **Domain Layer:** Entities, value objects, aggregates, domain events
- **Application Layer:** Use cases, DTOs, application services
- **Infrastructure Layer:** Repositories, controllers, event handlers, external integrations

## Environment Variables

### Order Service
- `PORT` - Service port (default: 3001)
- `MONGODB_URI` - MongoDB connection string
- `RABBITMQ_URI` - RabbitMQ connection string

### Invoice Service
- `PORT` - Service port (default: 3002)
- `MONGODB_URI` - MongoDB connection string
- `RABBITMQ_URI` - RabbitMQ connection string
- `UPLOAD_DIR` - Directory for storing uploaded PDFs

## Development

```bash
# Format code
npm run format

# Build all services
npm run build
```

## Production Deployment

Each service includes a production-ready Dockerfile:

```bash
# Build and start with Docker Compose
docker-compose up --build
```

## CI/CD

The project includes a GitHub Actions workflow that:
- Runs linting and type checking
- Executes all tests
- Builds production Docker images
- Runs security audits

## License

ISC
