package com.example.vuvisa.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Controller to test and demonstrate the retry functionality.
 * This controller provides endpoints that can be used to test if the retry mechanism is working correctly.
 */
@RestController
@RequestMapping("${api.prefix}/retry-test")
@RequiredArgsConstructor
@Slf4j
public class RetryTestController {

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://httpbin.org")
            .build();

    // Counter to track retry attempts for the simulated failure endpoint
    private final AtomicInteger attemptCount = new AtomicInteger(0);

    // Retry configuration with 2s delay between retries
    private final Retry retryConfig = Retry.backoff(3, Duration.ofSeconds(2))
            .maxBackoff(Duration.ofSeconds(4))
            .doBeforeRetry(retrySignal -> 
                log.warn("Retrying API call attempt: {} due to: {}", 
                    retrySignal.totalRetries() + 1, 
                    retrySignal.failure().getMessage())
            );

    /**
     * Endpoint that demonstrates a successful API call with retry mechanism.
     * This endpoint calls httpbin.org/get which should succeed on the first attempt.
     *
     * @return A response with the result from httpbin.org
     */
    @GetMapping("/success")
    public ResponseEntity<Map<String, Object>> successWithRetry() {
        log.info("Testing successful API call with retry mechanism");

        Map<String, Object> result = webClient.get()
                .uri("/get")
                .retrieve()
                .bodyToMono(Map.class)
                .retryWhen(retryConfig)
                .block();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "API call successful on first attempt");
        response.put("result", result);

        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint that simulates failures and demonstrates the retry mechanism.
     * This endpoint will fail a configurable number of times before succeeding.
     *
     * @param failCount Number of times the call should fail before succeeding
     * @return A response with retry statistics
     */
    @GetMapping("/simulate-failure")
    public ResponseEntity<Map<String, Object>> simulateFailureWithRetry(
            @RequestParam(defaultValue = "2") int failCount) {

        log.info("Testing retry with simulated failures. Will fail {} times before succeeding", failCount);
        attemptCount.set(0);

        Map<String, Object> result = Mono.defer(() -> {
                int attempt = attemptCount.incrementAndGet();
                log.info("Attempt #{}", attempt);

                if (attempt <= failCount) {
                    log.info("Simulating failure on attempt #{}", attempt);
                    return Mono.error(new RuntimeException("Simulated failure on attempt #" + attempt));
                }

                log.info("Succeeding on attempt #{}", attempt);
                Map<String, Object> successMap = new HashMap<>();
                successMap.put("success", true);
                successMap.put("attempt", attempt);
                return Mono.just(successMap);
            })
            .retryWhen(retryConfig)
            .block();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "API call succeeded after retries");
        response.put("configuredFailCount", failCount);
        response.put("totalAttempts", attemptCount.get());
        response.put("result", result);

        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint that demonstrates a real API call that will always fail, exhausting all retry attempts.
     * This endpoint calls a non-existent endpoint which will always return 404.
     *
     * @return A response with error information
     */
    @GetMapping("/always-fail")
    public ResponseEntity<Map<String, Object>> alwaysFailWithRetry() {
        log.info("Testing retry with guaranteed failure (will exhaust all retry attempts)");

        try {
            webClient.get()
                    .uri("/status/404") // This will always return 404
                    .retrieve()
                    .bodyToMono(Map.class)
                    .retryWhen(retryConfig)
                    .block();

            // This should never be reached
            Map<String, Object> unexpectedSuccessMap = new HashMap<>();
            unexpectedSuccessMap.put("message", "Unexpected success");
            return ResponseEntity.ok(unexpectedSuccessMap);
        } catch (Exception e) {
            log.error("All retry attempts exhausted", e);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "All retry attempts exhausted");
            response.put("error", e.getMessage());

            Map<String, Object> retryConfigMap = new HashMap<>();
            retryConfigMap.put("maxAttempts", 3);
            retryConfigMap.put("backoffDuration", "2-4 seconds");
            response.put("retryConfig", retryConfigMap);

            return ResponseEntity.ok(response);
        }
    }
}
