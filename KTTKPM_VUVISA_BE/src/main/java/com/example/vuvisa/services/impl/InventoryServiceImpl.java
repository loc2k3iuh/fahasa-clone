package com.example.vuvisa.services.impl;

import com.example.vuvisa.entities.Order;
import com.example.vuvisa.entities.Product;
import com.example.vuvisa.repositories.ProductRepository;
import com.example.vuvisa.services.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void adjustInventory(Order order) {
        order.getOrderDetails().forEach(detail -> {
            Product product = detail.getProduct();
            product.setStockQuantity(product.getStockQuantity() - detail.getQuantity());
            productRepository.save(product);
        });
    }

    @Override
    @Transactional
    public void restoreInventory(Order order) {
        order.getOrderDetails().forEach(detail -> {
            Product product = detail.getProduct();
            product.setStockQuantity(product.getStockQuantity() + detail.getQuantity());
            productRepository.save(product);
        });
    }
}
