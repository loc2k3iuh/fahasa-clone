import { toast } from 'sonner';

export interface RateLimiterOptions {
  maxRequests: number;       // Maximum number of requests allowed in the time window
  timeWindowMs: number;      // Time window in milliseconds
  queueEnabled: boolean;     // Whether to queue and retry requests that exceed the limit
  maxQueueSize?: number;     // Maximum size of the queue (if queueing is enabled)
  retryDelayMs?: number;     // Delay between retries in milliseconds
  onLimited?: (endpoint: string) => void; // Callback when a request is rate limited
}

export interface QueuedRequest<T = any> {
  endpoint: string;
  promiseResolve: (value: T) => void;
  promiseReject: (reason?: any) => void;
  execute: () => Promise<T>;
  queuedAt: number;
}

export class RateLimiterClient {
  private options: RateLimiterOptions;
  private windowStart: number;
  private requestCounts: Map<string, number>;
  private requestQueues: Map<string, QueuedRequest[]>;
  private processingQueues: Map<string, boolean>;
  private globalRequestCount: number;

  constructor(options: Partial<RateLimiterOptions> = {}) {
    this.options = {
      maxRequests: options.maxRequests || 100,
      timeWindowMs: options.timeWindowMs || 60000, // Default: 1 minute
      queueEnabled: options.queueEnabled !== undefined ? options.queueEnabled : true,
      maxQueueSize: options.maxQueueSize || 100,
      retryDelayMs: options.retryDelayMs || 1000,
      onLimited: options.onLimited
    };
    
    this.windowStart = Date.now();
    this.requestCounts = new Map();
    this.requestQueues = new Map();
    this.processingQueues = new Map();
    this.globalRequestCount = 0;

    // Start the timer to reset counters when window elapses
    this.startWindowTimer();
  }

  /**
   * Execute a function with rate limiting applied
   * @param endpoint Identifier for the endpoint/service being called
   * @param fn Function that returns a promise to be executed
   * @returns Promise that resolves with the result of fn
   */
  async execute<T>(endpoint: string, fn: () => Promise<T>): Promise<T> {
    // Check if we should reset the window
    this.checkWindowReset();

    // Get current count for this endpoint
    const endpointCount = this.requestCounts.get(endpoint) || 0;
    
    // Check if this endpoint has exceeded its limit
    if (endpointCount >= this.options.maxRequests) {
      if (this.options.onLimited) {
        this.options.onLimited(endpoint);
      }
      
      if (this.options.queueEnabled) {
        return this.queueRequest(endpoint, fn);
      } else {
        throw new Error(`Rate limit exceeded for endpoint: ${endpoint}`);
      }
    }

    // Check if global limit is exceeded
    if (this.globalRequestCount >= this.options.maxRequests) {
      if (this.options.queueEnabled) {
        return this.queueRequest(endpoint, fn);
      } else {
        throw new Error("Global rate limit exceeded");
      }
    }
    
    // Update counts and execute the function
    this.incrementCount(endpoint);
    
    try {
      return await fn();
    } catch (error: any) {
      // If API returns a 429 (Too Many Requests), queue the request if enabled
      if (error?.response?.status === 429 && this.options.queueEnabled) {
        console.warn(`Received 429 from server for ${endpoint}, queuing request`);
        return this.queueRequest(endpoint, fn);
      }
      throw error;
    }
  }

