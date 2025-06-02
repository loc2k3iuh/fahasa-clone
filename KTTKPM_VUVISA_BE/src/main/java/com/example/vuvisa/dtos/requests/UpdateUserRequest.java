package com.example.vuvisa.dtos.requests;

import java.time.LocalDate;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.web.multipart.MultipartFile;

import com.example.vuvisa.validator.dobs.DobConstraint;
import com.example.vuvisa.validator.users.fullnames.ValidVietnameseName;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserRequest {

	@Size(min = 10, message = "FULL_NAME_INVALID")
	@ValidVietnameseName(message = "FULL_NAME_INVALID_CHARACTERS")
	private String fullName;

	@Pattern(regexp = "^(09|03|02|07)\\d{8}$", message = "PHONE_INVALID")
	String phoneNumber;

	String address;

	@DobConstraint(min = 18, message = "DOB_INVALID")
	LocalDate dateOfBirth;

	MultipartFile file; // file ảnh avatar
}
