package com.example.vuvisa.repositories;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.vuvisa.entities.RefreshToken;
import com.example.vuvisa.entities.User;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

	Optional<RefreshToken> findByUser(User user);

	Optional<RefreshToken> findByToken(String token);

	List<RefreshToken> findAllByUser(User user);

	void deleteByToken(String token);

	void deleteAllByUser(User user);
	/**
	 * Deletes all refresh tokens that have an expiry date before the specified date.
	 *
	 * @param now the date to compare against
	 * @return the number of tokens deleted
	 */
	int deleteByExpiryDateBefore(Date now);
}
