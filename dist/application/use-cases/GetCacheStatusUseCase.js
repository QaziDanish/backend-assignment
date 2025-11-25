"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCacheStatusUseCase = void 0;
class GetCacheStatusUseCase {
    constructor(cacheRepository) {
        this.cacheRepository = cacheRepository;
    }
    execute() {
        return this.cacheRepository.getStats();
    }
}
exports.GetCacheStatusUseCase = GetCacheStatusUseCase;
