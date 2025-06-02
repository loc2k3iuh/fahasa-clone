package com.example.vuvisa.events;

import com.example.vuvisa.entities.CalendarEvent;
import com.example.vuvisa.entities.Order;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Publisher for application events
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EventPublisher {

    private final ApplicationEventPublisher publisher;

    /**
     * Publish an event when an order's status changes
     * 
     * @param order the order
     * @param oldStatus the old status
     */
    public void publishOrderStatusChangeEvent(Order order, OrderStatus oldStatus) {
        OrderStatusChangeEvent event = new OrderStatusChangeEvent(order, oldStatus, order.getStatus());
        publisher.publishEvent(event);
        log.debug("Published OrderStatusChangeEvent for order #{}: {} -> {}", 
                order.getId(), oldStatus, order.getStatus());
    }

    /**
     * Publish an event when a new order is created
     * 
     * @param order the new order
     */
    public void publishNewOrderEvent(Order order) {
        NewOrderEvent event = new NewOrderEvent(order);
        publisher.publishEvent(event);
        log.debug("Published NewOrderEvent for order #{}", order.getId());
    }

    /**
     * Publish an event when a new calendar event is created
     * 
     * @param calendarEvent the new calendar event
     */
    public void publishNewCalendarEventEvent(CalendarEvent calendarEvent) {
        NewCalendarEventEvent event = new NewCalendarEventEvent(calendarEvent);
        publisher.publishEvent(event);
        log.debug("Published NewCalendarEventEvent for calendar event: {}", calendarEvent.getTitle());
    }

    public void publishSystemNotificationEvent(String title, String message, User recipient) {
        SystemNotificationEvent event = new SystemNotificationEvent(title, message, recipient);
        publisher.publishEvent(event);
        log.debug("Published NewSystemEventEvent for system event: {}", title);
    }
}
