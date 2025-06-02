package com.example.vuvisa.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.vuvisa.dtos.requests.CreateDiscountRequest;
import com.example.vuvisa.dtos.requests.UpdateDiscountRequest;
import com.example.vuvisa.dtos.responses.DiscountResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DiscountService {

    /**
     * Creates a new Discount based on the provided request.
     *
     * @param createDiscountRequest The DTO containing discount creation details.
     * @return DiscountResponse containing the details of the created discount.
     * @throws Exception if any error occurs during the operation.
     */
    DiscountResponse createDiscount(CreateDiscountRequest createDiscountRequest) throws Exception;

    /**
     * Retrieves discount details by its unique identifier.
     *
     * @param discountId The ID of the discount.
     * @return DiscountResponse containing the details of the discount.
     * @throws Exception if the discount is not found.
     */
    DiscountResponse getDiscountDetailsById(Long discountId) throws Exception;

    /**
     * Retrieves a paginated list of all discounts.
     *
     * @param pageable The paging and sorting information.
     * @return A Page of DiscountResponse containing all discounts.
     */
    Page<DiscountResponse> getAllDiscounts(Pageable pageable);

    /**
     * Searches discounts by their name with pagination.
     *
     * @param discountName The name to search for.
     * @param pageable     The paging and sorting information.
     * @return A Page of DiscountResponse containing matching discounts.
     */
    Page<DiscountResponse> searchDiscountsByName(String discountName, Pageable pageable);

    /**
     * Deletes a discount by its ID.
     *
     * @param discountId The ID of the discount to be deleted.
     * @throws Exception if the discount is not found.
     */
    void deleteDiscount(Long discountId) throws Exception;

    /**
     * Updates an existing discount with new data.
     *
     * @param discountId           The ID of the discount to be updated.
     * @param updateDiscountRequest The DTO containing updated discount details.
     * @return DiscountResponse containing the updated discount details.
     * @throws Exception if the discount is not found or validation fails.
     */
    DiscountResponse updateDiscount(Long discountId, UpdateDiscountRequest updateDiscountRequest) throws Exception;
}