package com.example.vuvisa.services.impl;

import com.example.vuvisa.dtos.responses.ProductFavoriteResponse;
import com.example.vuvisa.entities.Product;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.enums.CategoryType;
import com.example.vuvisa.repositories.FavoriteRepository;
import com.example.vuvisa.repositories.ProductRepository;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll(Sort.by("id").ascending());
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

//    @Override
//    public Page<Product> getProductsByCategoryName(String categoryName, int page) {
//        Pageable pageable = PageRequest.of(page, 12, Sort.by("id").ascending());
//        return  productRepository.findByCategoryCategoryName(categoryName,pageable);
//    }
//
//    @Override
//    public Page<Product> getProductsBySupplierIdAndCategory(Long supplierId, String categoryName, int page) {
//        Pageable pageable = PageRequest.of(page, 12, Sort.by("id").ascending());
//        return productRepository.findBySupplierIdAndCategoryCategoryName(supplierId, categoryName, pageable);
//    }

    @Override
    public Page<Product> getProductsByCategoryName(Long id, int page) {
        Pageable pageable = PageRequest.of(page, 12);
        return  productRepository.findByCategoryId(id,pageable);
    }

    @Override
    public Page<Product> searchProductsByNameOrAuthor(String searchTerm, int page) {
        Pageable pageable = PageRequest.of(page, 12, Sort.by("id").ascending());
        return productRepository.findByProductNameContainingOrAuthorNameContaining(searchTerm, pageable);
    }

    @Override
    public List<Product> searchProducts(String searchTerm, int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("id").ascending());
        return productRepository.findByProductNameContainingWithLimit(searchTerm, pageable);
    }

    public Page<Product> getProductsBySupplierIdAndCategory(Long supplierId,Long categoryId, int page) {
        Pageable pageable = PageRequest.of(page, 12);
        return productRepository.findBySupplierIdAndCategoryId(supplierId, categoryId, pageable);
    }

    @Override
    public long getTotalProductCount() {
        return productRepository.count();
    }

    @Override
    public List<Product> findRelatedProducts(Long productId, int limit) {
        // Get the product by ID
        Product product = getProductById(productId);

        // Find products in the same category, excluding the current product
        Pageable pageable = PageRequest.of(0, limit, Sort.by("id").ascending());
        Page<Product> relatedProducts = productRepository.findByCategoryId(product.getCategory().getId(), pageable);

        // Convert Page to List and filter out the current product
        List<Product> result = relatedProducts.getContent().stream()
                .filter(p -> !p.getId().equals(productId))
                .collect(java.util.stream.Collectors.toList());

        // If we don't have enough related products, try to find more by name similarity
        if (result.size() < limit) {
            int remainingLimit = limit - result.size();

            // Get products with similar names
            String productName = product.getProductName();
            if (productName != null && !productName.isEmpty()) {
                // Extract keywords from product name (simple implementation: split by space)
                String[] keywords = productName.split("\\s+");

                for (String keyword : keywords) {
                    if (keyword.length() > 3) { // Only use keywords with more than 3 characters
                        Pageable keywordPageable = PageRequest.of(0, remainingLimit, Sort.by("id").ascending());
                        List<Product> similarNameProducts = productRepository.findByProductNameContainingWithLimit(keyword, keywordPageable);

                        // Add products that are not already in the result and not the current product
                        for (Product similarProduct : similarNameProducts) {
                            if (!similarProduct.getId().equals(productId) &&
                                result.stream().noneMatch(p -> p.getId().equals(similarProduct.getId()))) {
                                result.add(similarProduct);
                                if (result.size() >= limit) {
                                    break;
                                }
                            }
                        }

                        if (result.size() >= limit) {
                            break;
                        }
                    }
                }
            }
        }

        return result;
    }

    @Override
    public List<Product> getRandomProductsWithDiscounts(int limit) {
        // Get products with discounts
        Pageable pageable = PageRequest.of(0, 100, Sort.by("id").ascending()); // Get more products than needed for randomization
        List<Product> productsWithDiscounts = productRepository.findProductsWithDiscounts(pageable);

        // Randomize the list
        java.util.Collections.shuffle(productsWithDiscounts);

        // Return only the requested number of products
        return productsWithDiscounts.stream()
                .limit(limit)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<Product> getNewestProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("id").descending());
        return productRepository.findNewestProducts(pageable);
    }

    @Override
    public ProductFavoriteResponse getProductWithFavoriteInfo(Long productId, Long userId) {
        Product product = getProductById(productId);

        // Get favorite count
        Long favoriteCount = favoriteRepository.countUsersByProductId(productId);

        // Check if user has favorited this product
        Boolean isFavorited = false;
        if (userId != null) {
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                isFavorited = favoriteRepository.existsByUserAndProduct(user, product);
            }
        }

        // Map to response
        return ProductFavoriteResponse.builder()
                .productId(product.getId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(product.getImageUrl())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getCategoryName() : null)
                .favoriteCount(favoriteCount)
                .isFavorited(isFavorited)
                .build();
    }

    @Override
    public List<ProductFavoriteResponse> getAllProductsWithFavoriteInfo(Long userId) {
        List<Product> products = getAllProducts();
        List<ProductFavoriteResponse> responses = new ArrayList<>();

        for (Product product : products) {
            // Get favorite count
            Long favoriteCount = favoriteRepository.countUsersByProductId(product.getId());

            // Check if user has favorited this product
            Boolean isFavorited = false;
            if (userId != null) {
                Optional<User> userOptional = userRepository.findById(userId);
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    isFavorited = favoriteRepository.existsByUserAndProduct(user, product);
                }
            }

            // Map to response
            ProductFavoriteResponse response = ProductFavoriteResponse.builder()
                    .productId(product.getId())
                    .productName(product.getProductName())
                    .description(product.getDescription())
                    .price(product.getPrice())
                    .stockQuantity(product.getStockQuantity())
                    .imageUrl(product.getImageUrl())
                    .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                    .categoryName(product.getCategory() != null ? product.getCategory().getCategoryName() : null)
                    .favoriteCount(favoriteCount)
                    .isFavorited(isFavorited)
                    .build();

            responses.add(response);
        }

        return responses;
    }

    @Override
    public Page<Product> getProductsByCategoryType(CategoryType type, int page) {
        Pageable pageable = PageRequest.of(page, 12, Sort.by("id").descending());
        return productRepository.findByCategoryType(type, pageable);
    }

    @Override
    public List<Map<String, Object>> countProductsByCategory() {
        return productRepository.countProductsByCategory();
    }

    @Override
    public List<Map<String, Object>> countProductsByCategoryType() {
        return productRepository.countProductsByCategoryType();
    }
}
