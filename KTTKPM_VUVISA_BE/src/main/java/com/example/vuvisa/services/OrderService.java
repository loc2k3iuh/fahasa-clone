package com.example.vuvisa.services;

import com.example.vuvisa.dtos.requests.OrderDTO;
import com.example.vuvisa.dtos.requests.OrderFilterRequest;
import com.example.vuvisa.dtos.responses.OrderResponse;
import com.example.vuvisa.entities.Order;
import com.example.vuvisa.enums.OrderStatus;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface OrderService {
    OrderResponse createOrder(OrderDTO orderDTO) throws Exception;

    List<OrderResponse> getAllOrders();

    OrderResponse getOrderById(Long id) throws Exception;

    Page<OrderResponse> getOrdersByUserId(Long userId, int page, int size) throws Exception;

    Page<OrderResponse> getOrders(int page, int size);

    Page<OrderResponse> filterOrders(OrderFilterRequest filter, int page, int size);

    int generateSampleOrders(int count) throws Exception;

    List<byte[]> generateOrderPdfs(List<Long> orderIds) throws Exception;

    List<OrderResponse> updateOrdersStatus(List<Long> orderIds, OrderStatus status) throws Exception;

    void deleteOrders(List<Long> orderIds) throws Exception;

    OrderResponse updateOrder(Long id, OrderDTO orderDTO) throws Exception;
}
