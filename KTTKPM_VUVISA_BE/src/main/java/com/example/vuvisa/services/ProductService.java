package com.example.vuvisa.services;

import com.example.vuvisa.entities.Product;
import com.example.vuvisa.enums.CategoryType;
import com.example.vuvisa.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Service interface for managing products
 */
public interface ProductService {

    /**
     * Get all products
     * @return List of all products
     */
    List<Product> getAllProducts();

    /**
     * Get a product by its ID
     * @param id ID of the product to retrieve
     * @return The product with the specified ID
     * @throws RuntimeException if the product is not found
     */
    Product getProductById(Long id);

    /**
     * Delete a product by its ID
     * @param id ID of the product to delete
     */
    void deleteProduct(Long id);

    public Page<Product> getProductsByCategoryName(Long id, int page);

    public Page<Product> searchProductsByNameOrAuthor(String searchTerm, int page);

    public Page<Product> getProductsBySupplierIdAndCategory(Long supplierId,Long categoryId, int page);

    List<Product> searchProducts(String searchTerm, int limit);

    long getTotalProductCount();

    /**
     * Find related products based on a given product
     * @param productId ID of the product to find related products for
     * @param limit Maximum number of related products to return
     * @return List of related products
     */
    List<Product> findRelatedProducts(Long productId, int limit);

    /**
     * Get random products with discounts
     * @param limit Maximum number of products to return
     * @return List of random products with discounts
     */
    List<Product> getRandomProductsWithDiscounts(int limit);

    /**
     * Get newest products
     * @param limit Maximum number of products to return
     * @return List of newest products
     */
    List<Product> getNewestProducts(int limit);

    /**
     * Get product with favorite information
     * @param productId ID of the product
     * @param userId ID of the user (optional, can be null)
     * @return Product with favorite information
     */
    com.example.vuvisa.dtos.responses.ProductFavoriteResponse getProductWithFavoriteInfo(Long productId, Long userId);

    /**
     * Get all products with favorite information
     * @param userId ID of the user (optional, can be null)
     * @return List of products with favorite information
     */
    List<com.example.vuvisa.dtos.responses.ProductFavoriteResponse> getAllProductsWithFavoriteInfo(Long userId);

    /**
     * Get products by category type
     * @param type Type of the category
     * @param page Page number
     * @return Page of products with the specified category type
     */
    Page<Product> getProductsByCategoryType(CategoryType type, int page);

    /**
     * Count products by category
     * @return List of maps containing category name and product count
     */
    List<Map<String, Object>> countProductsByCategory();

    /**
     * Count products by category type
     * @return List of maps containing category type and product count
     */
    List<Map<String, Object>> countProductsByCategoryType();
}
