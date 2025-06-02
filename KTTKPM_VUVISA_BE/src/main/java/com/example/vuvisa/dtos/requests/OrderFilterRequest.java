package com.example.vuvisa.dtos.requests;

import com.example.vuvisa.enums.OrderStatus;
import com.example.vuvisa.enums.ShippingMethod;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Data
public class OrderFilterRequest implements Serializable {

    @JsonProperty("order_id")
    private Long id;

    @JsonProperty("status")
    private List<OrderStatus> status;

    @JsonProperty("full_name")
    private String fullName;

    @JsonProperty("phone_number")
    private String phoneNumber;

    @JsonProperty("product_name")
    private String productName;

    @JsonProperty("shipping_method")
    private List<ShippingMethod> shippingMethod;

    @JsonProperty("start_date")
    private Date startDate;

    @JsonProperty("end_date")
    private Date endDate;

}
