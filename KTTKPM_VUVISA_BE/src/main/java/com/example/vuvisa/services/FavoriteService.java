package com.example.vuvisa.services;

import com.example.vuvisa.dtos.requests.FavoriteRequest;
import com.example.vuvisa.dtos.responses.FavoriteResponse;
import com.example.vuvisa.entities.Product;

import java.util.List;

public interface FavoriteService {
    
    /**
     * Add a product to user's favorites
     * @param request The favorite request containing userId and productId
     * @return The created favorite response
     */
    FavoriteResponse addFavorite(FavoriteRequest request);
    
    /**
     * Remove a product from user's favorites
     * @param userId The user ID
     * @param productId The product ID
     * @return True if removed successfully, false otherwise
     */
    boolean removeFavorite(Long userId, Long productId);
    
    /**
     * Check if a product is in user's favorites
     * @param userId The user ID
     * @param productId The product ID
     * @return True if the product is in user's favorites, false otherwise
     */
    boolean isFavorite(Long userId, Long productId);
    
    /**
     * Get all favorites for a user
     * @param userId The user ID
     * @return List of favorite responses
     */
    List<FavoriteResponse> getUserFavorites(Long userId);
    
    /**
     * Get all products favorited by a user
     * @param userId The user ID
     * @return List of favorited products
     */
    List<Product> getUserFavoritedProducts(Long userId);
    
    /**
     * Count how many users have favorited a product
     * @param productId The product ID
     * @return The count of users who have favorited the product
     */
    Long countProductFavorites(Long productId);
}