package com.example.vuvisa.dtos.responses;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductFavoriteResponse {
    
    Long productId;
    String productName;
    String description;
    Long price;
    Long stockQuantity;
    String imageUrl;
    Long categoryId;
    String categoryName;
    Long favoriteCount;
    Boolean isFavorited;
}