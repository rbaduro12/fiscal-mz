import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitOptions {
  maxRequests: number;
  windowSeconds: number;
}

export const RateLimit = (maxRequests: number, windowSeconds: number) =>
  SetMetadata(RATE_LIMIT_KEY, { maxRequests, windowSeconds });
