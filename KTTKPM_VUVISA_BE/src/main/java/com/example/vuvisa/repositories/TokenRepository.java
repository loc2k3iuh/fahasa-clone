package com.example.vuvisa.repositories;

import com.example.vuvisa.entities.Token;
import com.example.vuvisa.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {
    Optional<Token> findByRefreshToken(String refreshToken);
    Optional<Token> findByToken(String token);
    void deleteAllByUser(User user);
}
