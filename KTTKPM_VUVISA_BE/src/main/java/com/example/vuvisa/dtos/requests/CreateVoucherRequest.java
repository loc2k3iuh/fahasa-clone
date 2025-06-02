package com.example.vuvisa.dtos.requests;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateVoucherRequest {

    @NotBlank(message = "CODE_REQUIRED")
    @Size(min = 4, max = 20, message = "CODE_INVALID")
    String code;

    @NotBlank(message = "DISCOUNT_NAME_REQUIRED")
    String discountName;

    @DecimalMin(value = "0.0", inclusive = false, message = "DISCOUNT_PERCENTAGE_INVALID")
    @DecimalMax(value = "100.0", message = "DISCOUNT_PERCENTAGE_INVALID")
    Double discountPercentage;

    @DecimalMin(value = "0.0", message = "DISCOUNT_AMOUNT_INVALID")
    Double discountAmount;

    @DecimalMin(value = "0.0", message = "MIN_ORDER_VALUE_INVALID")
    Double minOrderValue;

    @Positive(message = "MAX_USES_INVALID")
    Integer maxUses;

    @NotNull(message = "START_DATE_REQUIRED")
    @FutureOrPresent(message = "START_DATE_INVALID")
    LocalDate startDate;

    @NotNull(message = "END_DATE_REQUIRED")
    @Future(message = "END_DATE_INVALID")
    LocalDate endDate;

}