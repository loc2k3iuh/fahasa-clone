package com.example.vuvisa.dtos.requests;

import jakarta.validation.constraints.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateReviewRequest {

    @NotNull(message = "RATING_REQUIRED")
    @Min(value = 1, message = "RATING_MIN_INVALID")
    @Max(value = 5, message = "RATING_MAX_INVALID")
    Long rating;

    @NotBlank(message = "COMMENT_REQUIRED")
    @Size(max = 255, message = "COMMENT_TOO_LONG")
    String comment;

    @NotNull(message = "PRODUCT_ID_REQUIRED")
    Long productId;

    @NotNull(message = "USER_ID_REQUIRED")
    Long userId;
}