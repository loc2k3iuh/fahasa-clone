package com.example.vuvisa.services.impl;

import java.io.IOException;
import java.util.*;
import java.util.Calendar;
import java.util.Date;
import java.util.stream.Collectors;

import com.example.vuvisa.events.EventPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.vuvisa.dtos.requests.*;
import com.example.vuvisa.dtos.responses.UserResponse;
import com.example.vuvisa.entities.ConfirmationToken;
import com.example.vuvisa.entities.Role;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.enums.RoleType;
import com.example.vuvisa.enums.UserStatus;
import com.example.vuvisa.exceptions.AppException;
import com.example.vuvisa.exceptions.ErrorCode;
import com.example.vuvisa.repositories.RoleRepository;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.services.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {


	UserRepository userRepository;
	RoleRepository roleRepository;
	S3Service s3Service;
	EmailService emailService;
	ConfirmationTokenService confirmationTokenService;
	MessageService messageService;

	@Autowired
	private EventPublisher eventPublisher;

	private String createConfirmationToken(User user) {
		String token = UUID.randomUUID().toString();
		Date now = new Date();
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(now);
		calendar.add(Calendar.MINUTE, 15);

		ConfirmationToken confirmationToken = ConfirmationToken.builder()
				.token(token)
				.user(user)
				.createdAt(now)
				.expiresAt(calendar.getTime())
				.build();
		confirmationTokenService.saveToken(confirmationToken);
		return token;
	}

	@Override
	@Transactional
	public void createUser(CreateUserRequest request) throws IOException {

		if (!request.getPassword().equals(request.getRetypePassword())) {
			throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
		}

		Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());

		// Nếu đã có email rồi
		if (existingUserOpt.isPresent()) {
			User existingUser = existingUserOpt.get();

			if (existingUser.getEnabled()) {
				throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
			}

			// Cập nhật thông tin user chưa xác thực
			existingUser.setUsername(request.getUsername());
			existingUser.setFullName(request.getFullName());

			PasswordEncoder encoder = new BCryptPasswordEncoder(10);
			existingUser.setPassword(encoder.encode(request.getPassword()));

			MultipartFile file = request.getFile();
			if (file != null && !file.isEmpty()) {
				String avatarUrl = s3Service.uploadFile(file, existingUser.getUsername());
				existingUser.setAvatarUrl(avatarUrl);
			}

			existingUser.setCreatedDate(new Date());
			existingUser.setEnabled(false);
			existingUser.setIsActive(false);

			confirmationTokenService.deleteTokensByUser(existingUser);

			userRepository.save(existingUser);
			return;
		}

		// Nếu email chưa tồn tại => tạo user mới
		if (userRepository.existsByUsername(request.getUsername())) {
			throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
		}

		Role defaultRole =
				roleRepository.findByName(RoleType.USER).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

		PasswordEncoder encoder = new BCryptPasswordEncoder(10);
		String encodedPassword = encoder.encode(request.getPassword());

		User user = User.builder()
				.username(request.getUsername())
				.email(request.getEmail())
				.password(encodedPassword)
				.fullName(request.getFullName())
				.roles(Set.of(defaultRole))
				.createdDate(new Date())
				.isActive(false)
				.enabled(false)
				.build();

		MultipartFile file = request.getFile();
		if (file != null && !file.isEmpty()) {
			String avatarUrl = s3Service.uploadFile(file, user.getUsername());
			user.setAvatarUrl(avatarUrl);
		}

		userRepository.save(user);

		eventPublisher.publishSystemNotificationEvent("Chào mừng", "Chào mừng bạn đến với VUVISA, hãy thử trải nghiệm mua sắm.", user);

		String token = createConfirmationToken(user);
		String link = "http://localhost:5173/user/register-success?token=" + token;
		emailService.sendEmail(request.getEmail(), link);
	}

	@Override
	@Transactional
	public UserResponse confirmToken(RegisterTokenRequest registerTokenRequest) {
		ConfirmationToken confirmationToken = confirmationTokenService
				.getToken(registerTokenRequest.getToken())
				.orElseThrow(() -> new AppException(ErrorCode.TOKEN_NOT_FOUND));

		if (confirmationToken.getConfirmedAt() != null) {
			throw new AppException(ErrorCode.TOKEN_CONFIRMED);
		}

		if (confirmationToken.getExpiresAt().before(new Date())) {
			throw new AppException(ErrorCode.TOKEN_EXPIRED);
		}

		confirmationToken.setConfirmedAt(new Date());
		confirmationTokenService.saveToken(confirmationToken);

		User user = confirmationToken.getUser();
		user.setEnabled(true);
		user.setIsActive(true);
		userRepository.save(user);

		// Create a message room for the user and all admin users
		messageService.createMessageRoomWithAdmins(user.getId());

		return UserResponse.fromUser(user);
	}

	@Override
	@Transactional
	public void resendConfirmationToken(ResendConfirmationRequest resendConfirmationRequest) {
		User user = userRepository
				.findByEmail(resendConfirmationRequest.getEmail())
				.orElseThrow(() -> new IllegalStateException("Không tìm thấy người dùng."));

		if (user.getEnabled()) {
			throw new IllegalStateException("Tài khoản đã xác nhận.");
		}

		// Xoá token cũ
		confirmationTokenService.deleteTokensByUser(user);

		// Tạo token mới
		String token = createConfirmationToken(user);

		// Gửi email mới
		String link = "http://localhost:5173/user/register-success?token=" + token;
		emailService.sendEmail(resendConfirmationRequest.getEmail(), link);
	}

	@Override
	@Transactional
	public UserResponse getUserDetails(Long userId) {
		if (userId == null) {
			throw new AppException(ErrorCode.USER_NOT_FOUND);
		}
		if (!userRepository.existsById(userId)) {
			throw new AppException(ErrorCode.USER_NOT_FOUND);
		}
		User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
		return UserResponse.fromUser(user);
	}

	@Override
	public UserResponse getUserDetailsFromToken() {
		var authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new AppException(ErrorCode.UNAUTHORIZED);
		}

		String username = authentication.getName();
		User user =
				userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

		return UserResponse.fromUser(user);
	}

	@Override
	@Transactional
	@PostAuthorize("returnObject.username ==  authentication.name")
	public UserResponse updateUser(Long userId, UpdateUserRequest updatedUserDTO) throws IOException {
		// Find the existing user by userId
		User existingUser =
				userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

		// Check if the phone number is being changed and if it already exists for another user
		String newPhoneNumber = updatedUserDTO.getPhoneNumber();
		if (existingUser.getPhoneNumber() != null) {
			if (!existingUser.getPhoneNumber().equals(newPhoneNumber)
					&& userRepository.existsByPhoneNumber(newPhoneNumber)) {
				throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
			}
		}

		if (updatedUserDTO.getFullName() != null) {
			existingUser.setFullName(updatedUserDTO.getFullName());
		}

		if (newPhoneNumber != null) {
			existingUser.setPhoneNumber(newPhoneNumber);
		}

		if (updatedUserDTO.getAddress() != null) {
			existingUser.setAddress(updatedUserDTO.getAddress());
		}

		if (updatedUserDTO.getDateOfBirth() != null) {
			existingUser.setDateOfBirth(updatedUserDTO.getDateOfBirth());
		}
		existingUser.setUpdatedDate(new Date());
		MultipartFile file = updatedUserDTO.getFile();
		if (file != null && !file.isEmpty()) {
			String avatarUrl = s3Service.uploadFile(file, existingUser.getUsername());
			existingUser.setAvatarUrl(avatarUrl);
		}
		userRepository.save(existingUser);
		return UserResponse.fromUser(existingUser);
	}

