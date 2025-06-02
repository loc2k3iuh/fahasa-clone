package com.example.vuvisa.controllers;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.*;
import com.example.vuvisa.dtos.responses.UserListResponse;
import com.example.vuvisa.dtos.responses.UserResponse;
import com.example.vuvisa.services.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/users")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

	UserService userService;

	@PostMapping("/register")
	public APIResponse<Void> registerUser(@ModelAttribute @Valid CreateUserRequest request) throws Exception {
		userService.createUser(request);

		return APIResponse.<Void>builder()
				.message("We sent you a confirmation email, please check your inbox")
				.build();
	}

	@PostMapping("/confirm")
	public APIResponse<UserResponse> confirm(@RequestBody @Valid RegisterTokenRequest registerTokenRequest) {
		return APIResponse.<UserResponse>builder()
				.result(userService.confirmToken(registerTokenRequest))
				.message("User confirmed successfully")
				.build();
	}

	@PostMapping("/resend-confirmation")
	public APIResponse<Void> resendConfirmation(
			@RequestBody @Valid ResendConfirmationRequest resendConfirmationRequest) {
		userService.resendConfirmationToken(resendConfirmationRequest);
		return APIResponse.<Void>builder()
				.message("We have resent the confirmation email.")
				.build();
	}

	@GetMapping("")
	public APIResponse<UserListResponse> getAllUsers(
			@RequestParam(value = "keyword", required = false) String keyword,
			@RequestParam(value = "state", required = false) Boolean state,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int limit)
			throws Exception {
		PageRequest pageRequest = PageRequest.of(page, limit, Sort.by("id").ascending());
		Page<UserResponse> usersPage = userService.getAllUsers(keyword, state, pageRequest);
		int totalPages = usersPage.getTotalPages();
		List<UserResponse> users = usersPage.getContent();
		return APIResponse.<UserListResponse>builder()
				.result(UserListResponse.builder()
						.users(users)
						.totalPages(totalPages)
						.build())
				.message("Users retrieved successfully")
				.build();
	}
	;

	@GetMapping("/myinfor")
	public APIResponse<UserResponse> getUserByToken() throws Exception {
		return APIResponse.<UserResponse>builder()
				.result(userService.getUserDetailsFromToken())
				.message("A User retrieved successfully")
				.build();
	}

	@PutMapping("/{userId}")
	public APIResponse<UserResponse> updateUserDetails(
			@PathVariable Long userId, @Valid @ModelAttribute UpdateUserRequest updatedUserDTO) throws Exception {
		return APIResponse.<UserResponse>builder()
				.result(userService.updateUser(userId, updatedUserDTO))
				.message("User updated successfully")
				.build();
	}

	@GetMapping("/{userId}")
	public APIResponse<UserResponse> getUserDetails(@PathVariable Long userId) throws Exception {
		return APIResponse.<UserResponse>builder()
				.result(userService.getUserDetails(userId))
				.message("User details retrieved successfully")
				.build();
	}

	@PostMapping("inactivate/{userId}")
	public APIResponse<UserResponse> inactivateUser(@PathVariable Long userId) throws Exception {
		return APIResponse.<UserResponse>builder()
				.result(userService.inactivateUser(userId))
				.message("User inactivated successfully")
				.build();
	}

	@PostMapping("/connect-user")
	public APIResponse<UserResponse> connectUserREST(@RequestBody ConnectUserRequest connectUserRequest) {
		// This is a REST API fallback for when WebSocket connection fails
		return APIResponse.<UserResponse>builder()
				.result(userService.connectUser(connectUserRequest))
				.message("User connected successfully via REST API")
				.build();
	}

	@PostMapping("/disconnect-user")
	public APIResponse<UserResponse> disconnectUserREST(@RequestBody ConnectUserRequest connectUserRequest) {
		return APIResponse.<UserResponse>builder()
				.result(userService.disconnectUser(connectUserRequest))
				.message("User disconnected successfully")
				.build();
	}

	@PostMapping("/connect-admin")
	public APIResponse<UserResponse> connectAdminREST(@RequestBody ConnectUserRequest connectUserRequest) {
		// This is a REST API fallback for when WebSocket connection fails
		return APIResponse.<UserResponse>builder()
				.result(userService.connectAdmin(connectUserRequest))
				.message("Admin connected successfully via REST API")
				.build();
	}

	@PostMapping("/disconnect-admin")
	public APIResponse<UserResponse> disconnectAdminREST(@RequestBody ConnectUserRequest connectUserRequest) {
		return APIResponse.<UserResponse>builder()
				.result(userService.disconnectAdmin(connectUserRequest))
				.message("Admin disconnected successfully")
				.build();
	}

	@GetMapping("/online-users")
	public APIResponse<List<UserResponse>> getOnlineUsers() {
		return APIResponse.<List<UserResponse>>builder()
				.result(userService.getOnlineUsers())
				.message("Retrieved online users successfully")
				.build();
	}

	@GetMapping("/online-admins")
	public APIResponse<List<UserResponse>> getOnlineAdmins() {
		return APIResponse.<List<UserResponse>>builder()
				.result(userService.getOnlineAdmins())
				.message("Retrieved online admins successfully")
				.build();
	}

	@GetMapping("/count")
	public APIResponse<Long> getTotalUserCount() {
		long totalUserCount = userService.getTotalUserCount();
		return APIResponse.<Long>builder()
				.result(totalUserCount)
				.message("Total user count retrieved successfully")
				.build();
	}
}

