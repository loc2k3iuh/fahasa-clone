package com.example.vuvisa.services.impl;

import com.example.vuvisa.dtos.requests.RecommendationRequestDTO;
import com.example.vuvisa.entities.Product;
import com.example.vuvisa.services.RecommendationService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private final RestTemplate restTemplate = new RestTemplate();

    @NonFinal
    @Value("${openai.url}")
    private final String chatGptApiUrl;

    @NonFinal
    @Value("${openai.api-key}")
    protected final String openaiKey;

    @Override
    public List<Product> getRecommendations(RecommendationRequestDTO request) {
        String prompt = buildPrompt(request.getUserNeed(), request.getProducts());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4");
        body.put("messages", List.of(
                Map.of("role", "system", "content", "You are a product recommendation assistant."),
                Map.of("role", "user", "content", prompt)
        ));

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<JsonNode> response = restTemplate.postForEntity(chatGptApiUrl, requestEntity, JsonNode.class);
        String reply = response.getBody()
                .get("choices").get(0).get("message").get("content").asText();

        return parseProductsFromGptResponse(reply, request.getProducts());
    }

    @Override
    public String buildPrompt(String need, List<Product> products) {
        StringBuilder sb = new StringBuilder();
        sb.append("User need: ").append(need).append("\n");
        sb.append("Product list:\n");
        for (Product product : products) {
            sb.append("- ").append(product.getProductName()).append(", ")
                    .append(product.getDescription()).append(", price: ")
                    .append(product.getPrice()).append("\n");
        }
        sb.append("\nSuggest top 5 most suitable products by name only.");
        return sb.toString();
    }

    @Override
    public List<Product> parseProductsFromGptResponse(String reply, List<Product> allProducts) {
        List<Product> results = new ArrayList<>();
        for (String line : reply.split("\n")) {
            for (Product product : allProducts) {
                if (line.toLowerCase().contains(product.getProductName().toLowerCase())) {
                    results.add(product);
                    break;
                }
            }
        }
        return results;
    }
}
