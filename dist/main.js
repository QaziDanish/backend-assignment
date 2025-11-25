"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
// Infrastructure
const MockUserRepository_1 = require("./infrastructure/repositories/MockUserRepository");
const InMemoryLRUCacheRepository_1 = require("./infrastructure/repositories/InMemoryLRUCacheRepository");
const PrometheusMonitoringService_1 = require("./infrastructure/services/PrometheusMonitoringService");
const rateLimiter_1 = require("./infrastructure/web/middleware/rateLimiter");
// Use Cases
const GetUserUseCase_1 = require("./application/use-cases/GetUserUseCase");
const CreateUserUseCase_1 = require("./application/use-cases/CreateUserUseCase");
const GetCacheStatusUseCase_1 = require("./application/use-cases/GetCacheStatusUseCase");
const ClearCacheUseCase_1 = require("./application/use-cases/ClearCacheUseCase");
// Controllers
const UserController_1 = require("./interfaces/controllers/UserController");
const app = (0, express_1.default)();
const PORT = 3000;
// ==========================================
// DEPENDENCY INJECTION (Wiring)
// ==========================================
// 1. Initialize Infrastructure
const userRepo = new MockUserRepository_1.MockUserRepository();
const cacheRepo = new InMemoryLRUCacheRepository_1.InMemoryLRUCacheRepository();
const monitoringService = new PrometheusMonitoringService_1.PrometheusMonitoringService();
// 2. Initialize Use Cases
const getUserUC = new GetUserUseCase_1.GetUserUseCase(userRepo, cacheRepo, monitoringService);
const createUserUC = new CreateUserUseCase_1.CreateUserUseCase(userRepo, cacheRepo);
const getCacheStatsUC = new GetCacheStatusUseCase_1.GetCacheStatusUseCase(cacheRepo);
const clearCacheUC = new ClearCacheUseCase_1.ClearCacheUseCase(cacheRepo);
// 3. Initialize Controllers
const userController = new UserController_1.UserController(getUserUC, createUserUC, getCacheStatsUC, clearCacheUC);
// ==========================================
// EXPRESS SETUP
// ==========================================
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Monitoring Middleware (Global)
app.use((req, res, next) => {
    const stopTimer = monitoringService.startRequestTimer(req.method, req.path);
    res.on("finish", () => stopTimer(res.statusCode));
    next();
});
// Rate Limiter
app.use(rateLimiter_1.rateLimiterMiddleware);
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
