package com.example.vuvisa.services.impl;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import jakarta.transaction.Transactional;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.vuvisa.entities.User;
import com.example.vuvisa.repositories.ConfirmationTokenRepository;
import com.example.vuvisa.repositories.InvalidatedTokenRepository;
import com.example.vuvisa.repositories.PasswordResetTokenRepository;
import com.example.vuvisa.repositories.RefreshTokenRepository;
import com.example.vuvisa.repositories.TokenRepository;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.services.TokenCleanupService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TokenCleanupServiceImpl implements TokenCleanupService {

	PasswordResetTokenRepository passwordResetTokenRepository;
	InvalidatedTokenRepository invalidatedTokenRepository;
	RefreshTokenRepository refreshTokenRepository;
	UserRepository userRepository;
	ConfirmationTokenRepository confirmationTokenRepository;
	TokenRepository tokenRepository;

	@Scheduled(cron = "0 0 * * * *") // chạy mỗi giờ
	public void cleanUpExpiredTokens() {
		Date now = new Date();

		// Calculate date 1 day ago for inactive users cleanup
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(now);
		calendar.add(Calendar.DAY_OF_MONTH, -1);
		Date tenDaysAgo = calendar.getTime();

		int resetDeleted = passwordResetTokenRepository.deleteByExpiryDateBefore(now);
		int invalidatedDeleted = invalidatedTokenRepository.deleteByExpiryTimeBefore(now);
		int refreshDeleted = refreshTokenRepository.deleteByExpiryDateBefore(now);

		// Find inactive users and delete their tokens before deleting the users
		List<User> inactiveUsers = userRepository.findInactiveUsersOlderThan(tenDaysAgo);
		log.info("Found {} inactive users older than {} days", inactiveUsers.size(), tenDaysAgo);
		int confirmationTokensDeleted = 0;
		int tokensDeleted = 0;
		for (User user : inactiveUsers) {
			confirmationTokenRepository.deleteAllByUserId(user.getId());
			confirmationTokensDeleted++;

			// Delete all Token entities for this user
			tokenRepository.deleteAllByUser(user);
			tokensDeleted++;
		}
		log.info("{} confirmation tokens đã bị xóa", confirmationTokensDeleted);
		log.info("{} tokens đã bị xóa", tokensDeleted);

		int inactiveUsersDeleted = userRepository.deleteInactiveUsersOlderThan(tenDaysAgo);

		System.out.println("🧹 Cleanup lúc " + now + ": "
				+ resetDeleted + " password reset token, "
				+ invalidatedDeleted + " invalidated token đã bị xóa, "
				+ refreshDeleted + " refresh token đã bị xóa, "
				+ confirmationTokensDeleted + " confirmation tokens đã bị xóa, "
				+ inactiveUsersDeleted + " disabled users đã bị xóa.");
	}
}
