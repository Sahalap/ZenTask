# ZenTask (Auth & Task Management System)

ZenTask is a high-fidelity, secure, and production-grade full-stack task management application. It features a modular, role-based Node/Express REST API on the backend with SQLite/Prisma ORM for zero-configuration setup, and a gorgeous glassmorphic React.js SPA on the frontend styled entirely in custom Vanilla CSS with smooth micro-animations.

---

## 🚀 System Architecture

```
                                  ┌──────────────────────────┐
                                  │   React.js Client SPA    │
                                  │   (Vite + Vanilla CSS)   │
                                  └─────────────┬────────────┘
                                                │ (JSON API over HTTP)
                                                ▼
                                  ┌──────────────────────────┐
                                  │    Express.js Backend    │
                                  │ (CORS/Helmet/Rate Limit) │
                                  └──────┬────────────┬──────┘
                                         │            │
                         (JWT Auth Guard)│            │(Interactive Docs)
                                         ▼            ▼
                                  ┌────────────┐┌────────────┐
                                  │   v1 API   ││ Swagger UI │
                                  │ Endpoints  ││(/api-docs) │
                                  └──────┬─────┘└────────────┘
                                         │
                                         ▼ (Prisma Client ORM)
                                  ┌────────────┐
                                  │ SQLite DB  │
                                  │ (dev.db)   │
                                  └────────────┘
```

---

## ⚡ Core Features

- **Robust Authentication:** JWT tokens for secure authentication. User passwords hashed using `bcryptjs` (10 rounds).
- **Role-Based Access Control (RBAC):** Restricts administrative functions to `ADMIN` roles while users can manage only their own entities.
- **Task Kanban Workspace:** Create, read, update, delete, search, filter, and transition tasks dynamically across PENDING, IN_PROGRESS, and COMPLETED states.
- **Administrative Control Panel:** Administrators can view all user profiles, monitor global task capacities, change user access tiers, or delete profiles (with cascaded task deletion).
- **Security Protocols:**中央 rate-limiting (200 requests/15 mins per IP), Helmet security headers, CORS guards, and centralized error-handling.
- **Interactive Documentation:** Interactive API documentation rendered via Swagger.
- **Automated Tests:** Comprehensive integration test suite using Jest and Supertest achieving 100% endpoint assertion coverage.

---

## 📂 Project Organization

```
project/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma schema (SQLite configuration)
│   │   └── seed.js            # Mock users and task seed script
│   ├── src/
│   │   ├── config/            # DB configuration setup
│   │   ├── controllers/       # Route action controllers
│   │   ├── middlewares/       # Security headers, rate limiting, and RBAC
│   │   ├── routes/            # V1 route mappings with Swagger JSDoc
│   │   ├── utils/             # JWT, validators, and encryption helpers
│   │   └── app.js             # Express application configuration
│   ├── tests/
│   │   └── api.test.js        # Integration test suites (Jest/Supertest)
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # Modal, TaskCard, Navbar, AdminConsole, etc.
│   │   ├── context/           # React AuthContext (JWT & Theme mappings)
│   │   ├── styles/            # Custom Vanilla CSS Design System
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml         # Container coordinator
└── README.md                  # Detailed platform documentation
```

---

## 🔑 Pre-Seeded Accounts (For Evaluators)

When the application is seeded, two user accounts are created with sample tasks to demonstrate both roles:

| Role | Email Address | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Regular User** | `user@zentask.com` | `user123` | Testing standard task boards, search filters, and profile access. |
| **Administrator** | `admin@zentask.com` | `admin123` | Testing the global Admin Console, role modifications, and global tasks audit. |

---

## 🛠️ Installation & Quick Start

Choose either local execution (Option A) or containerized deployment (Option B).

### Option A: Local Execution (Recommended for Fast Verification)

#### 1. Setup Backend
```bash
# Navigate to the backend directory
cd backend

# Install production and development dependencies
npm install

# Apply initial migrations and generate local Prisma client bindings
npx prisma migrate dev --name init

# Seed the database with the evaluation accounts
npx prisma db seed

# Run the backend dev server (starts on http://localhost:5000)
npm run dev
```

