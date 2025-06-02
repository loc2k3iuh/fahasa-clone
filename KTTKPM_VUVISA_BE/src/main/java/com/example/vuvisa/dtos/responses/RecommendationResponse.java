package com.example.vuvisa.dtos;

import com.example.vuvisa.entities.Product;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class RecommendationResponse {
    private String chatResponse;
    private List<Product> results;
}
