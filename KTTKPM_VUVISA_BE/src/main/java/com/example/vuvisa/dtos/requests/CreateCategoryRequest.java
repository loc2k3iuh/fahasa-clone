package com.example.vuvisa.dtos.requests;

import com.example.vuvisa.enums.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateCategoryRequest {

    @NotBlank(message = "CATEGORY_REQUIRED")
    @Size(min = 2,max = 50, message = "Category must be 2to100 charater")
    String categoryName;

    @Size(max = 400, message = "Description cannot exceed 500 characters")
    String description;

    @NotNull(message = "TYPE_REQUIRED")
    CategoryType categoryType;
}
