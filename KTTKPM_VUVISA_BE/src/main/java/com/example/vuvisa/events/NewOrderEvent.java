package com.example.vuvisa.events;

import com.example.vuvisa.entities.Order;
import lombok.Getter;

/**
 * Event that is published when a new order is created
 */
@Getter
public class NewOrderEvent {
    private final Order order;
    
    /**
     * Create a new NewOrderEvent
     * 
     * @param order the order
     */
    public NewOrderEvent(Order order) {
        this.order = order;
    }
}