//	@PreAuthorize("hasAuthority('APPROVE_POST')")
	@Override
	@Transactional
	public UserResponse inactivateUser(Long userId) {

		User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

		boolean hasUserRole = user.getRoles().stream().anyMatch(role -> role.getName() == RoleType.USER);

		if (!hasUserRole) {
			throw new AppException(ErrorCode.UNAUTHORIZED);
		}

		user.setIsActive(!user.getIsActive());

		// If user is being inactivated, set status to DISABLED
		if (!user.getIsActive()) {
			user.setStatus(UserStatus.DISABLED);
			System.out.println("Setting user " + user.getUsername() + " status to DISABLED");
		} else {
			// If user is being activated, set status to OFFLINE
			user.setStatus(UserStatus.OFFLINE);
			System.out.println("Setting user " + user.getUsername() + " status to OFFLINE");
		}

		// Save the updated user
		userRepository.save(user);

		return UserResponse.fromUser(user);
	}


	@Override
	@Transactional
	public UserResponse notificationInactivedUser(Long userId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
		return UserResponse.fromUser(user);
	}


	@PreAuthorize("hasAuthority('APPROVE_POST')")
	@Override
	public Page<UserResponse> getAllUsers(String keyword, Boolean state, PageRequest pageRequest) {
		Page<User> usersPage = userRepository.searchUsersOptimized(keyword, state, pageRequest);
		return usersPage.map(UserResponse::fromUser);
	}

	@Override
	@Transactional
	public UserResponse connectUser(ConnectUserRequest connectUserRequest) {
		Optional<User> user = userRepository.findById(connectUserRequest.getId());
		user.ifPresent(u -> {
			// Log the status change
			boolean hasUserRole = u.getRoles().stream().anyMatch(role -> role.getName() == RoleType.USER);
			if (!hasUserRole) {
				throw new AppException(ErrorCode.UNAUTHORIZED);
			}

			messageService.setLastSeen(u.getId());
			System.out.println("Setting user " + u.getUsername() + " status to ONLINE");
			u.setStatus(UserStatus.ONLINE);
			u.setLastLogin(null);
			userRepository.save(u);
		});
		UserResponse response =
				user.map(UserResponse::fromUser).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
		// Log the response that contains the status
		System.out.println("User connected response: " + response.getUsername() + " - Status: " + response.getStatus());
		return response;
	}

	@Override
	@Transactional
	public UserResponse disconnectUser(ConnectUserRequest connectUserRequest) {
		Optional<User> user = userRepository.findById(connectUserRequest.getId());
		user.ifPresent(u -> {
			boolean hasUserRole = u.getRoles().stream().anyMatch(role -> role.getName() == RoleType.USER);
			if (!hasUserRole) {
				throw new AppException(ErrorCode.UNAUTHORIZED);
			}

			messageService.setLastSeen(u.getId());
			// Log the status change
			System.out.println("Setting user " + u.getUsername() + " status to OFFLINE");
			u.setStatus(UserStatus.OFFLINE);
			u.setLastLogin(new Date());
			userRepository.save(u);
		});
		UserResponse response =
				user.map(UserResponse::fromUser).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
		// Log the response that contains the status
		System.out.println(
				"User disconnected response: " + response.getUsername() + " - Status: " + response.getStatus());
		return response;
	}

	@Override
	@Transactional
	public UserResponse connectAdmin(ConnectUserRequest connectUserRequest) {
		Optional<User> user = userRepository.findById(connectUserRequest.getId());
		user.ifPresent(u -> {
			boolean hasAdminRole = u.getRoles().stream().anyMatch(role -> role.getName() == RoleType.ADMIN);

			if (!hasAdminRole) {
				throw new AppException(ErrorCode.UNAUTHORIZED);
			}
			System.out.println("Setting user " + u.getUsername() + " status to ONLINE");
			u.setStatus(UserStatus.ONLINE);
			u.setLastLogin(null);
			userRepository.save(u);
		});
		UserResponse response =
				user.map(UserResponse::fromUser).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
		// Log the response that contains the status
		System.out.println(
				"Admin connected response: " + response.getUsername() + " - Status: " + response.getStatus());
		return response;
	}

	@Override
	@Transactional
	public UserResponse disconnectAdmin(ConnectUserRequest connectUserRequest) {
		Optional<User> user = userRepository.findById(connectUserRequest.getId());
		user.ifPresent(u -> {
			boolean hasAdminRole = u.getRoles().stream().anyMatch(role -> role.getName() == RoleType.ADMIN);

			if (!hasAdminRole) {
				throw new AppException(ErrorCode.UNAUTHORIZED);
			}

			// Log the status change
			System.out.println("Setting user " + u.getUsername() + " status to OFFLINE");
			u.setStatus(UserStatus.OFFLINE);
			u.setLastLogin(new Date());

			userRepository.save(u);
		});
		UserResponse response =
				user.map(UserResponse::fromUser).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
		// Log the response that contains the status
		System.out.println(
				"Admin connected response: " + response.getUsername() + " - Status: " + response.getStatus());
		return response;
	}

	@Override
	public List<UserResponse> getOnlineUsers() {
		List<User> onlineUsers = userRepository.findByStatus(UserStatus.ONLINE);
		return onlineUsers.stream()
				.filter(user -> user.getRoles().stream().anyMatch(role -> role.getName() == RoleType.USER))
				.map(UserResponse::fromUser)
				.collect(Collectors.toList());
	}

	@Override
	public List<UserResponse> getOnlineAdmins() {
		List<User> onlineUsers = userRepository.findByStatus(UserStatus.ONLINE);
		return onlineUsers.stream()
				.filter(user -> user.getRoles().stream().anyMatch(role -> role.getName() == RoleType.ADMIN))
				.map(UserResponse::fromUser)
				.collect(Collectors.toList());
	}

	@Override
	public long getTotalUserCount() {
		List<User> allUsers = userRepository.findAll();
		return allUsers.stream()
				.filter(user -> user.getRoles().stream()
						.anyMatch(role -> role.getName() == RoleType.USER))
				.count();
	}
}
