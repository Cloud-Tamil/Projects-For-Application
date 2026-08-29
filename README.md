# Product Microservice

A simple **FastAPI-based Product Microservice** that provides both:

* 🌐 HTML web pages using **Jinja2**
* 🔌 REST APIs using **FastAPI**
* 🐳 Docker containerization
* 📚 Swagger/OpenAPI documentation
* ❤️ Health-check endpoint
* 🎨 Static CSS frontend

This project is designed as a simple starting point for learning **Python, FastAPI, REST APIs, Docker, CI/CD, and Kubernetes**.

---

## 📌 Project Overview

The application exposes product information through both a web interface and REST APIs.

### Application capabilities

* View home page
* View all products
* View individual product details
* Get products through REST API
* Get individual product through REST API
* Health check
* Swagger API documentation
* Dockerized application
* Responsive HTML/CSS frontend

---

# 🏗️ Architecture

```text
                         Browser
                            |
                            | HTTP :8000
                            |
                            v
                  +-------------------+
                  |      Docker       |
                  |                   |
                  |     FastAPI       |
                  |        |          |
                  |   +----+----+     |
                  |   |         |     |
                  | HTML       REST    |
                  | Pages       API    |
                  |   |         |      |
                  | Jinja2    JSON     |
                  | Templates         |
                  |   |                |
                  | Static CSS         |
                  +-------------------+
                            |
                            v
                     Product Data
                       In Memory
```

---

# 🛠️ Technology Stack

| Technology      | Purpose                    |
| --------------- | -------------------------- |
| Python 3.12     | Programming language       |
| FastAPI         | Backend REST API           |
| Uvicorn         | ASGI application server    |
| Pydantic        | Data validation            |
| Jinja2          | HTML templating            |
| HTML5           | Frontend                   |
| CSS3            | Styling                    |
| Docker          | Containerization           |
| Docker Compose  | Local container management |
| Swagger/OpenAPI | API documentation          |
| Git             | Source control             |
| GitHub          | Repository hosting         |

---

# 📁 Project Structure

```text
simple-microservice/
│
├── app/
│   ├── __init__.py
│   ├── main.py
│   │
│   ├── templates/
│   │   ├── index.html
│   │   ├── products.html
│   │   └── product.html
│   │
│   └── static/
│       └── style.css
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .dockerignore
├── .gitignore
└── README.md
```

---

# 🚀 Prerequisites

Install the following software before running the project.

### Required

* Python 3.12+
* Docker
* Docker Compose
* Git

### Optional

* VS Code
* Postman
* curl

Verify installations:

```bash
python --version
```

```bash
docker --version
```

```bash
docker compose version
```

```bash
git --version
```

Example:

```text
Python 3.12.x
Docker version 28.x
Docker Compose version v2.x
git version 2.x
```

---

# 💻 Run Locally Without Docker

You can run the application directly using Python.

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Enter the project directory:

```bash
cd simple-microservice
```

---

## 2. Create a virtual environment

### Windows

```powershell
python -m venv .venv
```

Activate:

