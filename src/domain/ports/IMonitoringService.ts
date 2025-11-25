export interface IMonitoringService {
  startRequestTimer(
    method: string,
    route: string
  ): (statusCode: number) => void;
  incrementCacheHit(): void;
  incrementCacheMiss(): void;
  getMetricsContentType(): string;
  getMetrics(): Promise<string>;
}
