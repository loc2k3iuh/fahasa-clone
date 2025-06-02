package com.example.vuvisa.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SendMailResetPasswordRequest {
	@NotNull(message = "EMAIL_REQUIRED")
	@NotBlank(message = "EMAIL_REQUIRED")
	String email;

	@JsonProperty("is_admin")
	boolean isAdmin;
}
