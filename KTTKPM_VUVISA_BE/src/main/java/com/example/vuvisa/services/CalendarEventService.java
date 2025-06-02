package com.example.vuvisa.services;

import com.example.vuvisa.dtos.requests.CreateCalendarEventRequest;
import com.example.vuvisa.dtos.requests.UpdateCalendarEventRequest;
import com.example.vuvisa.dtos.responses.CalendarEventResponse;
import com.example.vuvisa.enums.EventPriority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface CalendarEventService {
    @Transactional
    CalendarEventResponse createEvent(CreateCalendarEventRequest request) throws Exception;

    @Transactional
    CalendarEventResponse updateEvent(Long eventId, UpdateCalendarEventRequest request);

    @Transactional
    void deleteEvent(Long eventId);

    CalendarEventResponse getEventById(Long eventId);



    List<CalendarEventResponse> getAllEvents();






}
