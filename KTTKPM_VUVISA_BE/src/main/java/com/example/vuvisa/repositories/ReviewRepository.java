package com.example.vuvisa.repositories;

import com.example.vuvisa.entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.vuvisa.entities.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * Find all reviews by the given user ID.
     * @param userId the ID of the user.
     * @return a list of reviews associated with the given user.
     */
    List<Review> findAllByUser_Id(Long userId);

    /**
     * Find all reviews by the given product ID.
     * @param productId the ID of the product.
     * @return a list of reviews associated with the given product.
     */
    List<Review> findAllByProduct_Id(Long productId);
}