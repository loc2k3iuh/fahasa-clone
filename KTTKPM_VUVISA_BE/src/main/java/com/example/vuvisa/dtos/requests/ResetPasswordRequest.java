package com.example.vuvisa.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResetPasswordRequest {

	@NotBlank(message = "TOKEN_REQUIRED")
	@JsonProperty("token")
	String token;

	@NotBlank(message = "PASSWORD_REQUIRED")
	@Size(min = 6, message = "PASSWORD_INVALID")
	@JsonProperty("new_password")
	String newPassword;

	@NotBlank(message = "RE_PASSWORD_REQUIRED")
	@Size(min = 6, message = "PASSWORD_INVALID")
	@JsonProperty("confirm_password")
	String confirmPassword;
}
