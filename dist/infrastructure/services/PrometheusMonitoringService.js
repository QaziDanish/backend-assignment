"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrometheusMonitoringService = void 0;
const client = __importStar(require("prom-client"));
class PrometheusMonitoringService {
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
    startRequestTimer(method, route) {
        const end = this.httpRequestDuration.startTimer();
        return (statusCode) => {
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
exports.PrometheusMonitoringService = PrometheusMonitoringService;
