package com.example.vuvisa.repositories;

import com.example.vuvisa.entities.OfficeSupplies;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfficeSupplieRepository extends JpaRepository<OfficeSupplies, Long> {

    Page<OfficeSupplies> findByProductNameContainingIgnoreCase(String productName, Pageable pageable);

}
