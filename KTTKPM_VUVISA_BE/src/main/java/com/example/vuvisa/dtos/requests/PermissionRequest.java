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
public class PermissionRequest {

	@NotBlank(message = "NAME_REQUIRED")
	String name;

	@NotBlank(message = "DESCRIPTION_REQUIRED")
	String description;
}
