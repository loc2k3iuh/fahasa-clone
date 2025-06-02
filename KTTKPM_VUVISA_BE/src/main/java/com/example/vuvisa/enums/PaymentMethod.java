package com.example.vuvisa.enums;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum PaymentMethod {
    CASH_ON_DELIVERY,
    VN_PAY,
}
