import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import API_BASE_URL from '../config/apiConfig';

export interface RateLimitOptions {
  maxRequests: number;
  timeWindowMs: number;
  queueEnabled: boolean;
  maxQueueSize: number;
  retryDelayMs: number;
}

// Token bucket implementation for rate limiting
class TokenBucket {
  private tokens: number;
  private lastRefillTime: number;
  private maxTokens: number;
  private refillRate: number;  // tokens per ms

  constructor(maxTokens: number, refillTimeMs: number) {
    this.tokens = maxTokens;
    this.maxTokens = maxTokens;
    this.lastRefillTime = Date.now();
    this.refillRate = maxTokens / refillTimeMs;
  }

  async getToken(): Promise<boolean> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsedTimeMs = now - this.lastRefillTime;
    
    // Calculate tokens to add based on elapsed time
    const newTokens = elapsedTimeMs * this.refillRate;
    
    if (newTokens > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
      this.lastRefillTime = now;
    }
  }

  getRefillTimeForTokens(tokenCount: number): number {
    if (this.tokens >= tokenCount) return 0;
    
    const tokensNeeded = tokenCount - this.tokens;
    return Math.ceil(tokensNeeded / this.refillRate);
  }

  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }

  getStatus(): {
    availableTokens: number;
    maxTokens: number;
    refillRate: number;
    msUntilNext: number;
  } {
    this.refill();
    return {
      availableTokens: this.tokens,
      maxTokens: this.maxTokens,
      refillRate: this.refillRate,
      msUntilNext: this.tokens < 1 ? Math.ceil(1 / this.refillRate) : 0
    };
  }
}

interface PendingRequest {
  id: string;
  config: AxiosRequestConfig;
  startTime: number;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RateLimitedApiClient {
  private axios: AxiosInstance;
  private options: RateLimitOptions;
  private bucket: TokenBucket;
  private requestQueue: PendingRequest[] = [];
  private isProcessingQueue = false;
  private completedRequests = 0;
  private limitedRequests = 0;
  
  constructor(options?: Partial<RateLimitOptions>) {
    this.options = {
      maxRequests: options?.maxRequests || 50,
      timeWindowMs: options?.timeWindowMs || 30000, // 30 seconds
      queueEnabled: options?.queueEnabled !== undefined ? options?.queueEnabled : true,
      maxQueueSize: options?.maxQueueSize || 100,
      retryDelayMs: options?.retryDelayMs || 500,
    };

    // Create token bucket with configured limits
    this.bucket = new TokenBucket(this.options.maxRequests, this.options.timeWindowMs);

    // Create axios instance
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Execute a rate-limited request with proper queuing
   */
  private async executeRateLimited<T>(config: AxiosRequestConfig): Promise<T> {
    // Generate unique ID for this request
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if we can get a token immediately
    const canProceed = await this.bucket.getToken();
    
    if (canProceed) {
      // We have capacity, execute immediately
      this.completedRequests++;
      return this.axios.request(config).then(response => response.data);
    } else if (!this.options.queueEnabled) {
      // No capacity and queuing disabled - reject immediately
      this.limitedRequests++;
      const status = this.bucket.getStatus();
      const error = new Error(`Rate limit exceeded. Try again in ${Math.ceil(status.msUntilNext/1000)} seconds.`);
      (error as any).isRateLimit = true;
      throw error;
    }
    
    // Need to queue - check if queue has space
    if (this.requestQueue.length >= this.options.maxQueueSize) {
      this.limitedRequests++;
      throw new Error('Request queue is full. Try again later.');
    }
    
    // Add to queue and wait for execution
    return new Promise<T>((resolve, reject) => {
      const pendingRequest: PendingRequest = {
        id: requestId,
        config,
        startTime: Date.now(),
        execute: () => this.axios.request(config).then(response => response.data),
        resolve,
        reject
      };
      
      this.requestQueue.push(pendingRequest);
      
      // Show toast notification for queued requests
      toast.info(`Request queued. Waiting for rate limit (${this.requestQueue.length} in queue)`);
      
      // Start processing queue if not already
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }
  
  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.requestQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }
    
    this.isProcessingQueue = true;
    
    // Attempt to get a token for the next request
    const canProceed = await this.bucket.getToken();
    
    if (canProceed) {
      // We have a token, process the next request
      const request = this.requestQueue.shift()!;
      
      try {
        // Actually execute the request
        const result = await request.execute();
        this.completedRequests++;
        request.resolve(result);
        
        // Log processing time
        const processingTime = Date.now() - request.startTime;
        console.log(`[Rate Limiter] Processed queued request after ${processingTime}ms delay`);
        
      } catch (error) {
        request.reject(error);
      }
      
      // Continue processing queue
      setTimeout(() => this.processQueue(), 10);
    } else {
      // No token available, wait and try again
      const status = this.bucket.getStatus();
      const delayMs = Math.max(this.options.retryDelayMs, status.msUntilNext);
      
      console.log(`[Rate Limiter] Waiting ${delayMs}ms for next token`);
      setTimeout(() => this.processQueue(), delayMs);
    }
  }

  // Public API methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.executeRateLimited<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.executeRateLimited<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.executeRateLimited<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.executeRateLimited<T>({ ...config, method: 'DELETE', url });
  }

  // Get metrics about current rate limiting
  getMetrics() {
    const bucketStatus = this.bucket.getStatus();
    
    return {
      availableTokens: bucketStatus.availableTokens,
      maxTokens: bucketStatus.maxTokens, 
      refillRatePerSecond: bucketStatus.refillRate * 1000,
      msUntilNextToken: bucketStatus.msUntilNext,
      queueLength: this.requestQueue.length,
      queueEnabled: this.options.queueEnabled,
      completedRequests: this.completedRequests,
      limitedRequests: this.limitedRequests,
      totalRequests: this.completedRequests + this.limitedRequests
    };
  }

  // Update options
  updateOptions(newOptions: Partial<RateLimitOptions>): void {
    const oldOptions = {...this.options};
    this.options = { ...this.options, ...newOptions };
    
    // If rate limiting parameters changed, recreate the token bucket
    if (newOptions.maxRequests !== undefined || newOptions.timeWindowMs !== undefined) {
      this.bucket = new TokenBucket(
        this.options.maxRequests, 
        this.options.timeWindowMs
      );
      console.log('[Rate Limiter] Reconfigured:', {
        maxRequests: this.options.maxRequests,
        timeWindowMs: this.options.timeWindowMs,
        queueEnabled: this.options.queueEnabled
      });
    }
  }
  
  // Reset metrics counters
  resetMetrics(): void {
    this.completedRequests = 0;
    this.limitedRequests = 0;
  }
}

// Create a default singleton instance
const rateLimitedApiClient = new RateLimitedApiClient();

export default rateLimitedApiClient;