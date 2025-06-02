package com.example.vuvisa.enums;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PACKING,
    DELIVERING,
    COMPLETED,
    CANCELLED
}

