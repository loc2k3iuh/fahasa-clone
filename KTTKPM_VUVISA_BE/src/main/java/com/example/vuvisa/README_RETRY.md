# Retry System

This document describes the retry system implemented in the Vuvisa application.

## Overview

The retry system is designed to handle transient failures when making external API calls. This helps to:

- Improve reliability of external API integrations
- Handle temporary network issues gracefully
- Reduce error rates in production
- Provide better user experience by automatically recovering from temporary failures

## Implementation

The retry system is implemented using the following components:

1. **Reactor Retry**: A reactive retry mechanism from Project Reactor
2. **WebClient**: Spring's reactive web client for making HTTP requests
3. **Backoff Strategy**: Exponential backoff with jitter to prevent thundering herd problems

## How It Works

The retry system uses an exponential backoff algorithm:

1. When an API call fails, the system waits for a specified duration before retrying
2. Each subsequent retry increases the wait time (backoff)
3. A jitter factor is applied to prevent all retries happening simultaneously
4. The system logs each retry attempt with details about the failure
5. After a maximum number of retries, if the call still fails, an exception is thrown

## Configuration

The retry configuration is defined in the service classes that need retry functionality:

```java
// Retry configuration with backoff between retries
private final Retry retryConfig = Retry.backoff(3, Duration.ofSeconds(2))
        .maxBackoff(Duration.ofSeconds(4))
        .doBeforeRetry(retrySignal -> 
            log.warn("Retrying API call attempt: {} due to: {}", 
                retrySignal.totalRetries() + 1, 
                retrySignal.failure().getMessage())
        );
```

Key parameters:
- `3`: Maximum number of retry attempts
- `Duration.ofSeconds(2)`: Initial backoff duration
- `maxBackoff(Duration.ofSeconds(4))`: Maximum backoff duration
- `jitter(0.5)`: Jitter factor to randomize retry timing (optional)

## Usage with WebClient

The retry configuration is applied to WebClient calls using the `retryWhen` operator:

```java
webClient.get()
        .uri("/api/endpoint")
        .retrieve()
        .bodyToMono(ResponseType.class)
        .retryWhen(retryConfig)
        .block();
```

## Testing

You can test the retry system using the test endpoints:

```
GET /vuvisa/api/v1/retry-test/success
```
This endpoint makes a call to httpbin.org/get which should succeed on the first attempt.

```
GET /vuvisa/api/v1/retry-test/simulate-failure?failCount=2
```
This endpoint simulates failures and demonstrates the retry mechanism. It will fail the specified number of times (default: 2) before succeeding.

```
GET /vuvisa/api/v1/retry-test/always-fail
```
This endpoint makes a call that will always fail, exhausting all retry attempts.

## Customization

The retry system can be customized for different services by:

1. Adjusting the maximum number of retries
2. Changing the backoff duration
3. Modifying the jitter factor
4. Adding custom retry predicates to only retry on specific exceptions
5. Implementing custom logging or monitoring for retry attempts

## Best Practices

1. **Don't retry non-idempotent operations**: Only apply retry to operations that can be safely repeated
2. **Set reasonable timeouts**: Ensure that each attempt has a reasonable timeout
3. **Limit max retries**: Don't retry indefinitely, set a reasonable maximum
4. **Use jitter**: Always use jitter to prevent synchronized retry storms
5. **Log retry attempts**: Monitor and log retry attempts to identify recurring issues