```powershell
.venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then:

```powershell
.venv\Scripts\Activate.ps1
```

---

### Linux/macOS

```bash
python3 -m venv .venv
```

Activate:

```bash
source .venv/bin/activate
```

---

# 📦 Install Dependencies

```bash
pip install --upgrade pip
```

```bash
pip install -r requirements.txt
```

---

# ▶️ Start FastAPI

Run:

```bash
uvicorn app.main:app --reload
```

The application will start on:

```text
http://127.0.0.1:8000
```

or:

```text
http://localhost:8000
```

---

# 🌐 Application URLs

## Home Page

```text
http://localhost:8000/
```

Displays the main Product Store page.

---

## Products Page

```text
http://localhost:8000/products-page
```

Displays all available products.

---

## Product Details

Example:

```text
http://localhost:8000/product/1
```

Other examples:

```text
http://localhost:8000/product/2
```

```text
http://localhost:8000/product/3
```

---

# 🔌 REST API

## Health Check

Endpoint:

```text
GET /api/health
```

URL:

```text
http://localhost:8000/api/health
```

Example response:

```json
{
    "status": "healthy"
}
```

This endpoint can be used by:

* Docker health checks
* Kubernetes probes
* Load balancers
* Monitoring systems
* CI/CD smoke tests

---

# 📦 Get All Products

Endpoint:

```text
GET /api/products
```

URL:

```text
http://localhost:8000/api/products
```

Example response:

```json
[
    {
        "id": 1,
        "name": "Laptop",
        "price": 75000
    },
    {
        "id": 2,
        "name": "Mobile",
        "price": 30000
    },
    {
        "id": 3,
        "name": "Headphones",
        "price": 5000
    }
]
```

---

# 🔎 Get Product By ID

Endpoint:

```text
GET /api/products/{product_id}
```

Example:

```text
GET /api/products/1
```

URL:

```text
http://localhost:8000/api/products/1
```

Example response:

```json
{
    "id": 1,
    "name": "Laptop",
    "price": 75000
}
```

---

# ❌ Product Not Found

Example:

```text
http://localhost:8000/api/products/99
```

Response:

```json
{
    "error": "Product not found"
}
```

---

# 📚 Swagger API Documentation

FastAPI automatically generates Swagger documentation.

Open:

```text
http://localhost:8000/docs
```

You can test APIs directly from Swagger.

Available endpoints include:

```text
GET /
GET /products-page
GET /product/{product_id}

GET /api/health
GET /api/products
GET /api/products/{product_id}
```

---

# 📖 ReDoc

FastAPI also provides ReDoc.

Open:

```text
http://localhost:8000/redoc
```

---

# 🐳 Docker

The application can be packaged and executed as a Docker container.

---

# 🐳 Build Docker Image

From the project root:

```bash
docker build -t product-microservice:1.0 .
```

Check the image:

```bash
docker images
```

You should see:

```text
product-microservice    1.0
```

---

# ▶️ Run Docker Container

```bash
docker run -d \
  --name product-microservice \
  -p 8000:8000 \
  product-microservice:1.0
```

Windows PowerShell:

```powershell
docker run -d --name product-microservice -p 8000:8000 product-microservice:1.0
```

Check container:

```bash
docker ps
```

---

# 📋 View Container Logs

```bash
docker logs product-microservice
```

Follow logs:

```bash
docker logs -f product-microservice
```

Press:

```text
CTRL+C
```

to stop following logs.

---

# 🛑 Stop Container

```bash
docker stop product-microservice
```

---

# ▶️ Start Existing Container

```bash
docker start product-microservice
```

---

# 🗑️ Remove Container

First stop it:

```bash
docker stop product-microservice
```

Then remove:

```bash
docker rm product-microservice
```

---

# 🧹 Remove Docker Image

```bash
docker rmi product-microservice:1.0
```

If the image is being used by a container, remove the container first.

---

# 🐳 Docker Compose

Docker Compose makes local development easier.

Example `docker-compose.yml`:

```yaml
services:

  product-microservice:

    build:
      context: .

    container_name: product-microservice

    ports:
      - "8000:8000"

    restart: unless-stopped
```

---

# ▶️ Start With Docker Compose

Build and start:

```bash
docker compose up -d --build
```

Check:

```bash
docker compose ps
```

---

# 📋 Docker Compose Logs

```bash
docker compose logs
```

Follow logs:

```bash
docker compose logs -f
```

Only application logs:

```bash
docker compose logs -f product-microservice
```

---

# 🛑 Stop Docker Compose

```bash
docker compose down
```

---

# 🔨 Rebuild Application

After changing Python, HTML, CSS, Dockerfile, or requirements:

```bash
docker compose down
```

```bash
docker compose build --no-cache
```

```bash
docker compose up -d
```

Or simply:

```bash
docker compose up -d --build
```

---

# 🔍 Check Running Containers

```bash
docker ps
```

Show all containers:

```bash
docker ps -a
```

---

# 🔍 Inspect Container

```bash
docker inspect product-microservice
```

---

# 💻 Enter Container

```bash
docker exec -it product-microservice /bin/bash
```

Because the image uses a slim Python image, `/bin/sh` may be more reliable:

```bash
docker exec -it product-microservice /bin/sh
```

Check application files:

```bash
ls
```

```bash
ls app
```

---

# ❤️ Health Check

Test the health endpoint:

```bash
curl http://localhost:8000/api/health
```

Expected:

```json
{
    "status": "healthy"
}
```

Windows PowerShell:

```powershell
Invoke-WebRequest http://localhost:8000/api/health
```

Or:

```powershell
curl http://localhost:8000/api/health
```

---

# 🧪 Test REST API With curl

Get all products:

```bash
curl http://localhost:8000/api/products
```

Get product 1:

```bash
curl http://localhost:8000/api/products/1
```

Health:

```bash
curl http://localhost:8000/api/health
```

---

# 🧪 Test API With Browser

You can directly open:

```text
http://localhost:8000/api/products
```

or:

```text
http://localhost:8000/api/health
```

---

# 🧪 Test API With Postman

Create a new GET request.

### Request 1

```text
GET http://localhost:8000/api/health
```

### Request 2

```text
GET http://localhost:8000/api/products
```

### Request 3

```text
GET http://localhost:8000/api/products/1
```

---

# 🔐 Docker Security

The Dockerfile creates a non-root user:

```dockerfile
RUN useradd \
    --create-home \
    --shell /usr/sbin/nologin \
    appuser
