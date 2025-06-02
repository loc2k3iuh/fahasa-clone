package com.example.vuvisa.events;

import com.example.vuvisa.entities.Order;
import com.example.vuvisa.enums.OrderStatus;
import lombok.Getter;

/**
 * Event that is published when an order's status changes
 */
@Getter
public class OrderStatusChangeEvent {
    private final Order order;
    private final OrderStatus oldStatus;
    private final OrderStatus newStatus;
    
    /**
     * Create a new OrderStatusChangeEvent
     * 
     * @param order the order
     * @param oldStatus the old status
     * @param newStatus the new status
     */
    public OrderStatusChangeEvent(Order order, OrderStatus oldStatus, OrderStatus newStatus) {
        this.order = order;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
    }
}