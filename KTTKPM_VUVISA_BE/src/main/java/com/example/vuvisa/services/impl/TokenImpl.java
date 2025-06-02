package com.example.vuvisa.services.impl;

import com.example.vuvisa.entities.Token;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.repositories.TokenRepository;
import com.example.vuvisa.services.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class TokenImpl implements TokenService {

    private final TokenRepository tokenRepository;

    @Override
    public void saveRefreshToken(User user, String refreshToken, String token, boolean expired, boolean revoked, LocalDateTime expirationTime) {
        Token tokenEntity = Token.builder()
                .user(user)   // assuming userId is a long, otherwise adjust type
                .refreshToken(refreshToken)
                .token(token)
                .expired(expired)
                .revoked(revoked)
                .expirationDate(expirationTime)
                .build();

        tokenRepository.save(tokenEntity);
    }
}