package com.example.vuvisa.dtos.responses;

import java.time.LocalDate;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.vuvisa.entities.User;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {

	Long id;
	String username;

	String email;

	@JsonProperty("full_name")
	String fullName;

	@JsonProperty("phone_number")
	String phoneNumber;

	String address;

	@JsonProperty("date_of_birth")
	LocalDate dateOfBirth;

	@JsonProperty("is_active")
	Boolean isActive;

	@JsonProperty("message")
	String message;

	@JsonProperty("avatar_url")
	String avatarUrl;

	@JsonProperty("created_date")
	Date createdDate;

	@JsonProperty("updated_date")
	Date updatedDate;

	@JsonProperty("roles")
	Set<RoleResponse> roles;

	@JsonProperty("status")
	String status;

	public static UserResponse fromUser(User user) {
		return UserResponse.builder()
				.id(user.getId())
				.username(user.getUsername())
				.email(user.getEmail())
				.fullName(user.getFullName())
				.phoneNumber(user.getPhoneNumber())
				.address(user.getAddress())
				.isActive(user.getIsActive())
				.dateOfBirth(user.getDateOfBirth())
				.avatarUrl(user.getAvatarUrl())
				.createdDate(user.getCreatedDate())
				.updatedDate(user.getUpdatedDate())
				.status(user.getStatus() != null ? user.getStatus().toString() : null)
				.roles(user.getRoles().stream().map(RoleResponse::from).collect(Collectors.toSet()))
				.build();
	}
}
