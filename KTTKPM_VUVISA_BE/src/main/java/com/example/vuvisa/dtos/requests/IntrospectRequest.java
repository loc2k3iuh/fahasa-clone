package com.example.vuvisa.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IntrospectRequest {

	@NotNull(message = "TOKEN_REQUIRED")
	@NotBlank(message = "TOKEN_REQUIRED")
	String token;
}
