package com.example.vuvisa.services;

import com.example.vuvisa.dtos.requests.CreateSupplierRequest;
import com.example.vuvisa.dtos.requests.UpdateSupplierRequest;
import com.example.vuvisa.dtos.responses.SupplierResponse;
import com.example.vuvisa.entities.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service interface for managing suppliers
 */
public interface SupplierService {

    /**
     * Get all suppliers
     * @return List of all suppliers as SupplierResponse
     */
    Page<SupplierResponse> getAllSuppliersByPage(int page);

    List<Supplier> getAllSupplier();

    /**
     * Get a supplier by its ID
     * @param id ID of the supplier to retrieve
     * @return The supplier with the specified ID as SupplierResponse
     * @throws RuntimeException if the supplier is not found
     */
    SupplierResponse getSupplierById(Long id);

    /**
     * Create a new supplier
     * @param request The supplier data to create
     * @return The created supplier as SupplierResponse
     * @throws RuntimeException if a supplier with the same name already exists
     */
    @Transactional
    SupplierResponse createSupplier(CreateSupplierRequest request);

    /**
     * Update an existing supplier
     * @param id ID of the supplier to update
     * @param request The updated supplier data
     * @return The updated supplier as SupplierResponse
     * @throws RuntimeException if the supplier is not found
     */
    @Transactional
    SupplierResponse updateSupplier(Long id, UpdateSupplierRequest request);

    /**
     * Delete a supplier
     * @param id ID of the supplier to delete
     * @throws RuntimeException if the supplier is not found
     */
    @Transactional
    void deleteSupplier(Long id);

    /**
     * Get suppliers by product ID
     * @param productId ID of the product
     * @param page Page number
     * @return Page of suppliers associated with the product
     */
    Page<SupplierResponse> getSuppliersByProductId(long productId, int page);

    /**
     * Search suppliers by name
     * @param name Name to search for
     * @param page Page number
     * @return Page of suppliers matching the search criteria
     */
    Page<SupplierResponse> searchSupplierByName(String name, int page);
}
