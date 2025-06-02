package com.example.vuvisa.listeners;

import com.example.vuvisa.entities.CalendarEvent;
import com.example.vuvisa.enums.NotificationType;
import com.example.vuvisa.events.NewCalendarEventEvent;
import com.example.vuvisa.services.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Listener for calendar event events to send notifications
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CalendarEventListener {

    private final NotificationService notificationService;

    /**
     * Handle new calendar event events
     * 
     * @param event the new calendar event event
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleNewCalendarEvent(NewCalendarEventEvent event) {
        CalendarEvent calendarEvent = event.getCalendarEvent();
        
        log.info("New calendar event created: {}", calendarEvent.getTitle());
        
        // Create notification for the event creator
        notificationService.createCalendarEventNotification(calendarEvent, NotificationType.CALENDAR_CREATED);
        
        // Notify all admins about the new calendar event
        notificationService.notifyAdminsAboutCalendarEvent(calendarEvent);
        
        log.info("Notifications sent for new calendar event: {}", calendarEvent.getTitle());
    }
}