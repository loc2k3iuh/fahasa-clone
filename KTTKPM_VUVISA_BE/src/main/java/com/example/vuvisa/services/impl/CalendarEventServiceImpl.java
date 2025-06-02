package com.example.vuvisa.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import com.example.vuvisa.events.EventPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.vuvisa.dtos.requests.CreateCalendarEventRequest;
import com.example.vuvisa.dtos.requests.UpdateCalendarEventRequest;
import com.example.vuvisa.dtos.responses.CalendarEventResponse;
import com.example.vuvisa.dtos.responses.UserResponse;
import com.example.vuvisa.entities.CalendarEvent;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.exceptions.AppException;
import com.example.vuvisa.exceptions.ErrorCode;
import com.example.vuvisa.repositories.CalendarEventRepository;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.services.CalendarEventService;
import com.example.vuvisa.services.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarEventServiceImpl implements CalendarEventService {
    private final CalendarEventRepository calendarEventRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Autowired
    private EventPublisher eventPublisher;

    @Transactional
    @Override
    public CalendarEventResponse createEvent(CreateCalendarEventRequest request) throws Exception {
        UserResponse userResponse = userService.getUserDetailsFromToken();
        User currentUser = userRepository.findById(userResponse.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        System.out.println(currentUser);
        CalendarEvent event = CalendarEvent.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .allDay(request.getAllDay())
                .createdBy(currentUser)
                .priority(request.getPriority())
                .build();

        CalendarEvent savedEvent = calendarEventRepository.save(event);
        eventPublisher.publishNewCalendarEventEvent(savedEvent);
        return mapToCalendarEventResponse(savedEvent);
    }

    @Transactional
    @Override
    public CalendarEventResponse updateEvent(Long eventId, UpdateCalendarEventRequest request) {
        CalendarEvent event = calendarEventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setAllDay(request.getAllDay());
        event.setPriority(request.getPriority());

        CalendarEvent updatedEvent = calendarEventRepository.save(event);
        return mapToCalendarEventResponse(updatedEvent);
    }

    @Transactional
    @Override
    public void deleteEvent(Long eventId) {
        CalendarEvent event = calendarEventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        calendarEventRepository.delete(event);
    }

    @Override
    public CalendarEventResponse getEventById(Long eventId) {
        CalendarEvent event = calendarEventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        return mapToCalendarEventResponse(event);
    }

    @Override
    public List<CalendarEventResponse> getAllEvents() {
        return calendarEventRepository.findAll().stream().map(this::mapToCalendarEventResponse).collect(Collectors.toList());
    }






    private CalendarEventResponse mapToCalendarEventResponse(CalendarEvent event) {
        return CalendarEventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .allDay(event.getAllDay())
                .createdBy(mapToUserResponse(event.getCreatedBy()))
                .priority(event.getPriority())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .dateOfBirth(user.getDateOfBirth())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}