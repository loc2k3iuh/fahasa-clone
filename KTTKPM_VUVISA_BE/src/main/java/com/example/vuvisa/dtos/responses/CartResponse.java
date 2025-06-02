package com.example.vuvisa.dtos.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartResponse {
    
    @JsonProperty("id")
    private Long id;

    @JsonProperty("user_id")
    private Long userId;
    
    @JsonProperty("created_date")
    private Date createdDate;
    
    @JsonProperty("updated_date")
    private Date updatedDate;
    
    @JsonProperty("items")
    private List<CartItemResponse> items = new ArrayList<>();
    
    @JsonProperty("total_items")
    private Integer totalItems;
    
    @JsonProperty("total_price")
    private Long totalPrice;
}