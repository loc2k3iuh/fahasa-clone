package com.example.vuvisa.controllers;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.CreateDiscountRequest;
import com.example.vuvisa.dtos.requests.UpdateDiscountRequest;
import com.example.vuvisa.dtos.responses.DiscountResponse;
import com.example.vuvisa.services.DiscountService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/discounts")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DiscountController {

    DiscountService discountService;

    /**
     * Create a new discount.
     */
    @PostMapping("")
    public APIResponse<DiscountResponse> createDiscount(@Valid @RequestBody CreateDiscountRequest createDiscountRequest) throws Exception {
        log.info("Creating a new discount");
        return APIResponse.<DiscountResponse>builder()
                .result(discountService.createDiscount(createDiscountRequest))
                .message("Discount created successfully")
                .build();
    }

    /**
     * Get discount details by ID.
     */
    @GetMapping("/{id}")
    public APIResponse<DiscountResponse> getDiscountDetailsById(@PathVariable Long id) throws Exception {
        log.info("Retrieving discount details for ID: {}", id);
        return APIResponse.<DiscountResponse>builder()
                .result(discountService.getDiscountDetailsById(id))
                .message("Discount retrieved successfully")
                .build();
    }

    /**
     * Get all discounts with pagination.
     */
    @GetMapping("")
    public APIResponse<Page<DiscountResponse>> getAllDiscounts(Pageable pageable) {
        log.info("Retrieving all discounts with pagination");
        return APIResponse.<Page<DiscountResponse>>builder()
                .result(discountService.getAllDiscounts(pageable))
                .message("Discounts retrieved successfully")
                .build();
    }

    /**
     * Search discounts by name with pagination.
     */
    @GetMapping("/search")
    public APIResponse<Page<DiscountResponse>> searchDiscountsByName(
            @RequestParam("name") String discountName,
            Pageable pageable) {
        log.info("Searching discounts by name: {}", discountName);
        return APIResponse.<Page<DiscountResponse>>builder()
                .result(discountService.searchDiscountsByName(discountName, pageable))
                .message("Discounts retrieved successfully")
                .build();
    }

    /**
     * Update an existing discount by ID.
     */
    @PutMapping("/{id}")
    public APIResponse<DiscountResponse> updateDiscount(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDiscountRequest updateDiscountRequest) throws Exception {
        log.info("Updating discount with ID: {}", id);
        return APIResponse.<DiscountResponse>builder()
                .result(discountService.updateDiscount(id, updateDiscountRequest))
                .message("Discount updated successfully")
                .build();
    }

    /**
     * Delete a discount by ID.
     */
    @DeleteMapping("/delete/{id}")
    public APIResponse<String> deleteDiscount(@PathVariable Long id) throws Exception {
        log.info("Deleting discount with ID: {}", id);
        discountService.deleteDiscount(id);
        return APIResponse.<String>builder()
                .message("Discount deleted successfully")
                .build();
    }
}