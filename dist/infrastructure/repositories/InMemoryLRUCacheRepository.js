"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryLRUCacheRepository = void 0;
class InMemoryLRUCacheRepository {
    constructor() {
        this.cache = new Map();
        this.TTL_MS = 60 * 1000; // 60s
        this.MAX_SIZE = 100;
        this.hits = 0;
        this.misses = 0;
        this.totalResponseTime = 0;
        this.requestCount = 0;
        // Background task: Remove stale entries
        setInterval(() => this.cleanupStaleEntries(), 10000);
    }
    get(key) {
        if (this.cache.has(key)) {
            const entry = this.cache.get(key);
            if (Date.now() > entry.expiry) {
                this.cache.delete(key);
                this.misses++;
                return null;
            }
            // LRU: Refresh access (delete and re-add to end)
            entry.lastAccessed = Date.now();
            this.cache.delete(key);
            this.cache.set(key, entry);
            this.hits++;
            return entry.value;
        }
        this.misses++;
        return null;
    }
    set(key, value) {
        if (this.cache.size >= this.MAX_SIZE && !this.cache.has(key)) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey)
                this.cache.delete(firstKey);
        }
        this.cache.set(key, {
            value,
            expiry: Date.now() + this.TTL_MS,
            lastAccessed: Date.now(),
        });
    }
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
        this.totalResponseTime = 0;
        this.requestCount = 0;
    }
    getStats() {
        const avg = this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;
        return {
            hits: this.hits,
            misses: this.misses,
            size: this.cache.size,
            averageResponseTimeMs: parseFloat(avg.toFixed(2)),
        };
    }
    recordResponseTime(ms) {
        this.totalResponseTime += ms;
        this.requestCount++;
    }
    cleanupStaleEntries() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry)
                this.cache.delete(key);
        }
    }
}
exports.InMemoryLRUCacheRepository = InMemoryLRUCacheRepository;
