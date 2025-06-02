import axios from "axios";
import API_BASE_URL from "../config/apiConfig";

export interface RateLimiterResponse {
  timestamp: string;
  message: string;
  status: string;
}

interface RateLimitHeaders {
  "x-rate-limit-remaining": string | null;
}

export interface RateLimiterTestResult {
  success: boolean;
  response?: RateLimiterResponse;
  error?: string;
  remainingRequests?: string | null;
  status?: number;
}

class RateLimiterService {
  private apiKey: string = "Pkhj6WgJy8huzY49JDEmT4iXvchOwOlC";
  
  /**
   * Send a test request to the rate limiter endpoint
   * @param includeApiKey Whether to include the API key in the request
   * @returns Result object with status and remaining requests info
   */
  async testRateLimit(includeApiKey: boolean = false): Promise<RateLimiterTestResult> {
    try {
      const headers: Record<string, string> = {};
      
      // Include API key if specified
      if (includeApiKey) {
        headers["X-API-KEY"] = this.apiKey;
      }
      
      const response = await axios.get<RateLimiterResponse>(
        `${API_BASE_URL}/rate-limiter-test/ping`,
        { headers }
      );
      
      // Extract rate limit header
      const remainingRequests = response.headers["x-rate-limit-remaining"] || null;
      
      return {
        success: true,
        response: response.data,
        remainingRequests,
        status: response.status
      };
    } catch (error: any) {
      // Handle axios error
      if (error.response) {
        // Server responded with status code outside the 2xx range
        return {
          success: false,
          error: error.response.data?.message || "Rate limit exceeded",
          status: error.response.status,
          remainingRequests: error.response.headers?.["x-rate-limit-remaining"] || null
        };
      } else {
        // Something else happened
        return {
          success: false,
          error: error.message || "Unknown error occurred",
          status: 0
        };
      }
    }
  }
  
  /**
   * Fire multiple requests in rapid succession to test rate limiting
   * @param count Number of requests to send
   * @param includeApiKey Whether to include the API key in requests
   * @returns Array of test results
   */
    async burstTest(count: number, includeApiKey: boolean = false): Promise<RateLimiterTestResult[]> {
    // Tạo mảng URL endpoints
    const endpoints = Array(count).fill(`${API_BASE_URL}/rate-limiter-test/ping`);
    
    // Tạo headers
    const headers: Record<string, string> = {};
    if (includeApiKey) {
        headers["X-API-KEY"] = this.apiKey;
    }
    
    // Tạo requests
    const requests = endpoints.map(url => 
        fetch(url, { headers }).then(async response => {
        const data = await response.json().catch(() => null);
        
        return {
            success: response.ok,
            response: data,
            error: !response.ok ? (data?.message || "Request failed") : undefined,
            status: response.status,
            remainingRequests: response.headers.get("x-rate-limit-remaining")
        } as RateLimiterTestResult;
        }).catch(error => ({
        success: false,
        error: error.message || "Network error",
        status: 0
        } as RateLimiterTestResult))
    );
    
    // Thực thi tất cả requests
    return Promise.all(requests);
    }
}

export default new RateLimiterService();