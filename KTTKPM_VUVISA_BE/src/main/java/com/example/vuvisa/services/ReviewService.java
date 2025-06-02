package com.example.vuvisa.services;

import com.example.vuvisa.dtos.requests.CreateReviewRequest;
import com.example.vuvisa.dtos.requests.UpdateReviewRequest;
import com.example.vuvisa.dtos.responses.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReviewService {

    public ReviewResponse createReview(CreateReviewRequest request);

    public ReviewResponse getReview(String id);

    public ReviewResponse updateReview(Long reviewId, UpdateReviewRequest request);

    public void deleteReview(Long id);

    public Page<ReviewResponse> getAllReviews(Pageable pageable);

    public List<ReviewResponse> getReviewsByUserId(Long userId);

    public List<ReviewResponse> getReviewsByProductId(Long productId);

}