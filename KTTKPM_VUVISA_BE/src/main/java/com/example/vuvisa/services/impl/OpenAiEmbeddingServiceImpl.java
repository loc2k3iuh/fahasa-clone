package com.example.vuvisa.services.impl;

import com.example.vuvisa.entities.Product;
import com.example.vuvisa.repositories.ProductRepository;
import com.example.vuvisa.services.OpenAiEmbeddingService;
import com.example.vuvisa.services.ProductService;
import com.nimbusds.jose.util.Pair;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAiEmbeddingServiceImpl implements OpenAiEmbeddingService {

    @Value("${cohere.api-key}")
    private String cohereApiKey;

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://api.cohere.ai")
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    private final ProductRepository productRepository;
    private final Random random = new Random();

    // Retry configuration with 3-5s delay between retries
    private final Retry retryConfig = Retry.backoff(3, Duration.ofSeconds(50))
            .maxBackoff(Duration.ofSeconds(55))
            .jitter(0.5)
            .doBeforeRetry(retrySignal ->
                log.warn("Retrying API call attempt: {} due to: {}",
                    retrySignal.totalRetries() + 1,
                    retrySignal.failure().getMessage())
            );

    private static final int MAX_COHERE_BATCH_SIZE = 90;

    @Override
    public List<Product> semanticSearch(String query) {
        log.info("Performing semantic search for query: {}", query);

        List<Product> productList = productRepository.findAll();
        List<String> allTexts = productList.stream()
                .map(p -> p.getProductName() + ": " + p.getDescription())
                .toList();

        // Get embedding for user query
        List<Double> queryEmbedding = getEmbeddings(
                List.of(query), "search_query"
        ).get(0);

        // Results from all batches
        List<Pair<Product, Double>> allScored = new ArrayList<>();

        int batchSize = MAX_COHERE_BATCH_SIZE;
        for (int i = 0; i < allTexts.size(); i += batchSize) {
            int end = Math.min(i + batchSize, allTexts.size());

            List<String> batchTexts = allTexts.subList(i, end);
            List<Product> batchProducts = productList.subList(i, end);

            List<List<Double>> batchEmbeddings = getEmbeddings(batchTexts, "search_document");

            for (int j = 0; j < batchEmbeddings.size(); j++) {
                double score = cosineSimilarity(batchEmbeddings.get(j), queryEmbedding);
                allScored.add(Pair.of(batchProducts.get(j), score));
            }
        }

        // Trả về top 5 sản phẩm có điểm cao nhất
        return allScored.stream()
                .sorted((a, b) -> Double.compare(b.getRight(), a.getRight()))
                .limit(5)
                .map(Pair::getLeft)
                .toList();
    }

    public String chatWithUser(String message) {
        log.info("Sending chat request to Cohere API");

        Map<String, Object> payload = Map.of(
                "message", message,
                "chat_history", List.of(),
                "model", "command-r-plus",
                "temperature", 0.5
        );

        try {
            Map response = webClient.post()
                    .uri("/v1/chat")
                    .header("Authorization", "Bearer " + cohereApiKey)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .retryWhen(retryConfig)
                    .block();

            if (response != null) {
                return ((Map<String, String>) response).get("text");
            }

            throw new RuntimeException("Empty response from Cohere API");
        } catch (Exception e) {
            log.error("Failed to chat with Cohere after retries: {}", e.getMessage());
            throw new RuntimeException("Failed to chat with Cohere: " + e.getMessage());
        }
    }

    private List<List<Double>> getEmbeddings(List<String> texts, String inputType) {
        log.info("Getting embeddings from Cohere API for {} texts with input type: {}", texts.size(), inputType);

        Map<String, Object> payload = Map.of(
                "model", "embed-v4.0",
                "input_type", inputType,
                "texts", texts
        );

        try {
            Map response = webClient.post()
                    .uri("/v1/embed")
                    .header("Authorization", "Bearer " + cohereApiKey)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .retryWhen(retryConfig)
                    .block();

            if (response != null) {
                Object embeddingsObj = response.get("embeddings");
                if (embeddingsObj instanceof List<?>) {
                    return ((List<?>) embeddingsObj).stream()
                            .filter(e -> e instanceof List<?>)
                            .map(e -> ((List<?>) e).stream()
                                    .map(n -> ((Number) n).doubleValue())
                                    .toList()
                            )
                            .toList();
                }
            }

            throw new RuntimeException("Invalid response format from Cohere API");
        } catch (Exception e) {
            log.error("Failed to get embeddings after retries: {}", e.getMessage());
            throw new RuntimeException("Failed to get embeddings from Cohere API: " + e.getMessage());
        }
    }

    private double cosineSimilarity(List<Double> vecA, List<Double> vecB) {
        double dot = 0.0, normA = 0.0, normB = 0.0;
        for (int i = 0; i < vecA.size(); i++) {
            dot += vecA.get(i) * vecB.get(i);
            normA += Math.pow(vecA.get(i), 2);
            normB += Math.pow(vecB.get(i), 2);
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

}
