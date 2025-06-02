package com.example.vuvisa.repositories;

import com.example.vuvisa.entities.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Page<Book> findByProductNameContainingIgnoreCase(String productName, Pageable pageable);


}
