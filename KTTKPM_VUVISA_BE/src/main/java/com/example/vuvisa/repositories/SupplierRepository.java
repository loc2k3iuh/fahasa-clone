package com.example.vuvisa.repositories;

import com.example.vuvisa.entities.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Page<Supplier> findAll(Pageable pageable);
    Page<Supplier> findByProducts_Id(Long productId, Pageable pageable);
    Page<Supplier> findBySupplierNameContainingIgnoreCase(String supplierName, Pageable pageable);
    boolean existsBySupplierName(String supplierName);
}
