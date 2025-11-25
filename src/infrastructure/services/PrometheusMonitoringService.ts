import * as client from "prom-client";
import { IMonitoringService } from "../../domain/ports/IMonitoringService";

export class PrometheusMonitoringService implements IMonitoringService {
  private register: client.Registry;
  private httpRequestDuration: client.Histogram;
  private cacheHits: client.Counter;
  private cacheMisses: client.Counter;

  constructor() {
    this.register = new client.Registry();
    client.collectDefaultMetrics({ register: this.register });

    this.httpRequestDuration = new client.Histogram({
      name: "http_request_duration_ms",
      help: "Duration of HTTP requests in ms",
      labelNames: ["method", "route", "code"],
      buckets: [50, 100, 200, 300, 400, 500, 1000],
      registers: [this.register],
    });

    this.cacheHits = new client.Counter({
      name: "cache_hits_total",
      help: "Total number of cache hits",
      registers: [this.register],
    });

    this.cacheMisses = new client.Counter({
      name: "cache_misses_total",
      help: "Total number of cache misses",
      registers: [this.register],
    });
  }

  startRequestTimer(method: string, route: string) {
    const end = this.httpRequestDuration.startTimer();
    return (statusCode: number) => {
      end({ method, route, code: statusCode });
    };
  }

  incrementCacheHit() {
    this.cacheHits.inc();
  }
  incrementCacheMiss() {
    this.cacheMisses.inc();
  }
  getMetricsContentType() {
    return this.register.contentType;
  }
  getMetrics() {
    return this.register.metrics();
  }
}
