package com.example.vuvisa.services.impl;

import java.util.Date;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.vuvisa.entities.ConfirmationToken;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.repositories.ConfirmationTokenRepository;
import com.example.vuvisa.services.ConfirmationTokenService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConfirmationTokenServiceImpl implements ConfirmationTokenService {

	ConfirmationTokenRepository confirmationTokenRepository;

	// Implementation of the methods defined in ConfirmationTokenService interface
	@Override
	public Optional<ConfirmationToken> getToken(String token) {
		return confirmationTokenRepository.findByToken(token);
	}

	@Override
	public void saveToken(ConfirmationToken token) {
		confirmationTokenRepository.save(token);
	}

	@Override
	public void setConfirmedAt(String token) {
		ConfirmationToken t = getToken(token).orElseThrow();
		t.setConfirmedAt(new Date());
		confirmationTokenRepository.save(t);
	}

	@Override
	public void deleteTokensByUser(User user) {
		confirmationTokenRepository.deleteAllByUser(user);
	}
}