package com.example.vuvisa.services.impl;

import com.example.vuvisa.dtos.requests.CreateCategoryRequest;
import com.example.vuvisa.dtos.requests.UpdateCategoryRequest;
import com.example.vuvisa.dtos.responses.CategoryReponse;
import com.example.vuvisa.entities.Category;
import com.example.vuvisa.enums.CategoryType;
import com.example.vuvisa.repositories.CategoryRepository;
import com.example.vuvisa.services.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CategoryImpl implements CategoryService {
    private final CategoryRepository categoryRepository;

    @Transactional
    @Override
    public CategoryReponse createCategory(CreateCategoryRequest request){
        if(categoryRepository.existsByCategoryName(request.getCategoryName())){
            throw new RuntimeException("Category already exists");
        }
        Category category= Category.builder()
                .categoryName(request.getCategoryName())
                .description(request.getDescription())
                .type(request.getCategoryType())
                .build();
        return CategoryReponse.fromEntity(categoryRepository.save(category));
    }

    @Override
    public CategoryReponse getCategoryById(long id){
        Category category = categoryRepository.findById(id).orElseThrow(()-> new RuntimeException("Category not found"));
        return CategoryReponse.fromEntity(category);
    }

    @Override
    public Page<CategoryReponse> getAllCategoryByPage(int page){
        Pageable pageable = PageRequest.of(page, 20);
        return categoryRepository.findAll(pageable).map(CategoryReponse::fromEntity);
    }

    @Override
    public CategoryReponse updateCategory(Long id, UpdateCategoryRequest request){
        Category category = categoryRepository.findById(id).orElseThrow(()-> new RuntimeException("Category not found"));
        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());
        category.setType(request.getCategoryType());
        return CategoryReponse.fromEntity(categoryRepository.save(category));
    }

    @Override
    public CategoryReponse deleCategory(Long id){
        Category category = categoryRepository.findById(id).orElseThrow(()-> new RuntimeException("Category not found"));
        categoryRepository.deleteById(category.getId());

        return null;
    }
    @Override
    public Page<CategoryReponse> searchCategoryByName(String name, int page) {
        Pageable pageable = PageRequest.of(page, 10);
        return categoryRepository.findByCategoryNameContainingIgnoreCase(name, pageable)
                .map(CategoryReponse::fromEntity);
    }

    @Override
    public List<CategoryReponse> getCategoriesByType(CategoryType type) {
        List<Category> categories = categoryRepository.findByType(type);
        return categories.stream()
                .map(CategoryReponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public Map<CategoryType, List<CategoryReponse>> getAllCategoriesByType() {
        Map<CategoryType, List<CategoryReponse>> result = new HashMap<>();

        // Get all CategoryType values
        CategoryType[] categoryTypes = CategoryType.values();

        // For each CategoryType, get all categories of that type
        for (CategoryType type : categoryTypes) {
            List<CategoryReponse> categories = getCategoriesByType(type);
            result.put(type, categories);
        }

        return result;
    }

}
