package com.example.vuvisa.repositories;

import com.example.vuvisa.entities.Category;
import com.example.vuvisa.enums.CategoryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository  extends JpaRepository<Category, Long> {
    boolean existsByCategoryName(String name);
    Page<Category> findByCategoryNameContainingIgnoreCase(String categoryName, Pageable pageable);
    List<Category> findByType(CategoryType type);
}
