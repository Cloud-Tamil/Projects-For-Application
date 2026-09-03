# ShopSphere

ShopSphere is a Dockerized e-commerce microservices application.

## Architecture

Browser
    |
    v
API Gateway :18080
    |
    +---- Auth Service :4001
    |
    +---- Product Service :4002
    |
    +---- Cart Service :4003
    |
    +---- Order Service :4004
              |
              +---- Product Service
              |
              +---- Payment Service :4005

## Services

| Service | Port | Responsibility |
|---|---:|---|
| Gateway | 18080 | API Gateway + Frontend |
| Auth | 4001 | Registration/Login |
| Product | 4002 | Products + Inventory |
| Cart | 4003 | Shopping Cart |
| Order | 4004 | Orders |
| Payment | 4005 | Payment Simulation |

## Requirements

- Docker Desktop
- Docker Compose
- Node.js 22+ for local tests

## Start application

Create data directories:

PowerShell:

    New-Item -ItemType Directory -Force data\auth
    New-Item -ItemType Directory -Force data\product
    New-Item -ItemType Directory -Force data\cart
    New-Item -ItemType Directory -Force data\order
    New-Item -ItemType Directory -Force data\payment

Build:

    docker compose build

Start:

    docker compose up -d

Check:

    docker compose ps

Open:

    http://localhost:18080

## Logs

All services:

    docker compose logs -f

Gateway:

    docker compose logs -f gateway

Auth:

    docker compose logs -f auth-service

Product:

    docker compose logs -f product-service

Cart:

    docker compose logs -f cart-service

Order:

    docker compose logs -f order-service

Payment:

    docker compose logs -f payment-service

## Stop

    docker compose down

## Stop and remove containers

    docker compose down --remove-orphans

## Tests

Structure test:

    npm test

End-to-end smoke test:

    npm run test:smoke

## Demo payment

Successful payment:

    4111111111111111

Failed payment:

    4111111111110000

Any card number ending in 0000 is intentionally rejected.

## Important

This is a local development/demo payment implementation.

It does not connect to a real payment provider.

The payment service does not store the full card number.

## Local architecture

Docker Compose creates a private network.

Containers communicate using service names.

For example:

    http://auth-service:4001
    http://product-service:4002
    http://cart-service:4003
    http://order-service:4004
    http://payment-service:4005

The browser only accesses:

    http://localhost:18080

## Future AWS architecture

The local architecture can later be migrated to:

GitHub
   |
GitHub Actions
   |
Docker
   |
Amazon ECR
   |
Amazon EKS
   |
ALB
   |
ShopSphere Microservices
   |
+----------------------+
|                      |
RDS PostgreSQL       ElastiCache Redis
|
S3
|
CloudWatch
|
Prometheus
|
Grafana

Infrastructure will be created using Terraform.
