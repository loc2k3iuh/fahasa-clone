package com.example.vuvisa.dtos.responses;

import java.util.Set;
import java.util.stream.Collectors;

import com.example.vuvisa.entities.Role;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleResponse {
	String name;
	String description;
	Set<PermissionResponse> permissions;

	public static RoleResponse from(Role role) {
		return RoleResponse.builder()
				.name(String.valueOf(role.getName()))
				.description(role.getDescription())
				.permissions(role.getPermissions().stream()
						.map(PermissionResponse::from)
						.collect(Collectors.toSet()))
				.build();
	}
}