```

The application runs as:

```dockerfile
USER appuser
```

This is better than running the application as the Docker `root` user.

---

# 📦 Requirements

Current dependencies:

```text
fastapi==0.116.1
uvicorn[standard]==0.35.0
jinja2==3.1.6
```

Install them with:

```bash
pip install -r requirements.txt
```

---

# 🧹 .dockerignore

Recommended `.dockerignore`:

```text
.venv
venv
__pycache__
*.pyc
*.pyo
*.pyd
.git
.gitignore
README.md
.pytest_cache
.coverage
.env
```

This prevents unnecessary files from being copied into the Docker build context.

---

# 🧹 .gitignore

Recommended `.gitignore`:

```text
.venv/
venv/

__pycache__/
*.py[cod]

.pytest_cache/
.coverage
htmlcov/

.env

.vscode/
.idea/

.DS_Store

*.log
```

---

# 🔄 Development Workflow

A typical development workflow:

```text
Developer
    |
    v
Modify Python / HTML / CSS
    |
    v
Run Tests
    |
    v
Build Docker Image
    |
    v
Run Docker Container
    |
    v
Test API
    |
    v
Test HTML
    |
    v
Git Commit
    |
    v
Git Push
```

---

# 🔧 Useful Development Commands

Start FastAPI with reload:

```bash
uvicorn app.main:app --reload
```

Start on all interfaces:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Change port:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

---

# 🐳 Useful Docker Commands

List images:

```bash
docker images
```

List running containers:

```bash
docker ps
```

List all containers:

```bash
docker ps -a
```

View logs:

```bash
docker logs product-microservice
```

Follow logs:

```bash
docker logs -f product-microservice
```

Stop container:

```bash
docker stop product-microservice
```

Start container:

```bash
docker start product-microservice
```

Restart container:

```bash
docker restart product-microservice
```

Remove container:

```bash
docker rm product-microservice
```

Remove image:

```bash
docker rmi product-microservice:1.0
```

Inspect container:

```bash
docker inspect product-microservice
```

Check resource usage:

```bash
docker stats
```

---

# 🧹 Docker Cleanup Commands

Remove stopped containers:

```bash
docker container prune
```

Remove unused images:

```bash
docker image prune
```

Remove unused Docker resources:

```bash
docker system prune
```

More aggressive cleanup:

```bash
docker system prune -a
```

⚠️ Be careful with:

```bash
docker system prune -a
```

It can remove unused images and other Docker resources.

---

# 🌳 Git Commands

Initialize Git:

```bash
git init
```

Check status:

```bash
git status
```

Add files:

```bash
git add .
```

Commit:

```bash
git commit -m "Initial Product Microservice"
```

Create/switch branch:

```bash
git branch -M main
```

Add GitHub remote:

```bash
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
```

Push:

```bash
git push -u origin main
```

---

# 🔄 Daily Git Workflow

```bash
git status
```

```bash
git add .
```

```bash
git commit -m "Update product API"
```

```bash
git push
```

---

# 🔍 Check Git Remote

```bash
git remote -v
```

---

# 🌿 Branching

Create feature branch:

```bash
git checkout -b feature/product-api
```

or:

```bash
git switch -c feature/product-api
```

Check branches:

```bash
git branch
```

Switch to main:

```bash
git switch main
```

Merge feature:

```bash
git merge feature/product-api
```

---

# 🧪 Basic Testing Checklist

After starting the application, verify:

### HTML

```text
http://localhost:8000/
```

```text
http://localhost:8000/products-page
```

```text
http://localhost:8000/product/1
```

### REST API

```text
http://localhost:8000/api/health
```

```text
http://localhost:8000/api/products
```

```text
http://localhost:8000/api/products/1
```

### Documentation

```text
http://localhost:8000/docs
```

```text
http://localhost:8000/redoc
```

---

# 🚨 Troubleshooting

## Port 8000 Already in Use

If you see an error similar to:

```text
Address already in use
```

Find the process using port 8000.

### Windows

```powershell
netstat -ano | findstr :8000
```

You can use another port:

```bash
uvicorn app.main:app --port 8080
```

Docker:

```bash
docker run -d \
  --name product-microservice \
  -p 8080:8000 \
  product-microservice:1.0
