# Notification System

This document describes the notification system implemented for the Vuvisa Backend application.

## Overview

The notification system allows sending notifications to users for various events such as:

- Calendar event reminders
- New calendar events (for admins)
- Order status changes
- New orders
- Product-related notifications
- Promotion-related notifications

Notifications are categorized by type and can be filtered and displayed accordingly.

## Components

### Entities and Enums

- `Notification`: Entity representing a notification with fields for title, message, type, user, read status, etc.
- `NotificationType`: Enum defining different types of notifications (CALENDAR_REMINDER, ORDER_CREATED, etc.)

### Repositories

- `NotificationRepository`: JPA repository for managing notifications with methods for finding notifications by user, type, read status, etc.
- `CalendarEventRepository`: Updated with methods for finding upcoming events and events created after a specific time.

### Services

- `NotificationService`: Interface defining methods for creating, retrieving, and managing notifications.
- `NotificationServiceImpl`: Implementation of the NotificationService interface.

### Controllers

- `NotificationController`: REST controller exposing endpoints for retrieving and managing notifications.

### Events and Listeners

- `OrderStatusChangeEvent`: Event published when an order's status changes.
- `NewOrderEvent`: Event published when a new order is created.
- `NewCalendarEventEvent`: Event published when a new calendar event is created.
- `OrderStatusChangeListener`: Listener that handles order-related events and creates notifications.
- `CalendarEventListener`: Listener that handles calendar event-related events and creates notifications.

### Schedulers

- `NotificationScheduler`: Scheduler that periodically checks for upcoming calendar events and sends reminders.

### Publishers

- `EventPublisher`: Component for publishing events when orders or calendar events are created or updated.

## Usage

### Retrieving Notifications

Users can retrieve their notifications using the following endpoints:

- `GET /api/notifications`: Get all notifications for the authenticated user (paginated).
- `GET /api/notifications/unread`: Get unread notifications for the authenticated user.
- `GET /api/notifications/type/{type}`: Get notifications of a specific type for the authenticated user.
- `GET /api/notifications/unread/count`: Count unread notifications for the authenticated user.

### Managing Notifications

Users can manage their notifications using the following endpoints:

- `PUT /api/notifications/{notificationId}/read`: Mark a notification as read.
- `PUT /api/notifications/read-all`: Mark all notifications as read for the authenticated user.
- `DELETE /api/notifications/{notificationId}`: Delete a notification.

### Creating Notifications

Notifications are created automatically in response to events:

1. When an order is created, a notification is sent to the user who placed the order.
2. When an order's status changes, a notification is sent to the user who placed the order.
3. When a calendar event is created, a notification is sent to the creator and all admins.
4. When a calendar event is approaching, a reminder notification is sent to the creator.

To trigger these notifications, use the `EventPublisher` in your services:

```java
// In OrderService
@Autowired
private EventPublisher eventPublisher;

// When creating a new order
public Order createOrder(OrderDTO orderDTO) {
    // Create order logic...
    
    // Publish event to trigger notification
    eventPublisher.publishNewOrderEvent(order);
    
    return order;
}

// When updating an order's status
public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    
    OrderStatus oldStatus = order.getStatus();
    order.setStatus(newStatus);
    order = orderRepository.save(order);
    
    // Publish event to trigger notification
    eventPublisher.publishOrderStatusChangeEvent(order, oldStatus);
    
    return order;
}
```

```java
// In CalendarEventService
@Autowired
private EventPublisher eventPublisher;

// When creating a new calendar event
public CalendarEvent createCalendarEvent(CalendarEvent calendarEvent) {
    // Create calendar event logic...
    
    // Publish event to trigger notification
    eventPublisher.publishNewCalendarEventEvent(calendarEvent);
    
    return calendarEvent;
}
```

## Scheduler Configuration

The notification scheduler is configured to run at the following intervals:

- Calendar event reminders: Every hour
- Admin notifications for new calendar events: Every 30 minutes

You can adjust these intervals by modifying the cron expressions in the `NotificationScheduler` class.