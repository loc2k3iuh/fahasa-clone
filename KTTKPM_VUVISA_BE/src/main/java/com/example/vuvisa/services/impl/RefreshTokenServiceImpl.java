package com.example.vuvisa.services.impl;

import java.util.Calendar;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.vuvisa.entities.RefreshToken;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.exceptions.AppException;
import com.example.vuvisa.exceptions.ErrorCode;
import com.example.vuvisa.repositories.RefreshTokenRepository;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.services.RefreshTokenService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RefreshTokenServiceImpl implements RefreshTokenService {

	RefreshTokenRepository refreshTokenRepository;
	UserRepository userRepository;

	@NonFinal
	@Value("${jwt.refresh-token.valid-duration}")
	protected long refreshTokenDurationSec;

	@Override
	public RefreshToken createRefreshToken(Long userId) {
		RefreshToken refreshToken = new RefreshToken();
		refreshToken.setUser(
				userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)));

		Calendar calendar = Calendar.getInstance();
		calendar.add(Calendar.SECOND, (int) refreshTokenDurationSec);
		refreshToken.setExpiryDate(calendar.getTime());
		refreshToken.setToken(UUID.randomUUID().toString());
		return refreshTokenRepository.save(refreshToken);
	}

	@Override
	public boolean isTokenExpired(RefreshToken token) {
		return token.getExpiryDate().before(new Date());
	}

	@Override
	public void deleteByToken(String token) {
		refreshTokenRepository.deleteByToken(token);
	}

	@Override
	public Optional<RefreshToken> findByToken(String token) {
		return refreshTokenRepository.findByToken(token);
	}

	@Override
	public void deleteAllByUser(User user) {
		refreshTokenRepository.deleteAllByUser(user);
	}
}
