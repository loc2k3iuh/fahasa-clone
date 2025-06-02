package com.example.vuvisa.services.impl;

import java.text.ParseException;
import java.util.Date;
import java.util.UUID;

import com.example.vuvisa.events.EventPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.vuvisa.dtos.requests.*;
import com.example.vuvisa.dtos.responses.AuthenticationResponse;
import com.example.vuvisa.dtos.responses.IntrospectResponse;
import com.example.vuvisa.dtos.responses.TokenResponse;
import com.example.vuvisa.entities.*;
import com.example.vuvisa.exceptions.AppException;
import com.example.vuvisa.exceptions.ErrorCode;
import com.example.vuvisa.repositories.InvalidatedTokenRepository;
import com.example.vuvisa.repositories.PasswordResetTokenRepository;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.services.*;
import com.nimbusds.jose.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationServiceImpl implements AuthenticationService {

	PasswordResetTokenRepository tokenRepository;
	EmailService emailService;
	UserRepository userRepository;
	InvalidatedTokenRepository invalidatedTokenRepository;
	JwtService jwtService;
	RefreshTokenService refreshTokenService;
	OutboundIdentityService outboundIdentityService;

	@Autowired
	private EventPublisher eventPublisher;

	private boolean isGmailAddress(String email) {
		// Regex kiểm tra email kết thúc bằng @gmail.com (không phân biệt chữ hoa thường)
		String regex = "^[a-zA-Z0-9._%+-]+@gmail\\.com$";
		return email != null && email.matches(regex);
	}

	@Override
	public AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest, boolean flap)
			throws Exception {
		var user = new User();
		if (!isGmailAddress(authenticationRequest.getUsername())) {
			user = userRepository
					.findByUsername(authenticationRequest.getUsername())
					.orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
		} else {
			user = userRepository
					.findByEmail(authenticationRequest.getUsername())
					.orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
		}

		PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
		if (!passwordEncoder.matches(authenticationRequest.getPassword(), user.getPassword())) {
			throw new AppException(ErrorCode.UNAUTHENTICATED);
		}

		if (!user.getEnabled()) {
			throw new AppException(ErrorCode.USER_DISABLED);
		}

		if (!user.getIsActive()) {
			throw new AppException(ErrorCode.USER_INACTIVATED);
		}

		String accessToken = jwtService.generateToken(user);
		AuthenticationResponse authenticationResponse;
		if (flap) {
			RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
			authenticationResponse = AuthenticationResponse.builder()
					.authenticated(true)
					.token(accessToken)
					.refreshToken(refreshToken.getToken())
					.build();
		} else {
			authenticationResponse = AuthenticationResponse.builder()
					.authenticated(true)
					.token(accessToken)
					.build();
		}
		return authenticationResponse;
	}

	@Override
	public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
		var token = request.getToken();
		boolean isValid = true;

		try {
			jwtService.verifyToken(token);
		} catch (AppException e) {
			isValid = false;
		}

		return IntrospectResponse.builder().valid(isValid).build();
	}

	@Override
	@Transactional
	public void logout(LogoutRequest logoutRequest, String refreshToken) throws ParseException, JOSEException {

		try {
			// Xử lý token truy cập (access token)
			var signToken = jwtService.verifyToken(logoutRequest.getToken());
			String jit = signToken.getJWTClaimsSet().getJWTID();
			Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

			InvalidatedToken invalidatedToken =
					InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

			invalidatedTokenRepository.save(invalidatedToken);

			if (refreshToken != null) {
				refreshTokenService.deleteByToken(refreshToken);
			}

		} catch (AppException e) {
			throw new AppException(ErrorCode.UNAUTHENTICATED);
		}
	}

	@Override
	public TokenResponse refreshAccessToken(RefreshRequest refreshRequest) throws JOSEException {
		RefreshToken refreshToken = refreshTokenService
				.findByToken(refreshRequest.getRefreshToken())
				.orElseThrow(() -> new AppException(ErrorCode.REFRESH_TOKEN_INVALID));

		if (refreshTokenService.isTokenExpired(refreshToken)) {
			refreshTokenService.deleteByToken(refreshRequest.getRefreshToken());
			throw new AppException(ErrorCode.REFRESH_TOKEN_EXPIRED);
		}
		return TokenResponse.builder()
				.token(jwtService.generateToken(refreshToken.getUser()))
				.build();
	}

	@Override
	public void sendResetToken(SendMailResetPasswordRequest sendMailResetPasswordRequest) {
		User user = userRepository
				.findByEmail(sendMailResetPasswordRequest.getEmail())
				.orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));
		if (!user.getIsActive()) {
			throw new AppException(ErrorCode.USER_INACTIVATED);
		}
		String token = UUID.randomUUID().toString();
		PasswordResetToken resetToken = new PasswordResetToken(token, user);
		tokenRepository.save(resetToken);
		String link;
		if (sendMailResetPasswordRequest.isAdmin()) {
			link = "http://localhost:8888/admin/forgot-password/change?token=" + token;
		} else {
			link = "http://localhost:5173/user/forgot-password/change?token=" + token;
		}
		emailService.sendEmail(sendMailResetPasswordRequest.getEmail(), link);
	}

	@Override
	@Transactional
	public void resetPassword(ResetPasswordRequest resetPasswordRequest) {
		PasswordResetToken resetToken = tokenRepository
				.findByToken(resetPasswordRequest.getToken())
				.orElseThrow(() -> new AppException(ErrorCode.TOKEN_NOT_FOUND));

		if (!resetPasswordRequest.getNewPassword().equalsIgnoreCase(resetPasswordRequest.getConfirmPassword())) {
			throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
		}
		User user = resetToken.getUser();
		PasswordEncoder encoder = new BCryptPasswordEncoder(10);
		String encodedPassword = encoder.encode(resetPasswordRequest.getNewPassword());
		user.setPassword(encodedPassword);
		userRepository.save(user);

		eventPublisher.publishSystemNotificationEvent("Thay đổi mật khẩu", "Tài khoản bạn vừa thực hiện thay đổi mật khẩu.", user);

		tokenRepository.deleteByUserId(user.getId());
	}

	@Override
	@Transactional
	public void changePassword(Long id, ChangePasswordRequest changePasswordRequest) throws Exception {
		var user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
		PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
		boolean isAuthenticated = passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword());
		if (!isAuthenticated) {
			throw new AppException(ErrorCode.UNAUTHENTICATED);
		}
		if (!user.getIsActive()) {
			throw new AppException(ErrorCode.USER_INACTIVATED);
		}
		if (!changePasswordRequest.getNewPassword().equalsIgnoreCase(changePasswordRequest.getConfirmPassword())) {
			throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
		}
		String encodedPassword = passwordEncoder.encode(changePasswordRequest.getNewPassword());
		user.setPassword(encodedPassword);
		userRepository.save(user);
	}

	@Override
	public AuthenticationResponse outboundGoogleAuthentication(String code) throws JOSEException {
		return outboundIdentityService.authenticateWithGoogle(code);
	}

	@Override
	public AuthenticationResponse outboundFacebookAuthentication(FacebookUserRequest facebookUserRequest)
			throws JOSEException {
		return outboundIdentityService.authenticateWithFacebook(facebookUserRequest);
	}
}
