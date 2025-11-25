"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserUseCase = void 0;
class GetUserUseCase {
    constructor(userRepository, cacheRepository, monitoringService) {
        this.userRepository = userRepository;
        this.cacheRepository = cacheRepository;
        this.monitoringService = monitoringService;
    }
    async execute(id) {
        const start = Date.now();
        const cacheKey = `user_${id}`;
        // 1. Try Cache
        const cachedUser = this.cacheRepository.get(cacheKey);
        if (cachedUser) {
            this.monitoringService.incrementCacheHit();
            this.cacheRepository.recordResponseTime(Date.now() - start);
            return cachedUser;
        }
        this.monitoringService.incrementCacheMiss();
        // 2. Fetch from Repo (handles queue/concurrency internally)
        const user = await this.userRepository.findById(id);
        // 3. Update Cache if found
        if (user) {
            this.cacheRepository.set(cacheKey, user);
        }
        this.cacheRepository.recordResponseTime(Date.now() - start);
        return user;
    }
}
exports.GetUserUseCase = GetUserUseCase;
