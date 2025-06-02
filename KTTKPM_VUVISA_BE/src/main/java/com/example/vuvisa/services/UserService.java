package com.example.vuvisa.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.example.vuvisa.dtos.requests.*;
import com.example.vuvisa.dtos.responses.UserResponse;

public interface UserService {
	void createUser(CreateUserRequest createUserRequest) throws Exception;

	UserResponse confirmToken(RegisterTokenRequest registerTokenRequest);

	void resendConfirmationToken(ResendConfirmationRequest resendConfirmationRequest);

	UserResponse getUserDetails(Long userId) throws Exception;

	UserResponse getUserDetailsFromToken() throws Exception;

	UserResponse updateUser(Long userId, UpdateUserRequest updatedUserDTO) throws Exception;

	UserResponse inactivateUser(Long userId) throws Exception;

	Page<UserResponse> getAllUsers(String keyword, Boolean state, PageRequest pageRequest) throws Exception;

	UserResponse connectUser(ConnectUserRequest connectUserRequest);

	UserResponse disconnectUser(ConnectUserRequest connectUserRequest);

	UserResponse connectAdmin(ConnectUserRequest connectUserRequest);

	UserResponse disconnectAdmin(ConnectUserRequest connectUserRequest);

	List<UserResponse> getOnlineUsers();

	List<UserResponse> getOnlineAdmins();

	long getTotalUserCount();

	UserResponse notificationInactivedUser(Long userId);
}

