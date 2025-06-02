package com.example.vuvisa.dtos.responses;

import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserListResponse {
	List<UserResponse> users;
	int totalPages;
}
