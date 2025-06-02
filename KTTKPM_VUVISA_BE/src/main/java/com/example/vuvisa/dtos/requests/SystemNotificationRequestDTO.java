package com.example.vuvisa.dtos.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for system notification request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemNotificationRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;
}
