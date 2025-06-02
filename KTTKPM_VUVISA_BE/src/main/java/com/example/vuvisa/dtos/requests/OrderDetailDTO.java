package com.example.vuvisa.dtos.requests;

import com.example.vuvisa.entities.OrderDetail;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDetailDTO {

    @JsonProperty("order_id")
    private Long orderId;

    @JsonProperty("product_id")
    private Long productId;

    @JsonProperty("product_name")
    private String productName;

    @JsonProperty("quantity")
    private Long quantity;

    @JsonProperty("price")
    private Long price;

    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("stock_quantity")
    private Long stockQuantity;
}
