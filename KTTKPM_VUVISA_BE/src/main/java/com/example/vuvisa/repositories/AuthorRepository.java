package com.example.vuvisa.repositories;

import com.example.vuvisa.entities.Author;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthorRepository extends JpaRepository<Author,Long> {
    Page<Author> findAll(Pageable pageable);
    Page<Author> findByBooks_Id(Long bookId, Pageable pageable);
    Page<Author> findByAuthorNameContainingIgnoreCase(String authorName, Pageable pageable);
    boolean existsByAuthorName(String authorName);
}
