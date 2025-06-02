package com.example.vuvisa.repositories;

import com.example.vuvisa.entities.Publisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PublisherRepository extends JpaRepository<Publisher, Long> {
    Page<Publisher> findAll(Pageable pageable);
    Page<Publisher> findByPublisherNameContainingIgnoreCase(String publisherName, Pageable pageable);
    boolean existsByPublisherName(String publisherName);
}
