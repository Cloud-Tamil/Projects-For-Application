# ShopSphere Microservices Application

ShopSphere is a Node.js 22 e-commerce microservices application.

## Architecture

GitHub
   |
   v
GitHub Actions
   |
   v
Docker Build
   |
   v
Amazon ECR
   |
   v
Amazon EKS
   |
   v
ALB
   |
   v
API Gateway
   |
   +------------------+
   |                  |
   v                  v
Auth             Product
Service          Service
   |
   +------------------+
   |
   v
Cart
Service
   |
   v
Order
Service
   |
   v
Payment
Service

## Services

| Service | Port |
|---------|------|
| Gateway | 8080 |
| Auth | 3001 |
| Product | 3002 |
| Cart | 3003 |
| Order | 3004 |
| Payment | 3005 |

## Run locally

Install Node.js 22.

```bash
npm install
