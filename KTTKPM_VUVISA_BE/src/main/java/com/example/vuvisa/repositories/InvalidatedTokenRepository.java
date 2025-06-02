package com.example.vuvisa.repositories;

import java.util.Date;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.vuvisa.entities.InvalidatedToken;

public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
	boolean existsById(String id);

	int deleteByExpiryTimeBefore(Date now);
}
