package com.example.vuvisa.dtos.requests;


import com.example.vuvisa.enums.EventPriority;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCalendarEventRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;


    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;


    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;


    private Boolean allDay;

    @NotNull(message = "Priority is required")
    private EventPriority priority;
}
