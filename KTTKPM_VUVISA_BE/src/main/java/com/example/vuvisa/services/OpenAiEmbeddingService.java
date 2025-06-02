package com.example.vuvisa.services;

import java.util.List;

import com.example.vuvisa.entities.Product;
import reactor.core.publisher.Mono;

public interface OpenAiEmbeddingService {

    public List<Product> semanticSearch(String query);

    public String chatWithUser(String message);

}
