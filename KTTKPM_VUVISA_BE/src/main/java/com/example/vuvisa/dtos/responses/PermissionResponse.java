package com.example.vuvisa.dtos.responses;

import com.example.vuvisa.entities.Permission;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PermissionResponse {
	String name;
	String description;

	public static PermissionResponse from(Permission permission) {
		return PermissionResponse.builder()
				.name(permission.getName())
				.description(permission.getDescription())
				.build();
	}
}
