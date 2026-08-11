import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../utils/errors';
import { config } from '../utils/config';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = config.RATE_LIMIT_WINDOW_MS, maxRequests: number = config.RATE_LIMIT_MAX_REQUESTS) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    setInterval(() => this.cleanup(), 60000);
  }

  private getKey(req: Request, keyPrefix: string = ''): string {
    const identifier = req.ip || req.socket.remoteAddress || 'unknown';
    return `${keyPrefix}:${identifier}`;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of Object.entries(this.store)) {
      if (value.resetTime < now) {
        delete this.store[key];
      }
    }
  }

  isRateLimited(req: Request, keyPrefix: string = ''): boolean {
    const key = this.getKey(req, keyPrefix);
    const now = Date.now();

    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    this.store[key].count++;
    return this.store[key].count > this.maxRequests;
  }

  getRemainingRequests(req: Request, keyPrefix: string = ''): number {
    const key = this.getKey(req, keyPrefix);
    if (!this.store[key]) return this.maxRequests;
    return Math.max(0, this.maxRequests - this.store[key].count);
  }

  getResetTime(req: Request, keyPrefix: string = ''): number {
    const key = this.getKey(req, keyPrefix);
    if (!this.store[key]) return Date.now() + this.windowMs;
    return this.store[key].resetTime;
  }
}

export const limiter = new RateLimiter();

/**
 * General Rate Limit Middleware
 * Apply to all requests
 */
export const generalRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (!config.ENABLE_RATE_LIMITER) {
    return next();
  }

  if (limiter.isRateLimited(req, 'general')) {
    const resetTime = limiter.getResetTime(req, 'general');
    res.setHeader('Retry-After', Math.ceil((resetTime - Date.now()) / 1000));
    throw new RateLimitError('Too many requests. Please try again later.');
  }

  res.setHeader('X-RateLimit-Limit', config.RATE_LIMIT_MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', limiter.getRemainingRequests(req, 'general'));
  res.setHeader('X-RateLimit-Reset', limiter.getResetTime(req, 'general'));

  next();
};

/**
 * Login/Register Rate Limiter
 * Stricter limits for authentication endpoints
 */
const authLimiter = new RateLimiter(15 * 60 * 1000, Number(process.env.AUTH_RATE_LIMITER || 100));

export const authRateLimiter = (req: Request, res: Response, Next: NextFunction) => {
  if (!config.ENABLE_RATE_LIMITER) return Next();

  if (authLimiter.isRateLimited(req, 'auth')) {
    const resetTime = authLimiter.getResetTime(req, 'auth');
    res.setHeader('Retry-After', Math.ceil((resetTime - Date.now()) / 1000));
    throw new RateLimitError('Too many login attempts. Please try again later.');
  }

  res.setHeader('X-RateLimit-Limit', Number(process.env.AUTH_RATE_LIMITER || 100));
  res.setHeader('X-RateLimit-Remaining', authLimiter.getRemainingRequests(req, 'auth'));
  res.setHeader('X-RateLimit-Reset', authLimiter.getResetTime(req, 'auth'));

  Next();
};

/**
 * AI Service Rate Limiter
 * Prevent excessive AI API calls
 */
const aiLimiter = new RateLimiter(60 * 60 * 1000, Number(process.env.AI_RATE_LIMITER || 100));

export const aiRateLimiter = (req: Request, res: Response, Next: NextFunction) => {
  if (!config.ENABLE_RATE_LIMITER) return Next();

  if (aiLimiter.isRateLimited(req, 'ai')) {
    const resetTime = aiLimiter.getResetTime(req, 'ai');
    res.setHeader('Retry-After', Math.ceil((resetTime - Date.now()) / 1000));
    throw new RateLimitError('AI service rate limit exceeded. Please try again later.');
  }

  res.setHeader('X-RateLimit-Limit', Number(process.env.AI_RATE_LIMITER || 100));
  res.setHeader('X-RateLimit-Remaining', aiLimiter.getRemainingRequests(req, 'ai'));
  res.setHeader('X-RateLimit-Reset', aiLimiter.getResetTime(req, 'ai'));

  Next();
};

/**
 * API Rate Limiter
 * Standard rate limit for normal API endpoints
 */
const apiLimiter = new RateLimiter(5 * 60 * 1000, Number(process.env.API_RATE_LIMITER || 1000));

export const apiRateLimiter = (req: Request, res: Response, Next: NextFunction) => {
  if (!config.ENABLE_RATE_LIMITER) return Next();

  if (apiLimiter.isRateLimited(req, 'api')) {
    const resetTime = apiLimiter.getResetTime(req, 'api');
    res.setHeader('Retry-After', Math.ceil((resetTime - Date.now()) / 1000));
    throw new RateLimitError('API rate limit exceeded. Please try again later.');
  }

  res.setHeader('X-RateLimit-Limit', Number(process.env.API_RATE_LIMITER || 1000));
  res.setHeader('X-RateLimit-Remaining', apiLimiter.getRemainingRequests(req, 'api'));
  res.setHeader('X-RateLimit-Reset', apiLimiter.getResetTime(req, 'api'));

  Next();
};
