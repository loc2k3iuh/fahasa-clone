package com.example.vuvisa.events;

import com.example.vuvisa.services.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Event listener for notification events
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;

    /**
     * Handle system notification events
     * 
     * @param event the system notification event
     */
    @EventListener
    public void handleSystemNotificationEvent(SystemNotificationEvent event) {
        log.debug("Handling SystemNotificationEvent: {}", event.getTitle());
        
        notificationService.createNotification(
            event.getTitle(),
            event.getMessage(),
            event.getType(),
            event.getRecipient(),
            null,
            null
        );
        
        log.debug("Created notification for user: {}", event.getRecipient().getUsername());
    }
}