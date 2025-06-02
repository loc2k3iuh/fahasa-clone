package com.example.vuvisa.dtos.responses;

import com.example.vuvisa.dtos.requests.OrderDetailDTO;
import com.example.vuvisa.dtos.responses.VoucherResponse;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponse {
    private Long id;

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
    private String shippingMethod;

    @JsonProperty("payment_method")
    private String paymentMethod;

    @JsonProperty("discount_code")
    private String discountCode;

    @JsonProperty("note")
    private String note;

    @JsonProperty("status")
    private String status;

    @JsonProperty("order_date")
    private String orderDate;

    @JsonProperty("order_details")
    private List<OrderDetailDTO> orderDetails;

    @JsonProperty("vouchers")
    private Set<VoucherResponse> vouchers;
}
