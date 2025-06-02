package com.example.vuvisa.services;

import com.example.vuvisa.dtos.requests.OfficeSupplyRequestDTO;
import com.example.vuvisa.dtos.responses.OfficeSuppliesResponseDTO;
import com.example.vuvisa.entities.OfficeSupplies;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for managing office supplies
 */
public interface OfficeSupplieService {

    /**
     * Get all office supplies
     * @return List of all office supplies
     */
    List<OfficeSupplies> getAllOfficeSupplies();

    /**
     * Get all office supplies with pagination
     * @param pageable Pagination information
     * @return Page of office supplies
     */
    Page<OfficeSuppliesResponseDTO> getAllOfficeSuppliesWithPagination(Pageable pageable);

    /**
     * Search office supplies by name with pagination
     * @param productName Name to search for
     * @param pageable Pagination information
     * @return Page of office supplies matching the search criteria
     */
    Page<OfficeSuppliesResponseDTO> searchOfficeSuppliesByName(String productName, Pageable pageable);

    /**
     * Get an office supplies by its ID
     * @param id ID of the office supplies to retrieve
     * @return The office supplies with the specified ID
     * @throws RuntimeException if the office supplies is not found
     */
    OfficeSupplies getOfficeSuppliesById(Long id);

    /**
     * Get an office supplies DTO by its ID
     * @param id ID of the office supplies to retrieve
     * @return The office supplies DTO with the specified ID
     * @throws RuntimeException if the office supplies is not found
     */
    OfficeSuppliesResponseDTO getOfficeSuppliesDTOById(Long id);

    /**
     * Convert an OfficeSupplies entity to an OfficeSuppliesResponseDTO
     * @param officeSupplies The office supplies entity to convert
     * @return The converted OfficeSuppliesResponseDTO
     */
    OfficeSuppliesResponseDTO convertToResponseDTO(OfficeSupplies officeSupplies);

    /**
     * Create a new office supplies
     * @param officeSupplyDTO The office supplies data to create
     * @return The created office supplies
     */
    OfficeSupplies createOfficeSupplies(OfficeSupplyRequestDTO officeSupplyDTO);

    /**
     * Convert an OfficeSupplyRequestDTO to an OfficeSupplies entity
     * @param dto The OfficeSupplyRequestDTO to convert
     * @return The converted OfficeSupplies entity
     */
    OfficeSupplies convertToEntity(OfficeSupplyRequestDTO dto);

    /**
     * Update an existing office supplies
     * @param id ID of the office supplies to update
     * @param dto The new office supplies data
     * @return The updated office supplies
     * @throws RuntimeException if the office supplies is not found
     */
    OfficeSupplies updateOfficeSupplies(Long id, OfficeSupplyRequestDTO dto);

    /**
     * Delete an office supplies by its ID
     * @param id ID of the office supplies to delete
     * @throws RuntimeException if the office supplies is not found
     */
    void deleteOfficeSupplies(Long id);
}