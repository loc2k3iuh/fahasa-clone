package com.example.vuvisa.dtos.requests;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OfficeSupplyRequestDTO {
    private String productName;
    private String description;
    private Double price;
    private Long stockQuantity;
    private String imageUrl;
    private String classify;

    private CategoryRequestDTO category;
    private SupplierRequestDTO supplier;

    private List<ImageProductRequestDTO> imageProducts;
}

