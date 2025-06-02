package com.example.vuvisa.services;

import com.example.vuvisa.dtos.requests.RecommendationRequestDTO;
import com.example.vuvisa.entities.Product;

import java.util.List;

public interface RecommendationService {

    List<Product> getRecommendations(RecommendationRequestDTO request);
    String buildPrompt(String need, List<Product> products);
    List<Product> parseProductsFromGptResponse(String reply, List<Product> allProducts);

}
