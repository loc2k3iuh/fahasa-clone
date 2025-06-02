package com.example.vuvisa.services;

import com.example.vuvisa.entities.User;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface TokenService {
    void saveRefreshToken(User user, String refreshToken, String token, boolean expired, boolean revoked, LocalDateTime expirationTime);
}