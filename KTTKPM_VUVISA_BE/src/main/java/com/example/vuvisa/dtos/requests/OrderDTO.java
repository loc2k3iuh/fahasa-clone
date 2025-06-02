package com.example.vuvisa.dtos.requests;

import com.example.vuvisa.enums.OrderStatus;
import com.example.vuvisa.enums.PaymentMethod;
import com.example.vuvisa.enums.ShippingMethod;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDTO {
    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("full_name")
    private String fullName;

    @JsonProperty("email")
    private String email;

    @JsonProperty("phone_number")
    private String phoneNumber;

    @JsonProperty("city")
    private String city;

    @JsonProperty("district")
    private String district;

    @JsonProperty("ward")
    private String ward;

    @JsonProperty("address")
    private String address;

    @JsonProperty("shipping_method")
    @Enumerated(EnumType.STRING)
    private ShippingMethod shippingMethod;

    @JsonProperty("shipping_date")
    private Date shippingDate;

    @JsonProperty("payment_method")
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @JsonProperty("status")
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @JsonProperty("discount_code")
    private String discountCode;

    @JsonProperty("note")
    private String note;

    @JsonProperty("cart_items")
    private Set<CartItemDTO> cartItems;

    @JsonProperty("voucher_ids")
    private Set<Long> voucherIds;
}
