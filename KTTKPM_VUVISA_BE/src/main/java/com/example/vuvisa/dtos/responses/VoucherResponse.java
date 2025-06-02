package com.example.vuvisa.dtos.responses;

import com.example.vuvisa.entities.Voucher;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherResponse {

    private Long id;

    private String code;

    @JsonProperty("discount_name")
    private String discountName;

    @JsonProperty("discount_percentage")
    private Double discountPercentage;

    @JsonProperty("discount_amount")
    private Double discountAmount;

    @JsonProperty("min_order_value")
    private Double minOrderValue;

    @JsonProperty("max_uses")
    private Double maxUses;

    @JsonProperty("start_date")
    private LocalDate startDate;

    @JsonProperty("end_date")
    private LocalDate endDate;

    public static VoucherResponse fromVoucher(Voucher voucher) {
        return VoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .discountName(voucher.getDiscountName())
                .discountPercentage(voucher.getDiscountPercentage())
                .discountAmount(voucher.getDiscountAmount())
                .minOrderValue(voucher.getMinOrderValue())
                .maxUses(voucher.getMaxUses())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .build();
    }

}