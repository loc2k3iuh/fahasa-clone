package com.example.vuvisa.dtos.requests;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateDiscountRequest {

    @NotBlank(message = "DISCOUNT_NAME_REQUIRED")
    @Size(min = 3, max = 50, message = "DISCOUNT_NAME_INVALID")
    private String discountName;

    @DecimalMin(value = "0.0", inclusive = false, message = "DISCOUNT_PERCENTAGE_INVALID")
    @DecimalMax(value = "100.0", message = "DISCOUNT_PERCENTAGE_INVALID")
    private Double discountPercentage;

    @DecimalMin(value = "0.0", message = "DISCOUNT_AMOUNT_INVALID")
    private Double discountAmount;

    @NotNull(message = "START_DATE_REQUIRED")
    private LocalDate startDate;

    @NotNull(message = "END_DATE_REQUIRED")
    private LocalDate endDate;

    @Size(max = 50, message = "TOO_MANY_PRODUCTS")
    private Set<Long> productIds;
}