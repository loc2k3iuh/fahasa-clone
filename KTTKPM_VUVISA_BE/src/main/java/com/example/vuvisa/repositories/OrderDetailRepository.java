package com.example.vuvisa.repositories;

import com.example.vuvisa.entities.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
     List<OrderDetail> findByOrderId(Long orderId);
}
