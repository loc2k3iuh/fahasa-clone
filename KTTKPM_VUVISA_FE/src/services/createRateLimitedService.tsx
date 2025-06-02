import { RateLimiterClient } from './RateLimiterClient';
import defaultRateLimiter from './RateLimiterClient';

/**
 * Create a rate-limited version of an API service
 * @param service The original service to wrap
 * @param serviceName Name to identify this service in rate limiting logs
 * @param customRateLimiter Optional custom rate limiter instance
 * @returns A wrapped version of the service with rate limiting
 */
export function createRateLimitedService<T extends Record<string, Function>>(
  service: T,
  serviceName: string,
  customRateLimiter?: RateLimiterClient
): T {
  const rateLimiter = customRateLimiter || defaultRateLimiter;
  
  return rateLimiter.wrapService(service, serviceName);
}

export default createRateLimitedService;