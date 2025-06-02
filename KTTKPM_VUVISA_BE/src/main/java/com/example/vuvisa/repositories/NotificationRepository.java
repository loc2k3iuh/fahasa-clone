package com.example.vuvisa.repositories;

import com.example.vuvisa.entities.Notification;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for managing Notification entities
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Find all notifications for a specific user
     * @param user the user
     * @return list of notifications
     */
    List<Notification> findByUser(User user);

    /**
     * Find all notifications for a specific user by userId
     * @param userId the user ID
     * @return list of notifications
     */
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId")
    List<Notification> findByUserId(@Param("userId") Long userId);

    /**
     * Find all notifications for a specific user with pagination
     * @param user the user
     * @param pageable pagination information
     * @return page of notifications
     */
    Page<Notification> findByUser(User user, Pageable pageable);

    /**
     * Find all notifications for a specific user by userId with pagination
     * @param userId the user ID
     * @param pageable pagination information
     * @return page of notifications
     */
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId")
    Page<Notification> findByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Find all unread notifications for a specific user
     * @param user the user
     * @return list of unread notifications
     */
    List<Notification> findByUserAndIsReadFalse(User user);

    /**
     * Find all unread notifications for a specific user by userId
     * @param userId the user ID
     * @return list of unread notifications
     */
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isRead = false")
    List<Notification> findByUserIdAndIsReadFalse(@Param("userId") Long userId);

    /**
     * Find all notifications of a specific type for a user
     * @param user the user
     * @param type the notification type
     * @return list of notifications
     */
    List<Notification> findByUserAndType(User user, NotificationType type);

    /**
     * Find all notifications of a specific type for a user by userId
     * @param userId the user ID
     * @param type the notification type
     * @return list of notifications
     */
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.type = :type")
    List<Notification> findByUserIdAndType(@Param("userId") Long userId, @Param("type") NotificationType type);

    /**
     * Count unread notifications for a user
     * @param user the user
     * @return count of unread notifications
     */
    long countByUserAndIsReadFalse(User user);

    /**
     * Count unread notifications for a user by userId
     * @param userId the user ID
     * @return count of unread notifications
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.isRead = false")
    long countByUserIdAndIsReadFalse(@Param("userId") Long userId);

    /**
     * Mark all notifications as read for a user
     * @param user the user
     * @param readAt the time when notifications were read
     * @return number of updated notifications
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.user = :user AND n.isRead = false")
    int markAllAsRead(@Param("user") User user, @Param("readAt") LocalDateTime readAt);

    /**
     * Mark all notifications as read for a user by userId
     * @param userId the user ID
     * @param readAt the time when notifications were read
     * @return number of updated notifications
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsReadByUserId(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);

    /**
     * Find notifications by reference (e.g., all notifications for a specific order)
     * @param referenceId the ID of the referenced entity
     * @param referenceType the type of the referenced entity
     * @return list of notifications
     */
    List<Notification> findByReferenceIdAndReferenceType(Long referenceId, String referenceType);
}
