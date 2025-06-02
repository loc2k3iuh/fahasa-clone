package com.example.vuvisa.repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.vuvisa.entities.Voucher;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    boolean existsByCode(String code);

    Optional<Voucher> findByCode(String code);

    Page<Voucher> findByCodeContainingIgnoreCase(String code, Pageable pageable);

    Page<Voucher> findByDiscountNameContainingIgnoreCase(String discountName, Pageable pageable);
}