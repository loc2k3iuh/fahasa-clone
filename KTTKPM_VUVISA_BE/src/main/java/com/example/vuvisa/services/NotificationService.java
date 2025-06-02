package com.example.vuvisa.services;

import com.example.vuvisa.entities.CalendarEvent;
import com.example.vuvisa.entities.Notification;
import com.example.vuvisa.entities.Order;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for managing notifications
 */
public interface NotificationService {

    /**
     * Create a new notification
     * @param title the notification title
     * @param message the notification message
     * @param type the notification type
     * @param user the recipient user
     * @param referenceId optional reference ID
     * @param referenceType optional reference type
     * @return the created notification
     */
    Notification createNotification(String title, String message, NotificationType type, User user, 
                                   Long referenceId, String referenceType);

    /**
     * Create a new notification using userId
     * @param title the notification title
     * @param message the notification message
     * @param type the notification type
     * @param userId the recipient user ID
     * @param referenceId optional reference ID
     * @param referenceType optional reference type
     * @return the created notification
     */
    Notification createNotificationByUserId(String title, String message, NotificationType type, Long userId, 
                                   Long referenceId, String referenceType);

    /**
     * Get all notifications for a user
     * @param user the user
     * @return list of notifications
     */
    List<Notification> getNotificationsForUser(User user);

    /**
     * Get all notifications for a user by userId
     * @param userId the user ID
     * @return list of notifications
     */
    List<Notification> getNotificationsForUserById(Long userId);

    /**
     * Get notifications for a user with pagination
     * @param user the user
     * @param pageable pagination information
     * @return page of notifications
     */
    Page<Notification> getNotificationsForUser(User user, Pageable pageable);

    /**
     * Get notifications for a user by userId with pagination
     * @param userId the user ID
     * @param pageable pagination information
     * @return page of notifications
     */
    Page<Notification> getNotificationsForUserById(Long userId, Pageable pageable);

    /**
     * Get unread notifications for a user
     * @param user the user
     * @return list of unread notifications
     */
    List<Notification> getUnreadNotificationsForUser(User user);

    /**
     * Get unread notifications for a user by userId
     * @param userId the user ID
     * @return list of unread notifications
     */
    List<Notification> getUnreadNotificationsForUserById(Long userId);

    /**
     * Get notifications of a specific type for a user
     * @param user the user
     * @param type the notification type
     * @return list of notifications
     */
    List<Notification> getNotificationsForUserByType(User user, NotificationType type);

    /**
     * Get notifications of a specific type for a user by userId
     * @param userId the user ID
     * @param type the notification type
     * @return list of notifications
     */
    List<Notification> getNotificationsForUserByTypeAndId(Long userId, NotificationType type);

    /**
     * Mark a notification as read
     * @param notificationId the notification ID
     * @return the updated notification
     */
    Notification markAsRead(Long notificationId);

    /**
     * Mark all notifications as read for a user
     * @param user the user
     * @return number of updated notifications
     */
    int markAllAsRead(User user);

    /**
     * Mark all notifications as read for a user by userId
     * @param userId the user ID
     * @return number of updated notifications
     */
    int markAllAsReadByUserId(Long userId);

    /**
     * Count unread notifications for a user
     * @param user the user
     * @return count of unread notifications
     */
    long countUnreadNotifications(User user);

    /**
     * Count unread notifications for a user by userId
     * @param userId the user ID
     * @return count of unread notifications
     */
    long countUnreadNotificationsByUserId(Long userId);

    /**
     * Delete a notification
     * @param notificationId the notification ID
     */
    void deleteNotification(Long notificationId);

    /**
     * Create a notification for a calendar event
     * @param calendarEvent the calendar event
     * @param type the notification type
     * @return the created notification
     */
    Notification createCalendarEventNotification(CalendarEvent calendarEvent, NotificationType type);

    /**
     * Create a notification for an order
     * @param order the order
     * @param type the notification type
     * @return the created notification
     */
    Notification createOrderNotification(Order order, NotificationType type);

    /**
     * Notify all admins about a new calendar event
     * @param calendarEvent the calendar event
     * @return list of created notifications
     */
    List<Notification> notifyAdminsAboutCalendarEvent(CalendarEvent calendarEvent);

    /**
     * Send reminder notifications for upcoming calendar events
     * @return list of created notifications
     */
    List<Notification> sendCalendarEventReminders();
}
