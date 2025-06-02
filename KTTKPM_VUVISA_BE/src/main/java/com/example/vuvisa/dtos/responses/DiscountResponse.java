package com.example.vuvisa.dtos.responses;

import com.example.vuvisa.entities.Discount;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DiscountResponse {

    private Long id;

    private String discountName;

    private Double discountPercentage;

    private Double discountAmount;

    private LocalDate startDate;

    private LocalDate endDate;

    private Set<Long> productIds; // Danh sách ID của các sản phẩm liên quan.

    public static DiscountResponse fromDiscount(Discount discount) {
        return DiscountResponse.builder()
                .id(discount.getId())
                .discountName(discount.getDiscountName())
                .discountPercentage(discount.getDiscountPercentage())
                .discountAmount(discount.getDiscountAmount())
                .startDate(discount.getStartDate())
                .endDate(discount.getEndDate())
                .productIds(discount.getProducts().stream()
                        .map(product -> product.getId())
                        .collect(Collectors.toSet()))
                .build();
    }

}