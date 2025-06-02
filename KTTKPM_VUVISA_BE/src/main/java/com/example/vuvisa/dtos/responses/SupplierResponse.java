package com.example.vuvisa.dtos.responses;

import com.example.vuvisa.entities.Product;
import com.example.vuvisa.entities.Supplier;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;
import java.util.stream.Collectors;

@Data
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SupplierResponse {
    Long id;
    String supplierName;
    String description;
    Set<Long> productIds;

    public static SupplierResponse fromSupplier(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .supplierName(supplier.getSupplierName())
                .description(supplier.getDescription())
                .productIds(supplier.getProducts() != null ?
                        supplier.getProducts().stream()
                                .map(Product::getId)
                                .collect(Collectors.toSet())
                        : Set.of()).build();
    }
}