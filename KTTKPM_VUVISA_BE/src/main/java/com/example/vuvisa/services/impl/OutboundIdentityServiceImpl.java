package com.example.vuvisa.services.impl;

import java.util.Date;
import java.util.HashSet;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.vuvisa.dtos.requests.FacebookUserRequest;
import com.example.vuvisa.dtos.requests.GoogleExchangeTokenRequest;
import com.example.vuvisa.dtos.responses.AuthenticationResponse;
import com.example.vuvisa.dtos.responses.GoogleExchangeTokenResponse;
import com.example.vuvisa.dtos.responses.GoogleUserResponse;
import com.example.vuvisa.entities.RefreshToken;
import com.example.vuvisa.entities.Role;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.enums.RoleType;
import com.example.vuvisa.exceptions.AppException;
import com.example.vuvisa.exceptions.ErrorCode;
import com.example.vuvisa.repositories.RoleRepository;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.repositories.httpclient.google.OutboundGoogleIdentityClient;
import com.example.vuvisa.repositories.httpclient.google.OutboundGoogleUserClient;
import com.example.vuvisa.services.JwtService;
import com.example.vuvisa.services.OutboundIdentityService;
import com.example.vuvisa.services.RefreshTokenService;
import com.nimbusds.jose.JOSEException;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OutboundIdentityServiceImpl implements OutboundIdentityService {

	OutboundGoogleIdentityClient outboundGoogleIdentityClient;
	OutboundGoogleUserClient outboundGoogleUserClient;
	UserRepository userRepository;
	JwtService jwtService;
	RefreshTokenService refreshTokenService;
	RoleRepository roleRepository;

	@NonFinal
	@Value("${google.oauth2.clientId}")
	protected String clientId;

	@NonFinal
	@Value("${google.oauth2.clientSecret}")
	protected String clientSecret;

	@NonFinal
	@Value("${google.oauth2.redirectUri}")
	protected String redirectUri;

	@NonFinal
	@Value("${google.oauth2.grantType}")
	protected String grantType;

	@Override
	public AuthenticationResponse authenticateWithGoogle(String code) throws JOSEException {

		// Exchange code for tokens
		GoogleExchangeTokenRequest request = GoogleExchangeTokenRequest.builder()
				.code(code)
				.clientId(clientId)
				.clientSecret(clientSecret)
				.redirectUri(redirectUri)
				.grantType(grantType)
				.build();

		GoogleExchangeTokenResponse response = outboundGoogleIdentityClient.exchangeToken(request);

		// Extract user info from ID token
		GoogleUserResponse userResponse = outboundGoogleUserClient.getUserInfo("Bearer " + response.getAccessToken());

		// Check if user exists with this email
		Optional<User> userOptional = userRepository.findByEmail(userResponse.getEmail());

		User user = userOptional
				.map(u -> isAdmin(u)
						? getUsersIsAdmin(Optional.of(u))
						: getUserOrCreateIfNotAdmin(Optional.of(u), userResponse))
				.orElseGet(() -> getUserOrCreateIfNotAdmin(Optional.empty(), userResponse));

		// Generate JWT token
		String accessToken = jwtService.generateToken(user);
		RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

		return AuthenticationResponse.builder()
				.authenticated(true)
				.token(accessToken)
				.refreshToken(refreshToken.getToken())
				.build();
	}

	@Override
	public AuthenticationResponse authenticateWithFacebook(FacebookUserRequest facebookUserRequest)
			throws JOSEException {

		// Check if user exists with this email
		Optional<User> userOptional = userRepository.findByEmail(facebookUserRequest.getEmail());

		User user = userOptional
				.map(u -> isAdmin(u)
						? getUsersIsAdmin(Optional.of(u))
						: getUserOrCreateIfNotAdminFromFacebook(Optional.of(u), facebookUserRequest))
				.orElseGet(() -> getUserOrCreateIfNotAdminFromFacebook(Optional.empty(), facebookUserRequest));

		// Generate JWT token
		String accessToken = jwtService.generateToken(user);
		RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

		return AuthenticationResponse.builder()
				.authenticated(true)
				.token(accessToken)
				.refreshToken(refreshToken.getToken())
				.build();
	}

	private boolean isAdmin(User user) {
		return user.getRoles().stream().anyMatch(role -> role.getName() == RoleType.ADMIN);
	}

	public User getUsersIsAdmin(Optional<User> userOptional) {
		User user = userOptional.orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

		// Check if user is enabled and active
		if (!user.getEnabled()) {
			throw new AppException(ErrorCode.USER_DISABLED);
		}

		if (!user.getIsActive()) {
			throw new AppException(ErrorCode.USER_INACTIVATED);
		}

		return user;
	}

	public User getUserOrCreateIfNotAdmin(Optional<User> userOptional, GoogleUserResponse googleUserResponse) {
		if (userOptional.isPresent()) {
			// User exists - return existing user
			User user = userOptional.get();

			// Check if user is enabled and active
			if (!user.getEnabled()) {
				throw new AppException(ErrorCode.USER_DISABLED);
			}

			if (!user.getIsActive()) {
				throw new AppException(ErrorCode.USER_INACTIVATED);
			}

			return user;
		} else {
			HashSet<Role> roles = new HashSet<>();
			Role defaultRole = roleRepository
					.findByName(RoleType.valueOf("USER"))
					.orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
			roles.add(defaultRole);
			User newUser = User.builder()
					.email(googleUserResponse.getEmail())
					.username(googleUserResponse.getGivenName())
					.fullName(googleUserResponse.getName())
					.avatarUrl(googleUserResponse.getPicture())
					.createdDate(new Date())
					.enabled(true)
					.isActive(true)
					.roles(roles)
					.build();

			return userRepository.save(newUser);
		}
	}

	public User getUserOrCreateIfNotAdminFromFacebook(
			Optional<User> userOptional, FacebookUserRequest facebookUserRequest) {
		if (userOptional.isPresent()) {
			// User exists - return existing user
			User user = userOptional.get();

			// Check if user is enabled and active
			if (!user.getEnabled()) {
				throw new AppException(ErrorCode.USER_DISABLED);
			}

			if (!user.getIsActive()) {
				throw new AppException(ErrorCode.USER_INACTIVATED);
			}

			return user;
		} else {
			HashSet<Role> roles = new HashSet<>();
			Role defaultRole = roleRepository
					.findByName(RoleType.valueOf("USER"))
					.orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
			roles.add(defaultRole);

			User newUser = User.builder()
					.email(facebookUserRequest.getEmail())
					.username(facebookUserRequest.getEmail().split("@")[0])
					.fullName(facebookUserRequest.getName())
					.avatarUrl(facebookUserRequest.getPicture())
					.enabled(true)
					.isActive(true)
					.roles(roles)
					.build();

			return userRepository.save(newUser);
		}
	}
}
