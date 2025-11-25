# Expert-Level User Data API (Clean Architecture)

A high-performance, robust Express.js API designed to serve user data
with advanced caching, rate limiting, and asynchronous processing. This
project strictly adheres to **Clean Architecture (Onion/Hexagonal
Architecture)** principles, ensuring complete decoupling of business
logic from infrastructure.

---

## 🏗 Architectural Design

The solution follows the **Dependency Rule**, where source code
dependencies only point inwards.\
The core business logic knows nothing about the database, the web
framework, or external services.

---

## 📚 Layer Breakdown

### **1. Domain Layer (`src/domain`)**

- **Role:** Enterprise business rules\
- **Contents:** Entities (`User`, `CacheStats`), Repository Interfaces
  (Ports)\
- **Dependencies:** None --- pure TypeScript

### **2. Application Layer (`src/application`)**

- **Role:** Application business logic (Use Cases)\
- **Contents:** `GetUserUseCase`, `CreateUserUseCase`\
- **Logic Flow:**
  - Check Cache\
  - If cache miss → Queue DB Fetch\
  - Update Cache\
  - Return response

### **3. Interface Adapters Layer (`src/interfaces`)**

- **Role:** Data conversion between use cases and external I/O\
- **Contents:** `UserController`

### **4. Infrastructure Layer (`src/infrastructure`)**

- **Role:** Frameworks and drivers\
- **Contents:**
  - **Repositories:** `InMemoryLRUCacheRepository`,
    `MockUserRepository`\
  - **Services:** `PrometheusMonitoringService`\
  - **Web:** Express server, Rate Limit Middleware

---

## 🚀 Key Technical Features

### **1. Advanced Caching (LRU Strategy)**

- Custom in-memory **Least Recently Used (LRU)** cache\
- **TTL:** 60 seconds\
- **Max Capacity:** 100 items\
- **Cleanup:** Background interval every 10 seconds\
- **File:**
  `src/infrastructure/repositories/InMemoryLRUCacheRepository.ts`

---

### **2. Concurrency & Request Coalescing**

- Avoids duplicate DB fetches for simultaneous requests\
- If a request for the same ID is already in-flight, other requests
  **subscribe** to the same Promise\
- **File:** `src/infrastructure/repositories/MockUserRepository.ts`

---

### **3. Asynchronous Processing Queue**

- Simple in-memory queue throttling DB access\
- Prevents system overload with controlled concurrency

---

### **4. Sophisticated Rate Limiting**

Algorithm: **Token Bucket / Sliding Window**

Rules: - **10 req/min** standard limit\

- **5 req / 10 sec** burst limit

Response: - Returns **429 Too Many Requests** with specific messages

---

### **5. Monitoring (Bonus)**

Using **prom-client** for Prometheus metrics.

Tracked Metrics: - `http_request_duration_ms` - `cache_hits_total` -
`cache_misses_total`

---

## 📂 Project Structure

    backend-assignment/
    ├── src/
    │   ├── domain/                  # Entities & Interface Definitions
    │   ├── application/             # Use Case Orchestration
    │   ├── interfaces/              # Controllers
    │   ├── infrastructure/          # Database, Cache, Web Framework impl
    │   └── main.ts                  # Dependency Injection Root
    ├── package.json
    └── tsconfig.json

---

## 🛠 Setup & Installation

### **Prerequisites**

- Node.js (v14+)
- npm

### **Installation**

```bash
git clone <repository-url>
cd backend-assignment
npm install
```

### **Running the Application**

Development:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

Server runs on **port 3000**.

---

## 🧪 Testing the API

### **1. Fetch User (Caching & Concurrency)**

**GET** `http://localhost:3000/users/1`

Expected: - First request: \~200ms (**Cache Miss**)\

- Second request: \~1--5ms (**Cache Hit**)\
- 10 parallel requests → only **one** DB operation

---

### **2. Rate Limiting**

Send \>5 requests in 10 seconds.

Expected: - **429 Too Many Requests --- "Burst limit exceeded"**

---

### **3. Create User (Write-Through Cache)**

**POST** `http://localhost:3000/users`

Body:

```json
{ "name": "New User", "email": "new@test.com" }
```

Result: - User created & immediately stored in cache

---

### **4. Monitoring & Stats**

- **Cache Stats:** `GET /cache-status`
- **Prometheus Metrics:** `GET /metrics`

### **5. Administrative**

- **Clear Cache:** `DELETE /cache`

---

## ⚖️ Trade-offs & Decisions

### **In-Memory Cache vs Redis**

- In-memory used to demonstrate algorithmic understanding\
- Clean Architecture allows easy swap to Redis later

### **Manual Queue vs BullMQ**

- Native JS queue used for simplicity\
- Production systems recommended to use **BullMQ** or similar

---
