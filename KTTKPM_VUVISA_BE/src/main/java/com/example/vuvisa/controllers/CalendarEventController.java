package com.example.vuvisa.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.CreateCalendarEventRequest;
import com.example.vuvisa.dtos.requests.UpdateCalendarEventRequest;
import com.example.vuvisa.dtos.responses.CalendarEventResponse;
import com.example.vuvisa.enums.EventPriority;
import com.example.vuvisa.services.CalendarEventService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/calendar-events")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CalendarEventController {
    CalendarEventService calendarEventService;

    @PostMapping("")
    public APIResponse<CalendarEventResponse> createEvent(@Valid @RequestBody CreateCalendarEventRequest request) throws Exception {
        return APIResponse.<CalendarEventResponse>builder()
                .result(calendarEventService.createEvent(request))
                .message("Calendar event created successfully")
                .build();
    }

    @PutMapping("/{eventId}")
    public APIResponse<CalendarEventResponse> updateEvent(
            @PathVariable Long eventId,
            @Valid @RequestBody UpdateCalendarEventRequest request) {
        return APIResponse.<CalendarEventResponse>builder()
                .result(calendarEventService.updateEvent(eventId, request))
                .message("Calendar event updated successfully")
                .build();
    }

    @DeleteMapping("/{eventId}")
    public APIResponse<Void> deleteEvent(@PathVariable Long eventId) {
        calendarEventService.deleteEvent(eventId);
        return APIResponse.<Void>builder()
                .message("Calendar event deleted successfully")
                .build();
    }

    @GetMapping("/{eventId}")
    public APIResponse<CalendarEventResponse> getEventById(@PathVariable Long eventId) {
        return APIResponse.<CalendarEventResponse>builder()
                .result(calendarEventService.getEventById(eventId))
                .message("Calendar event retrieved successfully")
                .build();
    }

    @GetMapping("")
    public APIResponse<List<CalendarEventResponse>> getAllEvents() {
       List<CalendarEventResponse> events = calendarEventService.getAllEvents();
        return APIResponse.<List<CalendarEventResponse>>builder()
                .result(events)
                .message("Calendar events retrieved successfully")
                .build();
    }








}
