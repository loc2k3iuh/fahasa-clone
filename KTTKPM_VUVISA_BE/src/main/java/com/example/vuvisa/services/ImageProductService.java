package com.example.vuvisa.services;

import com.example.vuvisa.entities.ImageProduct;

import java.util.List;

/**
 * Service interface for managing image products
 */
public interface ImageProductService {

    /**
     * Get all image products
     * @return List of all image products
     */
    List<ImageProduct> getAllImageProducts();

    /**
     * Get an image product by its ID
     * @param id ID of the image product to retrieve
     * @return The image product with the specified ID
     * @throws RuntimeException if the image product is not found
     */
    ImageProduct getImageProductById(Long id);

    /**
     * Create a new image product
     * @param imageProduct The image product to create
     * @return The created image product
     */
    ImageProduct createImageProduct(ImageProduct imageProduct);

    /**
     * Update an existing image product
     * @param id ID of the image product to update
     * @param imageProduct The new image product data
     * @return The updated image product
     * @throws RuntimeException if the image product is not found
     */
    ImageProduct updateImageProduct(Long id, ImageProduct imageProduct);

    /**
     * Delete an image product by its ID
     * @param id ID of the image product to delete
     */
    void deleteImageProduct(Long id);
}