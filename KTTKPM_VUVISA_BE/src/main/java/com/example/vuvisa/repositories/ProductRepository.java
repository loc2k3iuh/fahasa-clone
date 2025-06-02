package com.example.vuvisa.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.vuvisa.entities.Product;
import com.example.vuvisa.enums.CategoryType;

import java.util.List;
import java.util.Map;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByCategoryId(Long id, Pageable pageable);



    Page<Product> findBySupplierIdAndCategoryId(Long supplierId, Long categoryId, Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN Book b ON p.id = b.id LEFT JOIN b.authors a WHERE LOWER(p.productName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(a.authorName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Product> findByProductNameContainingOrAuthorNameContaining(@Param("searchTerm") String searchTerm, Pageable pageable);

    Page<Product> findByProductNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.productName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY p.id DESC")
    List<Product> findByProductNameContainingWithLimit(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.discounts WHERE SIZE(p.discounts) > 0")
    List<Product> findProductsWithDiscounts(Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.discounts ORDER BY p.id DESC")
    List<Product> findNewestProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.category.type = :type")
    Page<Product> findByCategoryType(@Param("type") CategoryType type, Pageable pageable);

    @Query("SELECT c.categoryName as categoryName, COUNT(p) as productCount FROM Product p JOIN p.category c GROUP BY c.categoryName")
    List<Map<String, Object>> countProductsByCategory();

    @Query("SELECT c.type as categoryType, COUNT(p) as productCount FROM Product p JOIN p.category c GROUP BY c.type")
    List<Map<String, Object>> countProductsByCategoryType();
}
