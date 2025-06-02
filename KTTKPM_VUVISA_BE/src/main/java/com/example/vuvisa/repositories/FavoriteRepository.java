package com.example.vuvisa.repositories;

import com.example.vuvisa.entities.Favorite;
import com.example.vuvisa.entities.Product;
import com.example.vuvisa.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    
    // Find a favorite by user and product
    Optional<Favorite> findByUserAndProduct(User user, Product product);
    
    // Find all favorites by user
    List<Favorite> findByUser(User user);
    
    // Find all favorites by product
    List<Favorite> findByProduct(Product product);
    
    // Count favorites by product
    Long countByProduct(Product product);
    
    // Check if a product is favorited by a user
    boolean existsByUserAndProduct(User user, Product product);
    
    // Delete a favorite by user and product
    void deleteByUserAndProduct(User user, Product product);
    
    // Find all products favorited by a user
    @Query("SELECT f.product FROM Favorite f WHERE f.user.id = :userId")
    List<Product> findProductsByUserId(Long userId);
    
    // Count how many users have favorited a product
    @Query("SELECT COUNT(f) FROM Favorite f WHERE f.product.id = :productId")
    Long countUsersByProductId(Long productId);
}