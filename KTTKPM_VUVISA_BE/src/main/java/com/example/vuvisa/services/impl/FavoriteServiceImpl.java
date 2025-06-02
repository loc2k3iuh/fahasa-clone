package com.example.vuvisa.services.impl;

import com.example.vuvisa.dtos.requests.FavoriteRequest;
import com.example.vuvisa.dtos.responses.FavoriteResponse;
import com.example.vuvisa.entities.Favorite;
import com.example.vuvisa.entities.Product;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.repositories.FavoriteRepository;
import com.example.vuvisa.repositories.ProductRepository;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.services.FavoriteService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public FavoriteResponse addFavorite(FavoriteRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + request.getUserId()));
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + request.getProductId()));
        
        // Check if already favorited
        if (favoriteRepository.existsByUserAndProduct(user, product)) {
            // Return existing favorite
            Favorite existingFavorite = favoriteRepository.findByUserAndProduct(user, product)
                    .orElseThrow(() -> new RuntimeException("Favorite should exist but not found"));
            return mapToFavoriteResponse(existingFavorite);
        }
        
        // Create new favorite
        Favorite favorite = Favorite.builder()
                .user(user)
                .product(product)
                .build();
        
        Favorite savedFavorite = favoriteRepository.save(favorite);
        return mapToFavoriteResponse(savedFavorite);
    }

    @Override
    @Transactional
    public boolean removeFavorite(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));
        
        if (favoriteRepository.existsByUserAndProduct(user, product)) {
            favoriteRepository.deleteByUserAndProduct(user, product);
            return true;
        }
        
        return false;
    }

    @Override
    public boolean isFavorite(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));
        
        return favoriteRepository.existsByUserAndProduct(user, product);
    }

    @Override
    public List<FavoriteResponse> getUserFavorites(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        List<Favorite> favorites = favoriteRepository.findByUser(user);
        
        return favorites.stream()
                .map(this::mapToFavoriteResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<Product> getUserFavoritedProducts(Long userId) {
        // Check if user exists
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("User not found with id: " + userId);
        }
        
        return favoriteRepository.findProductsByUserId(userId);
    }

    @Override
    public Long countProductFavorites(Long productId) {
        // Check if product exists
        if (!productRepository.existsById(productId)) {
            throw new EntityNotFoundException("Product not found with id: " + productId);
        }
        
        return favoriteRepository.countUsersByProductId(productId);
    }
    
    private FavoriteResponse mapToFavoriteResponse(Favorite favorite) {
        return FavoriteResponse.builder()
                .id(favorite.getId())
                .userId(favorite.getUser().getId())
                .username(favorite.getUser().getUsername())
                .productId(favorite.getProduct().getId())
                .productName(favorite.getProduct().getProductName())
                .productImageUrl(favorite.getProduct().getImageUrl())
                .productPrice(favorite.getProduct().getPrice())
                .createdDate(favorite.getCreatedDate())
                .build();
    }
}