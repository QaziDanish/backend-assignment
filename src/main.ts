import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

// Infrastructure
import { MockUserRepository } from "./infrastructure/repositories/MockUserRepository";
import { InMemoryLRUCacheRepository } from "./infrastructure/repositories/InMemoryLRUCacheRepository";
import { PrometheusMonitoringService } from "./infrastructure/services/PrometheusMonitoringService";
import { rateLimiterMiddleware } from "./infrastructure/web/middleware/rateLimiter";

// Use Cases
import { GetUserUseCase } from "./application/use-cases/GetUserUseCase";
import { CreateUserUseCase } from "./application/use-cases/CreateUserUseCase";
import { GetCacheStatusUseCase } from "./application/use-cases/GetCacheStatusUseCase";
import { ClearCacheUseCase } from "./application/use-cases/ClearCacheUseCase";

// Controllers
import { UserController } from "./interfaces/controllers/UserController";

const app = express();
const PORT = 3000;

// ==========================================
// DEPENDENCY INJECTION (Wiring)
// ==========================================

// 1. Initialize Infrastructure
const userRepo = new MockUserRepository();
const cacheRepo = new InMemoryLRUCacheRepository();
const monitoringService = new PrometheusMonitoringService();

// 2. Initialize Use Cases
const getUserUC = new GetUserUseCase(userRepo, cacheRepo, monitoringService);
const createUserUC = new CreateUserUseCase(userRepo, cacheRepo);
const getCacheStatsUC = new GetCacheStatusUseCase(cacheRepo);
const clearCacheUC = new ClearCacheUseCase(cacheRepo);

// 3. Initialize Controllers
const userController = new UserController(
  getUserUC,
  createUserUC,
  getCacheStatsUC,
  clearCacheUC
);

// ==========================================
// EXPRESS SETUP
// ==========================================

app.use(cors());
app.use(bodyParser.json());

// Monitoring Middleware (Global)
app.use((req, res, next) => {
  const stopTimer = monitoringService.startRequestTimer(req.method, req.path);
  res.on("finish", () => stopTimer(res.statusCode));
  next();
});

// Rate Limiter
app.use(rateLimiterMiddleware);

// Routes
app.get("/users/:id", userController.getUser);
app.post("/users", userController.createUser);
app.get("/cache-status", userController.getCacheStats);
app.delete("/cache", userController.clearCache);

// Metrics Endpoint
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", monitoringService.getMetricsContentType());
  res.send(await monitoringService.getMetrics());
});

// Start
app.listen(PORT, () => {
  console.log(`Clean Architecture Server running on http://localhost:${PORT}`);
});
