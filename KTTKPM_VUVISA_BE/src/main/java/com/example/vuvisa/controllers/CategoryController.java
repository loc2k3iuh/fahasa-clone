package com.example.vuvisa.controllers;
import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.CreateCategoryRequest;
import com.example.vuvisa.dtos.requests.UpdateCategoryRequest;
import com.example.vuvisa.dtos.responses.CategoryReponse;
import com.example.vuvisa.entities.Category;
import com.example.vuvisa.enums.CategoryType;
import com.example.vuvisa.services.CategoryService;
import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/categories")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryController {
    private final CategoryService categoryService;

    @PostMapping("/create")
    public APIResponse<CategoryReponse> createCategory(@Valid @RequestBody CreateCategoryRequest request) {

        return APIResponse.<CategoryReponse>builder()
                .result(categoryService.createCategory(request))
                .message("Category create successfully").build();
    }


    @GetMapping("/{id}")
    public APIResponse<CategoryReponse> getCategoryById(@PathVariable("id") long id) {
        return APIResponse.<CategoryReponse>builder()
                .result(categoryService.getCategoryById(id)).
                message("Category get successfully").build();
    }

    @GetMapping
    public APIResponse<Page<CategoryReponse>> getAllCategories(@RequestParam(defaultValue = "0")int page,
                                                               @RequestParam(required = false)String categoryName) {
        if(categoryName != null && !categoryName.isEmpty()) {
            return APIResponse.<Page<CategoryReponse>>builder()
                    .result(categoryService.searchCategoryByName(categoryName,page))
                    .build();
        }
        return APIResponse.<Page<CategoryReponse>>builder()
                .result(categoryService.getAllCategoryByPage(page))
                .message("Category get all sucessfully").build();
    }

    @PutMapping("/{id}")
    public APIResponse<CategoryReponse> updateCategory(@PathVariable("id") long id, @Valid @RequestBody UpdateCategoryRequest request) {
        return APIResponse.<CategoryReponse>builder()
                .result(categoryService.updateCategory(id,request)).message("Category update successfully").build();
    }

    @DeleteMapping("/{id}")
    public APIResponse<CategoryReponse> deleteCategory(@PathVariable("id") long id) {
        return APIResponse.<CategoryReponse>builder()
                .result(categoryService.deleCategory(id))
                .message("Delete category successfully")
                .build();
    }

    @GetMapping("/by-type")
    public APIResponse<Map<CategoryType, List<CategoryReponse>>> getAllCategoriesByType() {
        return APIResponse.<Map<CategoryType, List<CategoryReponse>>>builder()
                .result(categoryService.getAllCategoriesByType())
                .message("Get all categories by type successfully")
                .build();
    }

    @GetMapping("/by-type/{type}")
    public APIResponse<List<CategoryReponse>> getCategoriesByType(@PathVariable("type") CategoryType type) {
        return APIResponse.<List<CategoryReponse>>builder()
                .result(categoryService.getCategoriesByType(type))
                .message("Get categories by type successfully")
                .build();
    }
}
