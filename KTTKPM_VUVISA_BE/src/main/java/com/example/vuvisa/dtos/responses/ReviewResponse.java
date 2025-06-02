package com.example.vuvisa.dtos.responses;

import com.example.vuvisa.entities.Review;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewResponse {

    private Long id;

    private Long rating;

    private String comment;

    private UserResponse user;

    private ProductResponse product;

    private LocalDateTime createdAt;

    public static ReviewResponse fromReview(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .user(UserResponse.fromUser(review.getUser())) // Convert the User entity to UserResponse
                .product(review.getProduct() != null ? ProductResponse.fromProduct(review.getProduct()) : null) // Convert the Product entity to ProductResponse
                // Temporarily set to current time until the database schema is updated
                .createdAt(LocalDateTime.now())
                .build();
    }
}
