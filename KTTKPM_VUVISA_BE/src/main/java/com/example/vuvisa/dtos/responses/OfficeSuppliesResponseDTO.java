package com.example.vuvisa.dtos.responses;

import com.example.vuvisa.entities.Category;
import com.example.vuvisa.entities.ImageProduct;
import com.example.vuvisa.entities.Publisher;
import com.example.vuvisa.entities.Supplier;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OfficeSuppliesResponseDTO {
    private Long id;
    private String productName;
    private String description;
    private Double price;
    private Long stockQuantity;
    private String imageUrl;

    private Category category;
    private Supplier supplier;
    private Set<ImageProduct> imageProducts;
    private String classify;
    private Set<DiscountResponse> discounts;
}
