package com.example.vuvisa.schedulers;

import com.example.vuvisa.entities.CalendarEvent;
import com.example.vuvisa.entities.Notification;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.enums.NotificationType;
import com.example.vuvisa.enums.RoleType;
import com.example.vuvisa.repositories.CalendarEventRepository;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.services.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Scheduler for sending notifications for calendar events
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final NotificationService notificationService;
    private final CalendarEventRepository calendarEventRepository;
    private final UserRepository userRepository;

    /**
     * Send reminders for upcoming calendar events
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Run every hour
    public void sendCalendarEventReminders() {
        log.info("Running calendar event reminder scheduler");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneDayFromNow = now.plus(1, ChronoUnit.DAYS);
        
        // Find events that start within the next 24 hours and haven't been notified yet
        List<CalendarEvent> upcomingEvents = calendarEventRepository.findUpcomingEvents(now, oneDayFromNow);
        
        List<Notification> sentNotifications = new ArrayList<>();
        
        for (CalendarEvent event : upcomingEvents) {
            // Send notification to the event creator
            Notification notification = notificationService.createCalendarEventNotification(
                    event, NotificationType.CALENDAR_REMINDER);
            sentNotifications.add(notification);
            
            log.info("Sent calendar reminder notification for event: {}", event.getTitle());
        }
        
        log.info("Calendar event reminder scheduler completed. Sent {} notifications", sentNotifications.size());
    }
    
    /**
     * Notify admins about new calendar events
     * This would typically be triggered by an event listener when a new calendar event is created,
     * but for demonstration purposes, we'll run it on a schedule
     */
    @Scheduled(cron = "0 */30 * * * *") // Run every 30 minutes
    public void notifyAdminsAboutNewEvents() {
        log.info("Running admin notification scheduler for new calendar events");
        
        LocalDateTime thirtyMinutesAgo = LocalDateTime.now().minus(30, ChronoUnit.MINUTES);
        
        // Find events created in the last 30 minutes
        List<CalendarEvent> newEvents = calendarEventRepository.findByCreatedAtAfter(thirtyMinutesAgo);
        
        int notificationCount = 0;
        
        for (CalendarEvent event : newEvents) {
            List<Notification> notifications = notificationService.notifyAdminsAboutCalendarEvent(event);
            notificationCount += notifications.size();
        }
        
        log.info("Admin notification scheduler completed. Sent {} notifications for {} new events", 
                notificationCount, newEvents.size());
    }
}