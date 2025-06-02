package com.example.vuvisa.controllers;

import java.text.ParseException;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.*;
import com.example.vuvisa.dtos.responses.AuthenticationResponse;
import com.example.vuvisa.dtos.responses.IntrospectResponse;
import com.example.vuvisa.dtos.responses.TokenResponse;
import com.example.vuvisa.services.AuthenticationService;
import com.nimbusds.jose.JOSEException;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/users/auth")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

	AuthenticationService authenticationService;

	@GetMapping("/ping")
	public String ping() {
		return "pong";
	}

		@PostMapping("/outbound-google/authentication")
	public APIResponse<TokenResponse> outboundGoogleAuthentication(
			@RequestParam("code") String code, HttpServletResponse response) throws JOSEException {
		AuthenticationResponse authenticationResponse = authenticationService.outboundGoogleAuthentication(code);
		createCookie(response, authenticationResponse);
		return APIResponse.<TokenResponse>builder()
				.result(TokenResponse.builder()
						.token(authenticationResponse.getToken())
						.build())
				.message("Login successfully!")
				.build();
	}

	@PostMapping("/outbound-facebook/authentication")
	public APIResponse<TokenResponse> outboundFacebookAuthentication(
			@RequestBody @Valid FacebookUserRequest facebookUserRequest, HttpServletResponse response)
			throws JOSEException {
		AuthenticationResponse authenticationResponse =
				authenticationService.outboundFacebookAuthentication(facebookUserRequest);
		createCookie(response, authenticationResponse);
		return APIResponse.<TokenResponse>builder()
				.result(TokenResponse.builder()
						.token(authenticationResponse.getToken())
						.build())
				.message("Login successfully!")
				.build();
	}

	private void createCookie(HttpServletResponse response, AuthenticationResponse authenticationResponse) {
		String refreshToken = authenticationResponse.getRefreshToken();
		Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
		refreshCookie.setHttpOnly(true);
		refreshCookie.setSecure(true);
		refreshCookie.setPath("/");
		refreshCookie.setMaxAge(60 * 60 * 24 * 30);
		response.addCookie(refreshCookie);
	}

	@PostMapping("/introspect")
	public APIResponse<IntrospectResponse> authenticate(@RequestBody @Valid IntrospectRequest request)
			throws ParseException, JOSEException {
		var result = authenticationService.introspect(request);
		return APIResponse.<IntrospectResponse>builder().result(result).build();
	}

	@PostMapping("/login")
	public APIResponse<TokenResponse> login(
			@RequestBody @Valid AuthenticationRequest authenticationRequest, HttpServletResponse response)
			throws Exception {
		AuthenticationResponse authenticationResponse = authenticationService.authenticate(authenticationRequest, true);
		createCookie(response, authenticationResponse);
		return APIResponse.<TokenResponse>builder()
				.result(TokenResponse.builder()
						.token(authenticationResponse.getToken())
						.build())
				.message("Login successfully!")
				.build();
	}

	@PostMapping("/login-temporarily")
	public APIResponse<TokenResponse> loginTemporarily(@RequestBody @Valid AuthenticationRequest authenticationRequest)
			throws Exception {
		AuthenticationResponse authenticationResponse =
				authenticationService.authenticate(authenticationRequest, false);
		return APIResponse.<TokenResponse>builder()
				.result(TokenResponse.builder()
						.token(authenticationResponse.getToken())
						.build())
				.message("Login successfully!")
				.build();
	}

	@PostMapping("/refresh-token")
	public APIResponse<TokenResponse> refreshToken(
			@CookieValue(name = "refresh_token", required = false) String refreshToken) throws JOSEException {
		if (refreshToken == null || refreshToken.isEmpty()) {
			throw new com.example.vuvisa.exceptions.AppException(
					com.example.vuvisa.exceptions.ErrorCode.REFRESH_TOKEN_INVALID);
		}
		RefreshRequest refreshRequest =
				RefreshRequest.builder().refreshToken(refreshToken).build();
		TokenResponse response = authenticationService.refreshAccessToken(refreshRequest);
		return APIResponse.<TokenResponse>builder()
				.result(response)
				.message("Access token refreshed!")
				.build();
	}

	@PostMapping("/logout")
	public ResponseEntity<APIResponse<Void>> logout(
			@RequestBody @Valid LogoutRequest logoutRequest,
			@CookieValue(name = "refresh_token", required = false) String refreshToken)
			throws Exception {

		ResponseCookie deleteCookie = ResponseCookie.from("refresh_token", "")
				.httpOnly(true)
				.secure(true) // Nếu dùng HTTPS
				.path("/")
				.maxAge(0) // xoá liền
				.build();

		authenticationService.logout(logoutRequest, refreshToken);
		return ResponseEntity.ok()
				.header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
				.body(APIResponse.<Void>builder()
						.message("User logged out successfully !")
						.build());
	}

	@PostMapping("/forgot-password")
	public APIResponse<Void> forgotPassword(
			@RequestBody @Valid SendMailResetPasswordRequest sendMailResetPasswordRequest) {
		authenticationService.sendResetToken(sendMailResetPasswordRequest);
		return APIResponse.<Void>builder()
				.message("Password reset email has been sent !")
				.build();
	}

	@PostMapping("/reset-password")
	public APIResponse<Void> resetPassword(@RequestBody @Valid ResetPasswordRequest resetPasswordRequest)
			throws Exception {
		authenticationService.resetPassword(resetPasswordRequest);
		return APIResponse.<Void>builder()
				.message("Password was reset successfully !")
				.build();
	}

	@PostMapping("/change-password/{userId}")
	public APIResponse<Void> changePassword(
			@PathVariable Long userId, @RequestBody @Valid ChangePasswordRequest changePasswordRequest)
			throws Exception {
		authenticationService.changePassword(userId, changePasswordRequest);
		return APIResponse.<Void>builder()
				.message("Password was changed successfully !")
				.build();
	}
}