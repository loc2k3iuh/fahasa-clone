package com.example.vuvisa.configurations;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Filter that applies rate limiting to incoming HTTP requests.
 * Uses the token bucket algorithm implemented by Bucket4j.
 */
@Component
public class RateLimiterFilter extends OncePerRequestFilter {
    private final CacheManager rateLimiterCacheManager;

    private final ConcurrentHashMap<String, Bucket> localCache = new ConcurrentHashMap<>();

    @Value("${rate.limit.capacity:100}")
    private int capacity;

    @Value("${rate.limit.refill-tokens:100}")
    private int refillTokens;

    @Value("${rate.limit.refill-duration:60}")
    private int refillDuration;

    @Value("${rate.limit.api-key-header:X-API-KEY}")
    private String apiKeyHeader;

    @Value("${rate.limit.enabled:true}")
    private boolean enabled;

    public RateLimiterFilter(@Qualifier("rateLimiterCacheManager") CacheManager rateLimiterCacheManager) {
        this.rateLimiterCacheManager = rateLimiterCacheManager;

    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!enabled) {
            filterChain.doFilter(request, response);
            return;
        }

        // Get client identifier (API key or IP address)
        String clientId = getClientIdentifier(request);

        // Get or create bucket for this client
        Bucket bucket = getBucket(clientId);

        // Try to consume a token
        if (bucket.tryConsume(1)) {
            // Request allowed, add rate limit headers
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(bucket.getAvailableTokens()));
            filterChain.doFilter(request, response);
        } else {
            // Request denied due to rate limiting
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded. Please try again later.\"}");
        }
    }

    private String getClientIdentifier(HttpServletRequest request) {
        // Try to get API key from header
        String apiKey = request.getHeader(apiKeyHeader);

        // If API key is not provided, use client IP address
        if (apiKey == null || apiKey.isEmpty()) {
            // Get client IP, considering X-Forwarded-For header for proxied requests
            String clientIp = request.getHeader("X-Forwarded-For");
            if (clientIp == null || clientIp.isEmpty()) {
                clientIp = request.getRemoteAddr();
            } else {
                // X-Forwarded-For might contain multiple IPs, use the first one
                clientIp = clientIp.split(",")[0].trim();
            }
            return "ip:" + clientIp;
        }

        return "api-key:" + apiKey;
    }

    private Bucket getBucket(String clientId) {
        // Try to get from local cache first for performance
        Bucket bucket = localCache.get(clientId);
        if (bucket != null) {
            return bucket;
        }

        // Luôn sử dụng rateLimiterCacheManager (Caffeine)
        var cache = rateLimiterCacheManager.getCache("rate-limit-buckets");
        if (cache != null) {
            bucket = cache.get(clientId, Bucket.class);
            if (bucket == null) {
                bucket = createNewBucket();
                cache.put(clientId, bucket);
            }
        }

        // Fallback
        if (bucket == null) {
            bucket = createNewBucket();
        }

        localCache.put(clientId, bucket);
        return bucket;
    }

    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(capacity, Refill.greedy(refillTokens, Duration.ofSeconds(refillDuration)));
        return Bucket4j.builder().addLimit(limit).build();
    }
}
