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
public class UpdateVoucherRequest {

    @NotBlank(message = "CODE_REQUIRED")
    @Size(min = 4, max = 20, message = "CODE_INVALID")
    private String code;

    @NotBlank(message = "DISCOUNT_NAME_REQUIRED")
    private String discountName;

    @DecimalMin(value = "0.0", inclusive = false, message = "DISCOUNT_PERCENTAGE_INVALID")
    @DecimalMax(value = "100.0", message = "DISCOUNT_PERCENTAGE_INVALID")
    private Double discountPercentage;

    @DecimalMin(value = "0.0", message = "DISCOUNT_AMOUNT_INVALID")
    private Double discountAmount;

    @DecimalMin(value = "0.0", message = "MIN_ORDER_VALUE_INVALID")
    private Double minOrderValue;

    @PositiveOrZero(message = "MAX_USES_INVALID")
    private Integer maxUses;

    @NotNull(message = "START_DATE_REQUIRED")
    private LocalDate startDate;

    @NotNull(message = "END_DATE_REQUIRED")
    private LocalDate endDate;

    @Size(max = 50, message = "TOO_MANY_PRODUCTS")
    private Set<Long> productIds;  // IDs của các sản phẩm được áp dụng cho voucher
}