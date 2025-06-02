package com.example.vuvisa.controllers;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.responses.ProductFavoriteResponse;
import com.example.vuvisa.entities.Product;
import com.example.vuvisa.enums.CategoryType;
import com.example.vuvisa.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/category/{categoryId}")
    public APIResponse<Page<Product>> getProductsByCategoryName(@PathVariable("categoryId") Long CategoryId,
                                                                @RequestParam(defaultValue = "0")int page) {

        Page<Product> products = productService.getProductsByCategoryName(CategoryId,page);
        return APIResponse.<Page<Product>>builder()
                .result(products)
                .message("Get products by category successfully")
                .build();
    }

    @GetMapping("/category/{categoryId}/supplier/{supplierId}")
    public APIResponse<Page<Product>> getProductsBySupplierIdAndCategory(
           @PathVariable("supplierId") Long supplierId,
            @PathVariable("categoryId") Long categoryId,
            @RequestParam(defaultValue = "0") int page) {

        Page<Product> products = productService.getProductsBySupplierIdAndCategory(supplierId,categoryId, page);
        return APIResponse.<Page<Product>>builder()
                .result(products)
                .message("Get products by supplier ID and category successfully")
                .build();
    }



    @GetMapping("/search/{term}")
    public APIResponse<Page<Product>> searchProductsPaged(
            @PathVariable String term,
            @RequestParam(defaultValue = "0") int page) {
        String decodedTerm = URLDecoder.decode(term, StandardCharsets.UTF_8);
        Page<Product> products = productService.searchProductsByNameOrAuthor(decodedTerm, page);
        return APIResponse.<Page<Product>>builder()
                .result(products)
                .message("Search products successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam String name,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(productService.searchProducts(name, limit));
    }

    @GetMapping("/count")
    public APIResponse<Long> getTotalUserCount() {
        long totalProductCount = productService.getTotalProductCount();
        return APIResponse.<Long>builder()
                .result(totalProductCount)
                .message("Total product count retrieved successfully")
                .build();
    }

    /**
     * Get related products for a given product
     * @param productId ID of the product to find related products for
     * @param limit Maximum number of related products to return (default: 5)
     * @return List of related products
     */
    @GetMapping("/{productId}/related")
    public APIResponse<List<Product>> getRelatedProducts(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "10") int limit) {
        List<Product> relatedProducts = productService.findRelatedProducts(productId, limit);
        return APIResponse.<List<Product>>builder()
                .result(relatedProducts)
                .message("Related products retrieved successfully")
                .build();
    }

    /**
     * Get random products with discounts
     * @param limit Maximum number of products to return (default: 10)
     * @return List of random products with discounts
     */
    @GetMapping("/random-with-discounts")
    public APIResponse<List<Product>> getRandomProductsWithDiscounts(
            @RequestParam(defaultValue = "10") int limit) {
        List<Product> products = productService.getRandomProductsWithDiscounts(limit);
        return APIResponse.<List<Product>>builder()
                .result(products)
                .message("Random products with discounts retrieved successfully")
                .build();
    }

    /**
     * Get newest products
     * @param limit Maximum number of products to return (default: 15)
     * @return List of newest products
     */
    @GetMapping("/newest")
    public APIResponse<List<Product>> getNewestProducts(
            @RequestParam(defaultValue = "15") int limit) {
        List<Product> products = productService.getNewestProducts(limit);
        return APIResponse.<List<Product>>builder()
                .result(products)
                .message("Newest products retrieved successfully")
                .build();
    }

    /**
     * Get a product with favorite information
     * @param id ID of the product
     * @param userId ID of the user (optional)
     * @return Product with favorite information
     */
    @GetMapping("/{id}/with-favorites")
    public APIResponse<ProductFavoriteResponse> getProductWithFavoriteInfo(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        ProductFavoriteResponse product = productService.getProductWithFavoriteInfo(id, userId);
        return APIResponse.<ProductFavoriteResponse>builder()
                .result(product)
                .message("Product with favorite information retrieved successfully")
                .build();
    }

    /**
     * Get all products with favorite information
     * @param userId ID of the user (optional)
     * @return List of products with favorite information
     */
    @GetMapping("/with-favorites")
    public APIResponse<List<ProductFavoriteResponse>> getAllProductsWithFavoriteInfo(
            @RequestParam(required = false) Long userId) {
        List<ProductFavoriteResponse> products = productService.getAllProductsWithFavoriteInfo(userId);
        return APIResponse.<List<ProductFavoriteResponse>>builder()
                .result(products)
                .message("Products with favorite information retrieved successfully")
                .build();
    }

    /**
     * Get products by category type
     * @param type Type of the category (SACH_TRONG_NUOC, SACH_NUOC_NGOAI, VAN_PHONG_PHAM)
     * @param page Page number (default: 0)
     * @return Page of products with the specified category type
     */
    @GetMapping("/category-type/{type}")
    public APIResponse<Page<Product>> getProductsByCategoryType(
            @PathVariable CategoryType type,
            @RequestParam(defaultValue = "0") int page) {
        Page<Product> products = productService.getProductsByCategoryType(type, page);
        return APIResponse.<Page<Product>>builder()
                .result(products)
                .message("Products by category type retrieved successfully")
                .build();
    }

    /**
     * Count products by category
     * @return List of maps containing category name and product count
     */
    @GetMapping("/count-by-category")
    public APIResponse<List<Map<String, Object>>> countProductsByCategory() {
        List<Map<String, Object>> categoryCounts = productService.countProductsByCategory();
        return APIResponse.<List<Map<String, Object>>>builder()
                .result(categoryCounts)
                .message("Product counts by category retrieved successfully")
                .build();
    }

    /**
     * Count products by category type
     * @return List of maps containing category type and product count
     */
    @GetMapping("/count-by-category-type")
    public APIResponse<List<Map<String, Object>>> countProductsByCategoryType() {
        List<Map<String, Object>> categoryTypeCounts = productService.countProductsByCategoryType();
        return APIResponse.<List<Map<String, Object>>>builder()
                .result(categoryTypeCounts)
                .message("Product counts by category type retrieved successfully")
                .build();
    }
}
