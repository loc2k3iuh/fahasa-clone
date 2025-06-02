package com.example.vuvisa.services;

import com.example.vuvisa.dtos.requests.CreateAuthorRequest;
import com.example.vuvisa.dtos.requests.CreateCategoryRequest;
import com.example.vuvisa.dtos.requests.UpdateCategoryRequest;
import com.example.vuvisa.dtos.responses.AuthorReponse;
import com.example.vuvisa.dtos.responses.CategoryReponse;
import com.example.vuvisa.enums.CategoryType;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface CategoryService {


    @Transactional
    CategoryReponse createCategory(CreateCategoryRequest request);

    CategoryReponse getCategoryById(long id);

    Page<CategoryReponse> getAllCategoryByPage(int page);

    CategoryReponse updateCategory(Long id, UpdateCategoryRequest request);

    CategoryReponse deleCategory(Long id);

    Page<CategoryReponse> searchCategoryByName(String name, int page);

    List<CategoryReponse> getCategoriesByType(CategoryType type);

    /**
     * Get all categories grouped by CategoryType
     * @return A map where the key is CategoryType and the value is a list of categories of that type
     */
    java.util.Map<CategoryType, List<CategoryReponse>> getAllCategoriesByType();
}
