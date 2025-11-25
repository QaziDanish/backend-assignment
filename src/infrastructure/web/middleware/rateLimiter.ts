import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  minuteCount: number;
  minuteStart: number;
  burstCount: number;
  burstStart: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export const rateLimiterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip || "unknown";
  const now = Date.now();

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, {
      minuteCount: 0,
      minuteStart: now,
      burstCount: 0,
      burstStart: now,
    });
  }

  const record = rateLimitStore.get(ip)!;

  // Reset counters if windows have passed
  if (now - record.minuteStart > 60000) {
    record.minuteStart = now;
    record.minuteCount = 0;
  }
  if (now - record.burstStart > 10000) {
    record.burstStart = now;
    record.burstCount = 0;
  }

  // Check Limits
  if (record.minuteCount >= 10) {
    res.status(429).json({ error: "Rate limit exceeded (10/min)" });
    return;
  }
  if (record.burstCount >= 5) {
    res.status(429).json({ error: "Burst limit exceeded (5/10s)" });
    return;
  }

  record.minuteCount++;
  record.burstCount++;
  next();
};
