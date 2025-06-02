package com.example.vuvisa.dtos.requests;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FavoriteRequest {
    
    @NotNull(message = "USER_ID_REQUIRED")
    Long userId;
    
    @NotNull(message = "PRODUCT_ID_REQUIRED")
    Long productId;
}