package com.example.vuvisa.repositories;

import com.example.vuvisa.entities.Book;
import com.example.vuvisa.entities.ImageProduct;
import com.example.vuvisa.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageProductRepository extends JpaRepository<ImageProduct, Long> {
    List<ImageProduct> findByProduct(Product product);
}