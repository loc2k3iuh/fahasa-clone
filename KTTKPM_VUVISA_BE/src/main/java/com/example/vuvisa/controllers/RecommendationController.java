package com.example.vuvisa.controllers;

import com.example.vuvisa.dtos.RecommendationResponse;
import com.example.vuvisa.entities.Product;
import com.example.vuvisa.services.OpenAiEmbeddingService;
import com.example.vuvisa.services.ProductRecommendationService;
import com.example.vuvisa.services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/recommend")
public class RecommendationController {

    private final OpenAiEmbeddingService request;

    @GetMapping
    public ResponseEntity<RecommendationResponse> recommend(@RequestParam String userNeed) {
        String chatReply;
        List<Product> results = List.of();

        if (containsProductIntent(userNeed)) {
            results = request.semanticSearch(userNeed);

            String productSummary = results.stream()
                    .map(p -> "- " + p.getProductName() + ": " + p.getDescription())
                    .reduce("", (a, b) -> a + "\n" + b);

            String prompt = "Người dùng cần: " + userNeed + "\n"
                    + "Các sản phẩm phù hợp:\n" + productSummary + "\n"
                    + "Hãy trả lời người dùng một cách tự nhiên và gợi ý thêm nếu cần.";

            chatReply = request.chatWithUser(prompt);
        } else {
            chatReply = request.chatWithUser(userNeed);
        }

        return ResponseEntity.ok(new RecommendationResponse(chatReply, results));
    }

    boolean containsProductIntent(String userNeed) {
        String lower = userNeed.toLowerCase();
        return lower.contains("mua") || lower.contains("sản phẩm") || lower.contains("gợi ý") || lower.contains("tư vấn") || lower.contains("tìm") || lower.contains("giúp");
    }

}