```

Then access:

```text
http://localhost:8080
```

---

# 🚨 Container Keeps Restarting

Check:

```bash
docker ps -a
```

Then:

```bash
docker logs product-microservice
```

For Docker Compose:

```bash
docker compose logs product-microservice
```

---

# 🚨 Template Not Found

If you see:

```text
TemplateNotFound
```

verify:

```text
app/
└── templates/
    ├── index.html
    ├── products.html
    └── product.html
```

Also verify:

```python
templates = Jinja2Templates(
    directory="app/templates"
)
```

---

# 🚨 CSS Not Loading

Verify:

```text
app/
└── static/
    └── style.css
```

And make sure `main.py` contains:

```python
app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static"
)
```

HTML should contain:

```html
<link rel="stylesheet" href="/static/style.css">
```

---

# 🚨 Docker Build Problems

Run:

```bash
docker compose down
```

Then:

```bash
docker compose build --no-cache
```

Then:

```bash
docker compose up -d
```

Check logs:

```bash
docker compose logs -f
```

---

# 🚨 Check Python Dependencies

Inside the virtual environment:

```bash
pip list
```

Check FastAPI:

```bash
pip show fastapi
```

Check Jinja2:

```bash
pip show jinja2
```

---

# 📊 Current Application Data

The application currently uses in-memory product data:

```python
products = [
    Product(id=1, name="Laptop", price=75000),
    Product(id=2, name="Mobile", price=30000),
    Product(id=3, name="Headphones", price=5000),
]
```

This means data will reset whenever the application restarts.

For a production application, replace this with a database such as:

* PostgreSQL
* MySQL
* Amazon RDS
* Google Cloud SQL
* Azure Database

---

# 🚀 Future Improvements

This project can be extended into a production-style microservice.

### Phase 1 — Current

```text
FastAPI
Jinja2
HTML
CSS
Docker
```

### Phase 2 — Database

```text
FastAPI
    |
    v
PostgreSQL
```

Add:

* SQLAlchemy
* Alembic
* Database migrations
* CRUD operations

### Phase 3 — Authentication

Add:

* JWT authentication
* User registration
* Login
* Role-based access control

### Phase 4 — CI/CD

Add:

```text
GitHub
   |
   v
GitHub Actions
   |
   +--> Lint
   |
   +--> Unit Tests
   |
   +--> Security Scan
   |
   +--> Docker Build
   |
   v
Container Registry
```

### Phase 5 — Kubernetes

Deploy:

```text
GitHub
   |
   v
GitHub Actions
   |
   v
Docker Image
   |
   v
Container Registry
   |
   v
Kubernetes
   |
   +--> Deployment
   +--> Service
   +--> ConfigMap
   +--> Secret
   +--> Ingress
   +--> HPA
```

### Phase 6 — AWS

A possible AWS architecture:

```text
                    Internet
                       |
                       v
                  Route 53
                       |
                       v
                     ALB
                       |
                       v
                 Amazon EKS
                       |
              +--------+--------+
              |                 |
              v                 v
       Product Service     Other Services
              |
              v
          Amazon RDS
