package com.example.vuvisa.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Date;
import java.util.Set;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateDiscountRequest {

    @NotBlank(message = "DISCOUNT_NAME_REQUIRED")
    @JsonProperty("discount_name")
    String discountName;

    @DecimalMin(value = "0.0", inclusive = false, message = "DISCOUNT_PERCENTAGE_INVALID")
    @DecimalMax(value = "100.0", message = "DISCOUNT_PERCENTAGE_INVALID")
    @JsonProperty("discount_percentage")
    Double discountPercentage;

    @DecimalMin(value = "0.0", message = "DISCOUNT_AMOUNT_INVALID")
    @JsonProperty("discount_amount")
    Double discountAmount;

    @NotNull(message = "START_DATE_REQUIRED")
    @JsonProperty("start_date")
    LocalDate startDate;

    @NotNull(message = "END_DATE_REQUIRED")
    @JsonProperty("end_date")
    LocalDate endDate;

    @JsonProperty("product_ids")
    Set<Long> productIds;

}