"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearCacheUseCase = void 0;
class ClearCacheUseCase {
    constructor(cacheRepository) {
        this.cacheRepository = cacheRepository;
    }
    execute() {
        this.cacheRepository.clear();
    }
}
exports.ClearCacheUseCase = ClearCacheUseCase;
