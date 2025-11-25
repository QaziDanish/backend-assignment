import { CacheStats } from "../entities/CacheStats";

export interface ICacheRepository {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  clear(): void;
  getStats(): CacheStats;
  recordResponseTime(ms: number): void;
}
