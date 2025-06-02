package com.example.vuvisa.services;

import com.example.vuvisa.entities.Product;
import reactor.core.publisher.Mono;

import java.util.List;

public interface ProductRecommendationService {

    public Mono<List<Product>> recommend(String userNeed, List<Product> products);

    public record ProductScore(Product product, double score) {}
}
