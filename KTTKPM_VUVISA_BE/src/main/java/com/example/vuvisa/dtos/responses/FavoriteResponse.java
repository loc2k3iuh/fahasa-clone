package com.example.vuvisa.dtos.responses;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FavoriteResponse {
    
    Long id;
    Long userId;
    String username;
    Long productId;
    String productName;
    String productImageUrl;
    Long productPrice;
    Date createdDate;
}