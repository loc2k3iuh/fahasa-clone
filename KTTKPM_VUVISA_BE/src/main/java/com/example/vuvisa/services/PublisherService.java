package com.example.vuvisa.services;

import com.example.vuvisa.dtos.requests.CreatePublisherRequest;
import com.example.vuvisa.dtos.requests.UpdatePublisherRequest;
import com.example.vuvisa.dtos.responses.PublisherResponse;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service interface for managing publishers
 */
public interface PublisherService {

    /**
     * Get all publishers
     * @return List of all publishers as PublisherResponse
     */
    Page<PublisherResponse> getAllPublishersByPage(int page);

    /**
     * Get a publisher by its ID
     * @param id ID of the publisher to retrieve
     * @return The publisher with the specified ID as PublisherResponse
     * @throws RuntimeException if the publisher is not found
     */
    PublisherResponse getPublisherById(Long id);

    /**
     * Create a new publisher
     * @param request The publisher data to create
     * @return The created publisher as PublisherResponse
     * @throws RuntimeException if a publisher with the same name already exists
     */
    @Transactional
    PublisherResponse createPublisher(CreatePublisherRequest request);

    /**
     * Update an existing publisher
     * @param id ID of the publisher to update
     * @param request The updated publisher data
     * @return The updated publisher as PublisherResponse
     * @throws RuntimeException if the publisher is not found
     */
    @Transactional
    PublisherResponse updatePublisher(Long id, UpdatePublisherRequest request);

    /**
     * Delete a publisher
     * @param id ID of the publisher to delete
     * @throws RuntimeException if the publisher is not found
     */
    @Transactional
    void deletePublisher(Long id);

    /**
     * Search publishers by name
     * @param name Name to search for
     * @param page Page number
     * @return Page of publishers matching the search criteria
     */
    Page<PublisherResponse> searchPublisherByName(String name, int page);
}
