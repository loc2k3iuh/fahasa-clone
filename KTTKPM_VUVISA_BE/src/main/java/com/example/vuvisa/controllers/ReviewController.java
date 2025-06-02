package com.example.vuvisa.controllers;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.CreateReviewRequest;
import com.example.vuvisa.dtos.requests.UpdateReviewRequest;
import com.example.vuvisa.dtos.responses.ReviewResponse;
import com.example.vuvisa.services.ReviewService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/reviews")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewController {

    ReviewService reviewService;

    /**
     * Create a new review.
     */
    @PostMapping("")
    public APIResponse<ReviewResponse> createReview(@Valid @RequestBody CreateReviewRequest createReviewRequest) {
        return APIResponse.<ReviewResponse>builder()
                .result(reviewService.createReview(createReviewRequest))
                .message("Review created successfully")
                .build();
    }

    /**
     * Update an existing review.
     */
    @PutMapping("/{id}")
    public APIResponse<ReviewResponse> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReviewRequest updateReviewRequest) {
        // Set the review ID from the path variable
        return APIResponse.<ReviewResponse>builder()
                .result(reviewService.updateReview(id, updateReviewRequest))
                .message("Review updated successfully")
                .build();
    }

    /**
     * Delete a review by its ID.
     */
    @DeleteMapping("/{id}")
    public APIResponse<String> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return APIResponse.<String>builder()
                .message("Review deleted successfully")
                .build();
    }

    /**
     * Get all reviews with pagination.
     */
    @GetMapping("")
    public APIResponse<Page<ReviewResponse>> getAllReviews(Pageable pageable) {
        return APIResponse.<Page<ReviewResponse>>builder()
                .result(reviewService.getAllReviews(pageable))
                .message("Reviews retrieved successfully")
                .build();
    }

    /**
     * Get reviews filtered by User ID.
     */
    @GetMapping("/user/{userId}")
    public APIResponse<List<ReviewResponse>> getReviewsByUserId(@PathVariable Long userId) {
        return APIResponse.<List<ReviewResponse>>builder()
                .result(reviewService.getReviewsByUserId(userId))
                .message("Reviews by user retrieved successfully")
                .build();
    }

    /**
     * Get reviews filtered by Product ID.
     */
    @GetMapping("/product/{productId}")
    public APIResponse<List<ReviewResponse>> getReviewsByProductId(@PathVariable Long productId) {
        return APIResponse.<List<ReviewResponse>>builder()
                .result(reviewService.getReviewsByProductId(productId))
                .message("Reviews by product retrieved successfully")
                .build();
    }
}