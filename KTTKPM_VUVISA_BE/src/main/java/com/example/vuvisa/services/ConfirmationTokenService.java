package com.example.vuvisa.services;

import java.util.Optional;

import com.example.vuvisa.entities.ConfirmationToken;
import com.example.vuvisa.entities.User;

public interface ConfirmationTokenService {
	Optional<ConfirmationToken> getToken(String token);

	void saveToken(ConfirmationToken token);

	void setConfirmedAt(String token);

	public void deleteTokensByUser(User user);
}
