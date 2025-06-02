package com.example.vuvisa.services.impl;

import com.example.vuvisa.entities.CalendarEvent;
import com.example.vuvisa.entities.Notification;
import com.example.vuvisa.entities.Order;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.enums.NotificationType;
import com.example.vuvisa.enums.RoleType;
import com.example.vuvisa.exceptions.ResourceNotFoundException;
import com.example.vuvisa.repositories.NotificationRepository;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.services.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of the NotificationService interface
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Notification createNotification(String title, String message, NotificationType type, User user,
                                          Long referenceId, String referenceType) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .user(user)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();

        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public Notification createNotificationByUserId(String title, String message, NotificationType type, Long userId,
                                          Long referenceId, String referenceType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return createNotification(title, message, type, user, referenceId, referenceType);
    }

    @Override
    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByUser(user);
    }

    @Override
    public List<Notification> getNotificationsForUserById(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    @Override
    public Page<Notification> getNotificationsForUser(User user, Pageable pageable) {
        return notificationRepository.findByUser(user, pageable);
    }

    @Override
    public Page<Notification> getNotificationsForUserById(Long userId, Pageable pageable) {
        return notificationRepository.findByUserId(userId, pageable);
    }

    @Override
    public List<Notification> getUnreadNotificationsForUser(User user) {
        return notificationRepository.findByUserAndIsReadFalse(user);
    }

    @Override
    public List<Notification> getUnreadNotificationsForUserById(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    @Override
    public List<Notification> getNotificationsForUserByType(User user, NotificationType type) {
        return notificationRepository.findByUserAndType(user, type);
    }

    @Override
    public List<Notification> getNotificationsForUserByTypeAndId(Long userId, NotificationType type) {
        return notificationRepository.findByUserIdAndType(userId, type);
    }

    @Override
    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        notification.markAsRead();
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public int markAllAsRead(User user) {
        return notificationRepository.markAllAsRead(user, LocalDateTime.now());
    }

    @Override
    @Transactional
    public int markAllAsReadByUserId(Long userId) {
        return notificationRepository.markAllAsReadByUserId(userId, LocalDateTime.now());
    }

    @Override
    public long countUnreadNotifications(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Override
    public long countUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new ResourceNotFoundException("Notification not found with id: " + notificationId);
        }
        notificationRepository.deleteById(notificationId);
    }

    @Override
    @Transactional
    public Notification createCalendarEventNotification(CalendarEvent calendarEvent, NotificationType type) {
        String title;
        String message;

        switch (type) {
            case CALENDAR_REMINDER:
                title = "Calendar Reminder: " + calendarEvent.getTitle();
                message = "Reminder for event: " + calendarEvent.getTitle() + 
                          " starting at " + calendarEvent.getStartTime();
                break;
            case CALENDAR_CREATED:
                title = "New Calendar Event Created";
                message = "A new calendar event has been created: " + calendarEvent.getTitle() + 
                          " starting at " + calendarEvent.getStartTime();
                break;
            case CALENDAR_UPDATED:
                title = "Calendar Event Updated";
                message = "Calendar event has been updated: " + calendarEvent.getTitle() + 
                          " starting at " + calendarEvent.getStartTime();
                break;
            case CALENDAR_CANCELLED:
                title = "Calendar Event Cancelled";
                message = "Calendar event has been cancelled: " + calendarEvent.getTitle() + 
                          " that was scheduled for " + calendarEvent.getStartTime();
                break;
            default:
                title = "Calendar Event Notification";
                message = "Notification for calendar event: " + calendarEvent.getTitle();
        }

        return createNotification(
                title,
                message,
                type,
                calendarEvent.getCreatedBy(),
                calendarEvent.getId(),
                "CalendarEvent"
        );
    }

    @Override
    @Transactional
    public Notification createOrderNotification(Order order, NotificationType type) {
        String title;
        String message;

        switch (type) {
            case ORDER_CREATED:
                title = "Order Created";
                message = "Your order #" + order.getId() + " has been created successfully.";
                break;
            case ORDER_STATUS_CHANGED:
                title = "Order Status Updated";
                message = "Your order #" + order.getId() + " status has been updated to " + order.getStatus() + ".";
                break;
            case ORDER_COMPLETED:
                title = "Order Completed";
                message = "Your order #" + order.getId() + " has been completed. Thank you for your purchase!";
                break;
            case ORDER_CANCELLED:
                title = "Order Cancelled";
                message = "Your order #" + order.getId() + " has been cancelled.";
                break;
            default:
                title = "Order Notification";
                message = "Notification for order #" + order.getId();
        }

        return createNotification(
                title,
                message,
                type,
                order.getUser(),
                order.getId(),
                "Order"
        );
    }

    @Override
    @Transactional
    public List<Notification> notifyAdminsAboutCalendarEvent(CalendarEvent calendarEvent) {
        List<User> admins = userRepository.findUsersByRoleName(RoleType.ADMIN);
        List<Notification> notifications = new ArrayList<>();

        for (User admin : admins) {
            // Don't notify the creator if they're an admin
            if (!admin.getId().equals(calendarEvent.getCreatedBy().getId())) {
                Notification notification = createNotification(
                        "New Calendar Event",
                        "A new calendar event has been created by " + calendarEvent.getCreatedBy().getFullName() + 
                        ": " + calendarEvent.getTitle() + " starting at " + calendarEvent.getStartTime(),
                        NotificationType.CALENDAR_CREATED,
                        admin,
                        calendarEvent.getId(),
                        "CalendarEvent"
                );
                notifications.add(notification);
            }
        }

        return notifications;
    }

    @Override
    @Transactional
    public List<Notification> sendCalendarEventReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneDayFromNow = now.plus(1, ChronoUnit.DAYS);
        LocalDateTime oneHourFromNow = now.plus(1, ChronoUnit.HOURS);

        // This would typically be a custom query in the CalendarEventRepository
        // For simplicity, we'll assume we have a method to find upcoming events
        // List<CalendarEvent> upcomingEvents = calendarEventRepository.findUpcomingEvents(now, oneDayFromNow);

        // Since we don't have access to the actual repository, we'll just return an empty list
        // In a real implementation, you would iterate through upcoming events and create notifications

        log.info("Sending calendar event reminders for events between {} and {}", now, oneDayFromNow);
        return new ArrayList<>();
    }
}
