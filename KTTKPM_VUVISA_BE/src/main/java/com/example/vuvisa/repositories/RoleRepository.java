package com.example.vuvisa.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.vuvisa.entities.Role;
import com.example.vuvisa.enums.RoleType;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {
	Optional<Role> findByName(RoleType name);
}
