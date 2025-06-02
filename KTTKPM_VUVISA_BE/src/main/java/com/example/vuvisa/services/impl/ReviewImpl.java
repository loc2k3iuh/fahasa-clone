package com.example.vuvisa.services.impl;

import com.example.vuvisa.entities.Review;
import com.example.vuvisa.dtos.requests.CreateReviewRequest;
import com.example.vuvisa.dtos.requests.UpdateReviewRequest;
import com.example.vuvisa.dtos.responses.ReviewResponse;
import com.example.vuvisa.exceptions.AppException;
import com.example.vuvisa.exceptions.ErrorCode;
import com.example.vuvisa.repositories.ReviewRepository;
import com.example.vuvisa.repositories.ProductRepository;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.services.ReviewService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Create a new review.
     */
    public ReviewResponse createReview(CreateReviewRequest request) {
        // Fetch associated Product and User
        var product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        var user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Create and save the new Review entity
        var review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .product(product)
                .user(user)
                .build();

        return ReviewResponse.fromReview(reviewRepository.save(review));
    }

    @Override
    public ReviewResponse getReview(String id) {
        var review = reviewRepository.findById(Long.parseLong(id))
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        return ReviewResponse.fromReview(review);
    }

    /**
     * Update an existing review.
     */
    public ReviewResponse updateReview(Long reviewId, UpdateReviewRequest request) {
        // Find the existing review
        var review = reviewRepository.findById(reviewId)
                        .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // Update fields if they are provided
        if (request.getComment() != null) {
            review.setComment(request.getComment());
        }

        // Save updated review
        return ReviewResponse.fromReview(reviewRepository.save(review));
    }

    /**
     * Delete an existing review by its ID.
     */
    public void deleteReview(Long id) {
        // Check if the review exists
        if (!reviewRepository.existsById(id)) {
            throw new AppException(ErrorCode.REVIEW_NOT_FOUND);
        }

        // Delete the review
        reviewRepository.deleteById(id);
    }

    /**
     * Get all reviews with pagination.
     */
    public Page<ReviewResponse> getAllReviews(Pageable pageable) {
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.ASC, "id")
        );
        return reviewRepository.findAll(sortedPageable)
                .map(ReviewResponse::fromReview);
    }

    /**
     * Get reviews filtered by UserId.
     */
    public List<ReviewResponse> getReviewsByUserId(Long userId) {
        return reviewRepository.findAllByUser_Id(userId).stream()
                .map(ReviewResponse::fromReview)
                .collect(Collectors.toList());
    }

    /**
     * Get reviews filtered by ProductId.
     */
    public List<ReviewResponse> getReviewsByProductId(Long productId) {
        return reviewRepository.findAllByProduct_Id(productId).stream()
                .map(ReviewResponse::fromReview)
                .collect(Collectors.toList());
    }
}