package com.example.vuvisa.services.impl;

import com.example.vuvisa.entities.Product;
import com.example.vuvisa.services.OpenAiEmbeddingService;
import com.example.vuvisa.services.ProductRecommendationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductRecommendationServiceImpl implements ProductRecommendationService {

    OpenAiEmbeddingService embeddingService;

    @Override
    public Mono<List<Product>> recommend(String userNeed, List<Product> products) {
        return null;
    }
}
