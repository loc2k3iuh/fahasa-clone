package com.example.vuvisa.dtos.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartItemResponse {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("product_id")
    private Long productId;
    
    @JsonProperty("product_name")
    private String productName;
    
    @JsonProperty("price")
    private Long price;
    
    @JsonProperty("quantity")
    private Long quantity;
    
    @JsonProperty("subtotal")
    private Long subtotal;

    @JsonProperty("quantity_in_stock")
    private Long quantityInStock;
    
    @JsonProperty("image_url")
    private String imageUrl;
}