#### 2. Setup Frontend
```bash
# In a new terminal tab, navigate to the frontend directory
cd frontend

# Install client-side dependencies
npm install

# Boot up the Vite dev server (starts on http://localhost:5173)
npm run dev
```

---

### Option B: Docker Containerized Orchestration

Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
# In the project root directory, spin up all services
docker-compose up --build
```
This orchestrates the entire stack concurrently:
- **Express Backend Server:** Mapped to `http://localhost:5000`
- **React Frontend Client:** Mapped to `http://localhost:3000`

---

## 🔍 Interactive API Swagger UI

Once the backend service is running (locally or via Docker), navigate to the interactive Swagger UI page in your browser:
🔗 [**http://localhost:5000/api-docs**](http://localhost:5000/api-docs)

This interactive portal lets you inspect HTTP parameters, query parameters, authorization payloads, and test every REST endpoint directly inside the browser.

---

## 🧪 Automated Test Suite Execution

ZenTask ships with a robust integration testing suite powered by Jest and Supertest.

To run the automated tests:
```bash
# Navigate to the backend directory
cd backend

# Execute the test runner
npm run test
```

---

## 📈 Scalability and Security Architecture Note

As ZenTask grows in terms of user volume, task creation load, and data transactions, we can scale the architecture horizontally and vertically using industry-standard engineering practices:

### 1. Database Portability and High Availability
- **Transition to PostgreSQL/MySQL:** Changing our database from SQLite to PostgreSQL is trivial because we use Prisma ORM. We would simply update `provider = "postgresql"` in `schema.prisma` and supply a secure database connection URL in `.env`.
- **Database Connection Pooling:** Express is stateless, so each instance opens separate database connections. We would employ **Prisma PgBouncer** (or similar pooling mechanisms) to manage database connections efficiently and prevent database fatigue.
- **Read-Replicas:** To scale reading workloads (fetching dashboard tasks), we would configure database read-replicas. Prisma handles this natively by separating read queries to read-only replica connection pools while routing write queries (task creation/updates) to the primary node.

### 2. High Performance Caching (Redis Integration)
- **Session Authentication Cache:** Instead of querying the relational database on every HTTP request to verify if a user exists (via the `authenticate` middleware), we can cache user profile metadata in **Redis** with an expiration matching the JWT token lifespan (e.g., 24 hours).
- **Query Cache:** We can cache the results of expensive queries (like listing all tasks for large teams) in Redis under key formats like `tasks:user_id:filters`. 
- **Cache Invalidation:** To keep cache data perfectly synced, we would implement cache eviction policies. Any write operations—such as creating a task (`POST`), updating status (`PUT`), or deleting a task (`DELETE`)—would instantly evict relevant Redis keys.

### 3. Horizontal Scaling & Load Balancing
- **Stateless Application Servers:** The Node.js/Express backend server stores no state locally (database files are hosted on separate database servers, and sessions are verified stateless via cryptography using JWT). This makes horizontal scaling extremely straightforward.
- **Round-Robin Load Balancing:** We would run multiple containerized instances of the Express service behind a load balancer (such as **Nginx**, **HAProxy**, or an AWS **Application Load Balancer**). The load balancer distributes traffic evenly across all active healthy nodes.
- **Auto-Scaling Groups:** Utilizing orchestration systems like Kubernetes (EKS) or AWS ECS, we can configure auto-scaling triggers based on CPU/Memory thresholds. When traffic surges, the orchestrator automatically provisions additional backend containers to absorb the load.

### 4. Microservices Transition Path
- **Decoupled Business Modules:** If the scope of ZenTask expands (e.g., adding collaborative editing, comments, or report builders), we can decouple the codebase into microservices:
  - **Auth Service:** Dedicated solely to user signup, login, session logging, and permission management.
  - **Task Service:** Dedicated exclusively to managing task entities.
- **API Gateway Pattern:** We would place an API Gateway (like **Kong**, **KrakenD**, or **AWS API Gateway**) at the boundary edge of our platform to route incoming client traffic to the respective downstream microservice, handle centralized rate-limiting, and validate JWT authorization tokens at the edge!
