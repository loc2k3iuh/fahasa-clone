package com.example.vuvisa.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.vuvisa.entities.ConfirmationToken;
import com.example.vuvisa.entities.User;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface ConfirmationTokenRepository extends JpaRepository<ConfirmationToken, Long> {
	Optional<ConfirmationToken> findByToken(String token);

	@Modifying
	@Transactional
	void deleteAllByUser(User user);


	@Modifying
	@Query("DELETE FROM ConfirmationToken t WHERE t.user.id = :userId")
	void deleteAllByUserId(@Param("userId") Long userId);
}
