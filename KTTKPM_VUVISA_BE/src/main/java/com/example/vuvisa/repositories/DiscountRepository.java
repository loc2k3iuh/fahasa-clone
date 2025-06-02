package com.example.vuvisa.repositories;

import com.example.vuvisa.entities.Discount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Range;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long> {
    Page<Discount> findByDiscountNameContainingIgnoreCase(String discountName, Pageable pageable);
}