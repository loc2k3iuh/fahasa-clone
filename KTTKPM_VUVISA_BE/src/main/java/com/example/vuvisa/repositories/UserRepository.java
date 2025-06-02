package com.example.vuvisa.repositories;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.vuvisa.entities.User;
import com.example.vuvisa.enums.RoleType;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	boolean existsByPhoneNumber(String phoneNumber);

	boolean existsByEmail(String email);

	boolean existsByUsername(String username);

	Optional<User> findByUsername(String username);

	@Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles r "
			+ "WHERE r.name = 'USER' "
			+ "AND u.enabled = true "
			+ "AND (:fullName IS NULL OR u.fullName LIKE CONCAT('%', :fullName, '%')) "
			+ "AND (:isActive IS NULL OR u.isActive = :isActive)")
	Page<User> searchUsers(@Param("fullName") String fullName, @Param("isActive") Boolean isActive, Pageable pageable);

	@Query(
			value = "SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles r "
					+ "WHERE r.name = 'USER' "
					+ "AND u.enabled = true "
					+ "AND (:fullName IS NULL OR u.fullName LIKE CONCAT('%', :fullName, '%')) "
					+ "AND (:isActive IS NULL OR u.isActive = :isActive)",
			countQuery = "SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r "
					+ "WHERE r.name = 'USER' "
					+ "AND u.enabled = true "
					+ "AND (:fullName IS NULL OR u.fullName LIKE CONCAT('%', :fullName, '%')) "
					+ "AND (:isActive IS NULL OR u.isActive = :isActive)")
	Page<User> searchUsersOptimized(
			@Param("fullName") String fullName, @Param("isActive") Boolean isActive, Pageable pageable);

	Optional<User> findByEmail(String email);


	List<User> findByStatus(com.example.vuvisa.enums.UserStatus status);

  Optional<User> findByPhoneNumber(String phoneNumber);

	/**
	 * Deletes users that were created more than 10 days ago and have enabled=false.
	 *
	 * @return The number of users deleted
	 */
	@Query("SELECT u FROM User u WHERE u.enabled = false AND u.createdDate < :tenDaysAgo")
	List<User> findInactiveUsersOlderThan(@Param("tenDaysAgo") Date tenDaysAgo);

	@Modifying
	@Transactional	@Query("DELETE FROM User u WHERE u.enabled = false AND u.createdDate < :tenDaysAgo")
	int deleteInactiveUsersOlderThan(@Param("tenDaysAgo") Date tenDaysAgo);


	@Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleType AND u.enabled = true AND u.isActive = true")
	List<User> findByRole(@Param("roleType") RoleType roleType);

	/**
	 * Find users by role name
	 *
	 * @param roleName the role name
	 * @return list of users with the specified role
	 */
	@Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.enabled = true AND u.isActive = true")
	List<User> findUsersByRoleName(@Param("roleName") RoleType roleName);

}
