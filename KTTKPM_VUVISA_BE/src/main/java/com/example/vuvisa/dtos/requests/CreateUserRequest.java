package com.example.vuvisa.dtos.requests;

import jakarta.validation.constraints.*;

import org.springframework.web.multipart.MultipartFile;

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
public class CreateUserRequest {

	@NotBlank(message = "USERNAME_REQUIRED")
	@Size(min = 4, message = "USERNAME_INVALID")
	private String username;

	@NotBlank(message = "EMAIL_REQUIRED")
	@Pattern(regexp = "^[a-zA-Z0-9._%+-]+@gmail\\.com$", message = "EMAIL_INVALID")
	private String email;

	@NotBlank(message = "PASSWORD_REQUIRED")
	@Size(min = 6, message = "PASSWORD_INVALID")
	private String password;

	@JsonProperty("retype_password")
	@NotBlank(message = "RE_PASSWORD_REQUIRED")
	private String retypePassword;

	@NotBlank(message = "FULL_NAME_REQUIRED")
	@Size(min = 10, message = "FULL_NAME_INVALID")
	private String fullName;

	private MultipartFile file; // file ảnh avatar
}
