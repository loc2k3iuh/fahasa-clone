package com.example.vuvisa.dtos.requests;

import jakarta.validation.constraints.NotBlank;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationRequest {

	@NotBlank(message = "USERNAME_REQUIRED")
	String username;

	@NotBlank(message = "PASSWORD_REQUIRED")
	String password;
}