```

Potential AWS services:

* Amazon EKS
* Amazon ECR
* Application Load Balancer
* Amazon RDS
* Amazon ElastiCache
* Amazon S3
* IAM
* Secrets Manager
* CloudWatch
* Route 53

---

# ☸️ Kubernetes Deployment — Future

Example future Kubernetes resources:

```text
k8s/
├── namespace.yaml
├── deployment.yaml
├── service.yaml
├── configmap.yaml
├── secret.yaml
├── ingress.yaml
└── hpa.yaml
```

Useful commands:

```bash
kubectl get nodes
```

```bash
kubectl get pods
```

```bash
kubectl get deployments
```

```bash
kubectl get services
```

```bash
kubectl get ingress
```

View pod logs:

```bash
kubectl logs <pod-name>
```

Describe pod:

```bash
kubectl describe pod <pod-name>
```

---

# 🔐 Production Considerations

Before using this application in production, consider adding:

* Database persistence
* Authentication
* Authorization
* Input validation
* Structured logging
* Centralized logging
* Metrics
* Distributed tracing
* HTTPS/TLS
* Secrets management
* Rate limiting
* API versioning
* Automated tests
* Container vulnerability scanning
* Resource limits
* Kubernetes health probes
* Horizontal Pod Autoscaling
* CI/CD
* Infrastructure as Code

---

# 📈 Production Architecture

A more complete future architecture could look like:

```text
                       Users
                         |
                         v
                   Route 53 / DNS
                         |
                         v
                  Load Balancer
                         |
                         v
                 Kubernetes / EKS
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
      Frontend       Product API     Other APIs
                         |
              +----------+----------+
              |                     |
              v                     v
          PostgreSQL              Redis
              |
              v
          Persistent DB
```

---

# 📋 API Summary

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| GET    | `/`                  | Home HTML page        |
| GET    | `/products-page`     | Products HTML page    |
| GET    | `/product/{id}`      | Product HTML details  |
| GET    | `/api/health`        | Health check          |
| GET    | `/api/products`      | Get all products      |
| GET    | `/api/products/{id}` | Get product by ID     |
| GET    | `/docs`              | Swagger documentation |
| GET    | `/redoc`             | ReDoc documentation   |

---

# 🎯 Learning Objectives

This project helps demonstrate knowledge of:

### Python

* FastAPI
* Pydantic
* Python classes
* REST APIs
* HTTP methods
* JSON responses

### Frontend

* HTML
* CSS
* Jinja2
* Templates
* Static files

### Docker

* Dockerfile
* Docker image
* Docker container
* Docker Compose
* Container logs
* Port mapping
* Non-root containers

### DevOps

* Git
* GitHub
* CI/CD concepts
* Containerization
* Health checks
* Kubernetes
* AWS EKS

---

# 👨‍💻 Developer Workflow

Recommended workflow:

```text
1. Write Code
      |
      v
2. Run Locally
      |
      v
3. Test API
      |
      v
4. Build Docker Image
      |
      v
5. Run Container
      |
      v
6. Test Container
      |
      v
7. Commit Code
      |
      v
8. Push to GitHub
      |
      v
9. GitHub Actions
      |
      v
10. Docker Registry
      |
      v
11. Kubernetes
```

---

# ✅ Quick Start

If everything is already installed, run:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

```bash
cd simple-microservice
```

```bash
docker compose up -d --build
```

Check:

```bash
docker compose ps
```

Check logs:

```bash
docker compose logs -f
```

Open:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

Health:

```text
http://localhost:8000/api/health
```

Products:

```text
http://localhost:8000/api/products
```

Stop:

```bash
docker compose down
```

---

# 🏁 Conclusion

This Product Microservice provides a simple but realistic foundation for learning modern application deployment.

The project combines:

```text
Python
  +
FastAPI
  +
Jinja2
  +
HTML/CSS
  +
REST API
  +
Docker
  +
Git/GitHub
```

It can later be expanded into a complete DevOps project using:

```text
GitHub
    ↓
GitHub Actions
    ↓
Docker
    ↓
ECR
    ↓
Amazon EKS
    ↓
ALB
    ↓
RDS / Redis
    ↓
Monitoring
```

---

## 📄 License

This project is intended for learning and demonstration purposes.

You may modify and extend it for your own projects, portfolio, and DevOps practice.
