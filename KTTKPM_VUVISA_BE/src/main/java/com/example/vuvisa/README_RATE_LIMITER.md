# Rate Limiter System

This document describes the rate limiter system implemented in the Vuvisa application.

## Overview

The rate limiter system is designed to limit the number of requests that can be made to the API within a specific time period. This helps to:

- Protect the API from abuse and DoS attacks
- Ensure fair usage of resources
- Maintain service stability under high load
- Enforce usage quotas for different clients

## Implementation

The rate limiter is implemented using the following components:

1. **Bucket4j Library**: A Java rate limiting library based on the token bucket algorithm
2. **Caffeine Cache**: A high-performance caching library used to store rate limit buckets
3. **Spring Filter**: A servlet filter that intercepts all incoming HTTP requests

## How It Works

The rate limiter uses the token bucket algorithm:

1. Each client (identified by IP address or API key) has a bucket with a fixed capacity of tokens
2. Tokens are refilled at a fixed rate (e.g., 100 tokens per minute)
3. Each request consumes one token from the bucket
4. If the bucket has tokens, the request is allowed
5. If the bucket is empty, the request is rejected with a 429 Too Many Requests response

## Configuration

The rate limiter can be configured in the `application.properties` file:

```properties
# Enable or disable the rate limiter
rate.limit.enabled=true

# Maximum number of tokens in the bucket (max burst)
rate.limit.capacity=100

# Number of tokens to add during each refill
rate.limit.refill-tokens=100

# Duration in seconds between refills
rate.limit.refill-duration=60

# Header name for API key
rate.limit.api-key-header=X-API-KEY
```

## Client Identification

Clients are identified in the following order:

1. By API key (if provided in the `X-API-KEY` header)
2. By IP address (if no API key is provided)

For proxied requests, the system uses the `X-Forwarded-For` header to determine the client's IP address.

## Response Headers

The rate limiter adds the following header to responses:

- `X-Rate-Limit-Remaining`: The number of tokens remaining in the client's bucket

## Testing

You can test the rate limiter using the test endpoint:

```
GET /vuvisa/api/v1/rate-limiter-test/ping
```

To test with an API key:

```
GET /vuvisa/api/v1/rate-limiter-test/ping
X-API-KEY: your-api-key
```

If you make more requests than the configured limit within the time window, you will receive a 429 Too Many Requests response.

## Customization

The rate limiter can be customized for different endpoints or client types by extending the `RateLimiterFilter` class and implementing custom logic for bucket creation or client identification.

## Monitoring

The rate limiter uses Caffeine's built-in statistics recording, which can be exposed through JMX or custom metrics for monitoring.