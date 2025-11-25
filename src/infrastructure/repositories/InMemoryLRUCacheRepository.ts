import { ICacheRepository } from "../../domain/ports/ICacheRepository";
import { CacheStats } from "../../domain/entities/CacheStats";

interface CacheEntry<T> {
  value: T;
  expiry: number;
  lastAccessed: number;
}

export class InMemoryLRUCacheRepository implements ICacheRepository {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly TTL_MS = 60 * 1000; // 60s
  private readonly MAX_SIZE = 100;

  private hits = 0;
  private misses = 0;
  private totalResponseTime = 0;
  private requestCount = 0;

  constructor() {
    // Background task: Remove stale entries
    setInterval(() => this.cleanupStaleEntries(), 10000);
  }

  get<T>(key: string): T | null {
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
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

  set<T>(key: string, value: T): void {
    if (this.cache.size >= this.MAX_SIZE && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.TTL_MS,
      lastAccessed: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.totalResponseTime = 0;
    this.requestCount = 0;
  }

  getStats(): CacheStats {
    const avg =
      this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      averageResponseTimeMs: parseFloat(avg.toFixed(2)),
    };
  }

  recordResponseTime(ms: number): void {
    this.totalResponseTime += ms;
    this.requestCount++;
  }

  private cleanupStaleEntries() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) this.cache.delete(key);
    }
  }
}
