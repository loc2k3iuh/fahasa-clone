package com.example.vuvisa.dtos.responses;

import com.example.vuvisa.entities.Category;
import com.example.vuvisa.entities.Product;
import com.example.vuvisa.enums.CategoryType;
import lombok.Builder;
import lombok.Data;

import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
public class CategoryReponse {
    private Long id;
    private String categoryName;
    private String description;
    private CategoryType categoryType;
    private Set<Long> productIds;


    public static CategoryReponse fromEntity(Category category) {
        return CategoryReponse.builder()
                .id(category.getId())
                .categoryName(category.getCategoryName())
                .description(category.getDescription())
                .categoryType(category.getType())
                .productIds(category.getProducts() != null ?
                        category.getProducts().stream()
                                .map(Product::getId)
                                .collect(Collectors.toSet()) : null).build();

    }
}
