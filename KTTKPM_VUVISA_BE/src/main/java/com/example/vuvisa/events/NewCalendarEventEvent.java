package com.example.vuvisa.events;

import com.example.vuvisa.entities.CalendarEvent;
import lombok.Getter;

/**
 * Event that is published when a new calendar event is created
 */
@Getter
public class NewCalendarEventEvent {
    private final CalendarEvent calendarEvent;
    
    /**
     * Create a new NewCalendarEventEvent
     * 
     * @param calendarEvent the calendar event
     */
    public NewCalendarEventEvent(CalendarEvent calendarEvent) {
        this.calendarEvent = calendarEvent;
    }
}