  /**
   * Queue a request for later execution
   */
  private queueRequest<T>(endpoint: string, fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (!this.requestQueues.has(endpoint)) {
        this.requestQueues.set(endpoint, []);
      }

      const queue = this.requestQueues.get(endpoint)!;
      
      // Check if queue size limit is reached
      if (queue.length >= (this.options.maxQueueSize || 100)) {
        return reject(new Error(`Queue limit reached for endpoint: ${endpoint}`));
      }
      
      // Add request to queue
      queue.push({
        endpoint,
        promiseResolve: resolve,
        promiseReject: reject,
        execute: fn,
        queuedAt: Date.now()
      });
      
      // Start processing the queue if not already processing
      if (!this.processingQueues.get(endpoint)) {
        this.processQueue(endpoint);
      }
    });
  }

  /**
   * Process queued requests for an endpoint
   */
  private async processQueue(endpoint: string): Promise<void> {
    this.processingQueues.set(endpoint, true);
    
    const queue = this.requestQueues.get(endpoint) || [];
    
    while (queue.length > 0) {
      // Check if we need to wait for the next time window
      this.checkWindowReset();
      
      // Check if we can execute more requests in this window
      const endpointCount = this.requestCounts.get(endpoint) || 0;
      if (endpointCount >= this.options.maxRequests || 
          this.globalRequestCount >= this.options.maxRequests) {
        
        // Wait for retry delay before checking again
        await new Promise(resolve => setTimeout(resolve, this.options.retryDelayMs));
        continue;
      }
      
      // Get next request from queue
      const request = queue.shift()!;
      
      // Update counts
      this.incrementCount(endpoint);
      
      try {
        // Execute the request
        const result = await request.execute();
        request.promiseResolve(result);
      } catch (error: any) {
        // If it's a 429, put back in queue if not too old
        if (error?.response?.status === 429 && 
            Date.now() - request.queuedAt < 60000) { // Don't retry if queued for more than a minute
          queue.push(request);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.options.retryDelayMs));
        } else {
          request.promiseReject(error);
        }
      }
    }
    
    this.processingQueues.set(endpoint, false);
  }

  /**
   * Increment request count for an endpoint
   */
  private incrementCount(endpoint: string): void {
    const currentCount = this.requestCounts.get(endpoint) || 0;
    this.requestCounts.set(endpoint, currentCount + 1);
    this.globalRequestCount++;
  }

  /**
   * Check if the time window has elapsed and reset counters if needed
   */
  private checkWindowReset(): void {
    const now = Date.now();
    if (now - this.windowStart >= this.options.timeWindowMs) {
      this.windowStart = now;
      this.requestCounts.clear();
      this.globalRequestCount = 0;
    }
  }

  /**
   * Start timer to periodically reset the window
   */
  private startWindowTimer(): void {
    setInterval(() => {
      this.checkWindowReset();
    }, this.options.timeWindowMs);
  }

  /**
   * Get current metrics for the rate limiter
   */
  getMetrics() {
    return {
      windowStart: this.windowStart,
      timeWindowMs: this.options.timeWindowMs,
      globalRequestCount: this.globalRequestCount,
      maxRequests: this.options.maxRequests,
      endpointCounts: Object.fromEntries(this.requestCounts),
      queueSizes: Object.fromEntries(
        Array.from(this.requestQueues.entries())
          .map(([key, queue]) => [key, queue.length])
      ),
      windowEndsAt: this.windowStart + this.options.timeWindowMs,
      remainingTimeMs: this.windowStart + this.options.timeWindowMs - Date.now(),
      remainingRequests: this.options.maxRequests - this.globalRequestCount,
      currentTime: Date.now(),
      timeSinceWindowStartMs: Date.now() - this.windowStart
    };
  }

  /**
   * Wrap an API service with rate limiting
   */
  wrapService<T extends Record<string, Function>>(
    service: T, 
    serviceName: string
  ): T {
    const wrappedService = {} as T;
    
    for (const key of Object.keys(service)) {
      if (typeof service[key] === 'function') {
        (wrappedService as any)[key] = ((...args: any[]) => {
          const endpoint = `${serviceName}.${key}`;
          return this.execute(endpoint, () => service[key](...args));
        }) as any;
      } else {
        (wrappedService as any)[key] = service[key];
      }
    }
    
    return wrappedService;
  }

  /**
   * Update rate limiter options
   */
  updateOptions(newOptions: Partial<RateLimiterOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }
}

// Create default instance
const defaultRateLimiter = new RateLimiterClient({
  onLimited: (endpoint) => {
    toast.warning(`Rate limit reached for ${endpoint}. Request queued.`);
  }
});

export default defaultRateLimiter;