package com.example.vuvisa.repositories;

import java.util.Optional;

import com.example.vuvisa.entities.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.vuvisa.entities.Permission;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, String> {
	Optional<Permission> findByName(String name);

    @Repository
    interface SupplierRepository extends JpaRepository<Supplier, Long> {
    }
}
