package com.example.vuvisa.listeners;

import com.example.vuvisa.entities.Order;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.enums.NotificationType;
import com.example.vuvisa.enums.OrderStatus;
import com.example.vuvisa.events.NewOrderEvent;
import com.example.vuvisa.events.OrderStatusChangeEvent;
import com.example.vuvisa.services.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Listener for order status changes to send notifications
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderStatusChangeListener {

    private final NotificationService notificationService;

    /**
     * Handle order status change events
     * 
     * @param event the order status change event
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleOrderStatusChange(OrderStatusChangeEvent event) {
        Order order = event.getOrder();
        OrderStatus oldStatus = event.getOldStatus();
        OrderStatus newStatus = order.getStatus();

        log.info("Order status changed from {} to {} for order #{}", oldStatus, newStatus, order.getId());

        // Create notification based on the new status
        NotificationType notificationType;

        switch (newStatus) {
            case CONFIRMED:
                notificationType = NotificationType.ORDER_STATUS_CHANGED;
                break;
            case COMPLETED:
                notificationType = NotificationType.ORDER_COMPLETED;
                break;
            case CANCELLED:
                notificationType = NotificationType.ORDER_CANCELLED;
                break;
            default:
                notificationType = NotificationType.ORDER_STATUS_CHANGED;
        }

        notificationService.createOrderNotification(order, notificationType);

        log.info("Notification sent for order #{} status change to {}", order.getId(), newStatus);
    }

    /**
     * Handle new order events
     * 
     * @param event the new order event
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleNewOrder(NewOrderEvent event) {
        Order order = event.getOrder();

        log.info("New order created: #{}", order.getId());

        notificationService.createOrderNotification(order, NotificationType.ORDER_CREATED);

        log.info("Notification sent for new order #{}", order.getId());
    }
}
