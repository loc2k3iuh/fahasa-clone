package com.example.vuvisa.dtos.requests;

import com.example.vuvisa.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {

    private List<Long> orderIds;
    private OrderStatus status;
}