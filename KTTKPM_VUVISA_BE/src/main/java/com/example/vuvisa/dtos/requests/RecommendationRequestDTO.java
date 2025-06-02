package com.example.vuvisa.dtos.requests;

import com.example.vuvisa.entities.Product;
import lombok.Data;
import lombok.Getter;

import java.util.List;

@Data
@Getter
public class RecommendationRequestDTO {
    private String userNeed;
    private List<Product> products;
}
