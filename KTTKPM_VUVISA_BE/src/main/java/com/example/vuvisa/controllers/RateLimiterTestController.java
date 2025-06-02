package com.example.vuvisa.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller to test and demonstrate the rate limiter functionality.
 * This controller provides endpoints that can be used to test if the rate limiter is working correctly.
 */
@RestController
@RequestMapping("${api.prefix}/rate-limiter-test")
public class RateLimiterTestController {

    /**
     * Simple endpoint to test the rate limiter.
     * This endpoint returns the current time and a success message.
     * If the rate limiter is working, this endpoint will return a 429 Too Many Requests
     * response after the rate limit is exceeded.
     *
     * @return A response with the current time and a success message
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("message", "Rate limiter test successful");
        response.put("status", "OK");
        
        return ResponseEntity.ok(response);
    }
}