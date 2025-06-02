package com.example.vuvisa.configurations;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Configuration class for rate limiting functionality.
 * Uses Caffeine as the cache provider for storing rate limit buckets.
 */
@Configuration
@EnableCaching
public class RateLimiterConfig {

    /**
     * Configures the cache manager using Caffeine.
     * This cache will be used to store rate limit buckets for different API clients.
     *
     * @return The configured cache manager
     */
    @Bean(name = "rateLimiterCacheManager") // 👈 unique name
    public CacheManager rateLimiterCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("rate-limit-buckets");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(10000)
                .expireAfterAccess(1, TimeUnit.HOURS)
                .recordStats());
        return cacheManager;
    }
}