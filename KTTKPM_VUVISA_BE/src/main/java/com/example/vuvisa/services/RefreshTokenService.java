package com.example.vuvisa.services;

import java.util.Optional;

import com.example.vuvisa.entities.RefreshToken;
import com.example.vuvisa.entities.User;

public interface RefreshTokenService {
	RefreshToken createRefreshToken(Long userId);

	boolean isTokenExpired(RefreshToken token);

	void deleteByToken(String token);

	Optional<RefreshToken> findByToken(String token);

	void deleteAllByUser(User user);
}
