package com.example.vuvisa.controllers;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.SystemNotificationRequestDTO;
import com.example.vuvisa.dtos.responses.NotificationResponseDTO;
import com.example.vuvisa.entities.Notification;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.enums.NotificationType;
import com.example.vuvisa.enums.RoleType;
import com.example.vuvisa.events.EventPublisher;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for managing notifications
 */
@RestController
@RequestMapping("${api.prefix}/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final EventPublisher eventPublisher;
    private final UserRepository userRepository;

    /**
     * Get all notifications for the authenticated user
     * 
     * @param userId the authenticated user ID
     * @param pageable pagination information
     * @return page of notifications
     */
    @GetMapping
    public ResponseEntity<APIResponse<Page<NotificationResponseDTO>>> getNotifications(
            @RequestParam Long userId,
            Pageable pageable) {

        Page<Notification> notifications = notificationService.getNotificationsForUserById(userId, pageable);
        Page<NotificationResponseDTO> notificationDTOs = notifications.map(NotificationResponseDTO::fromEntity);

        return ResponseEntity.ok(new APIResponse<>(
                200,
                "Notifications retrieved successfully",
                notificationDTOs
        ));
    }

    /**
     * Get unread notifications for the authenticated user
     * 
     * @param userId the authenticated user ID
     * @return list of unread notifications
     */
    @GetMapping("/unread")
    public ResponseEntity<APIResponse<List<NotificationResponseDTO>>> getUnreadNotifications(
            @RequestParam Long userId) {

        List<Notification> notifications = notificationService.getUnreadNotificationsForUserById(userId);
        List<NotificationResponseDTO> notificationDTOs = notifications.stream()
                .map(NotificationResponseDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new APIResponse<>(
                200,
                "Unread notifications retrieved successfully",
                notificationDTOs
        ));
    }

    /**
     * Get notifications of a specific type for the authenticated user
     * 
     * @param userId the authenticated user ID
     * @param type the notification type
     * @return list of notifications of the specified type
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<APIResponse<List<NotificationResponseDTO>>> getNotificationsByType(
            @RequestParam Long userId,
            @PathVariable NotificationType type) {

        List<Notification> notifications = notificationService.getNotificationsForUserByTypeAndId(userId, type);
        List<NotificationResponseDTO> notificationDTOs = notifications.stream()
                .map(NotificationResponseDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new APIResponse<>(
                200,
                "Notifications of type " + type + " retrieved successfully",
                notificationDTOs
        ));
    }

    /**
     * Mark a notification as read
     * 
     * @param notificationId the notification ID
     * @return the updated notification
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<APIResponse<NotificationResponseDTO>> markAsRead(
            @PathVariable Long notificationId) {

        Notification notification = notificationService.markAsRead(notificationId);
        NotificationResponseDTO notificationDTO = NotificationResponseDTO.fromEntity(notification);

        return ResponseEntity.ok(new APIResponse<>(
                200,
                "Notification marked as read successfully",
                notificationDTO
        ));
    }

    /**
     * Mark all notifications as read for the authenticated user
     * 
     * @param userId the authenticated user ID
     * @return count of updated notifications
     */
    @PutMapping("/read-all")
    public ResponseEntity<APIResponse<Integer>> markAllAsRead(
            @RequestParam Long userId) {

        int count = notificationService.markAllAsReadByUserId(userId);

        return ResponseEntity.ok(new APIResponse<>(
                200,
                count + " notifications marked as read successfully",
                count
        ));
    }

    /**
     * Count unread notifications for the authenticated user
     * 
     * @param userId the authenticated user ID
     * @return count of unread notifications
     */
    @GetMapping("/unread/count")
    public ResponseEntity<APIResponse<Long>> countUnreadNotifications(
            @RequestParam Long userId) {

        long count = notificationService.countUnreadNotificationsByUserId(userId);

        return ResponseEntity.ok(new APIResponse<>(
                200,
                "Unread notification count retrieved successfully",
                count
        ));
    }

    /**
     * Delete a notification
     * 
     * @param notificationId the notification ID
     * @return success message
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<APIResponse<Void>> deleteNotification(
            @PathVariable Long notificationId) {

        notificationService.deleteNotification(notificationId);

        return ResponseEntity.ok(new APIResponse<>(
                200,
                "Notification deleted successfully",
                null
        ));
    }


    /**
     * Send a notification to all users except admins
     * 
     * @param request the notification request containing title and message
     * @return count of notifications sent
     */
    @PostMapping("/send-to-all-users")
    public ResponseEntity<APIResponse<Integer>> sendToAllUsers(
            @RequestBody SystemNotificationRequestDTO request) {

        // Get all users with USER role
        List<User> users = userRepository.findUsersByRoleName(RoleType.USER);

        // Send notification to each user
        int count = 0;
        for (User user : users) {
            eventPublisher.publishSystemNotificationEvent(request.getTitle(), request.getMessage(), user);
            count++;
        }

        return ResponseEntity.ok(new APIResponse<>(
                200,
                "Notifications sent to " + count + " users successfully",
                count
        ));
    }
}
