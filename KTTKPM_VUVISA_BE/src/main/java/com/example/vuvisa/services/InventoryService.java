package com.example.vuvisa.services;

import com.example.vuvisa.entities.Order;

public interface InventoryService {
    void adjustInventory(Order order);

    void restoreInventory(Order order);
}
