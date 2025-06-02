package com.example.vuvisa.services.impl;

import com.example.vuvisa.dtos.requests.CreateDiscountRequest;
import com.example.vuvisa.dtos.requests.UpdateDiscountRequest;
import com.example.vuvisa.dtos.responses.DiscountResponse;
import com.example.vuvisa.entities.Discount;
import com.example.vuvisa.entities.Product;
import com.example.vuvisa.exceptions.AppException;
import com.example.vuvisa.exceptions.ErrorCode;
import com.example.vuvisa.repositories.DiscountRepository;
import com.example.vuvisa.repositories.ProductRepository;
import com.example.vuvisa.services.DiscountService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DiscountImpl implements DiscountService {

    DiscountRepository discountRepository;
    ProductRepository productRepository;

    @Override
    public DiscountResponse createDiscount(CreateDiscountRequest createDiscountRequest) throws Exception {
        log.info("Creating new discount: {}", createDiscountRequest.getDiscountName());

        // Create a new discount with empty products set
        Discount newDiscount = Discount.builder()
                .discountName(createDiscountRequest.getDiscountName())
                .discountPercentage(createDiscountRequest.getDiscountPercentage())
                .discountAmount(createDiscountRequest.getDiscountAmount())
                .startDate(createDiscountRequest.getStartDate())
                .endDate(createDiscountRequest.getEndDate())
                .products(new HashSet<>())
                .build();

        // Save the discount first to get an ID
        Discount savedDiscount = discountRepository.save(newDiscount);

        // If product IDs are provided, fetch the products and add them to the discount
        if (createDiscountRequest.getProductIds() != null && !createDiscountRequest.getProductIds().isEmpty()) {
            log.info("Adding {} products to discount", createDiscountRequest.getProductIds().size());
            Set<Product> products = new HashSet<>(productRepository.findAllById(createDiscountRequest.getProductIds()));
            savedDiscount.setProducts(products);
            savedDiscount = discountRepository.save(savedDiscount);
        }

        return DiscountResponse.fromDiscount(savedDiscount);
    }

    @Override
    public DiscountResponse getDiscountDetailsById(Long discountId) throws Exception {
        log.info("Fetching discount details for ID: {}", discountId);

        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_FOUND));

        return DiscountResponse.fromDiscount(discount);
    }

    @Override
    public Page<DiscountResponse> getAllDiscounts(Pageable pageable) {
        log.info("Fetching all discounts with pagination");

        // Ensure sorting by id ascending regardless of the provided pageable
        Pageable pageableWithSort = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            Sort.by("id").ascending()
        );

        return discountRepository.findAll(pageableWithSort)
                .map(DiscountResponse::fromDiscount);
    }

    @Override
    public Page<DiscountResponse> searchDiscountsByName(String discountName, Pageable pageable) {
        log.info("Searching discounts by name: {}", discountName);

        // Ensure sorting by id ascending regardless of the provided pageable
        Pageable pageableWithSort = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            Sort.by("id").ascending()
        );

        return discountRepository.findByDiscountNameContainingIgnoreCase(discountName, pageableWithSort)
                .map(DiscountResponse::fromDiscount);
    }

    @Override
    public void deleteDiscount(Long discountId) throws Exception {
        log.info("Deleting discount with ID: {}", discountId);

        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_FOUND));

        discountRepository.delete(discount);
    }

    @Override
    public DiscountResponse updateDiscount(Long discountId, UpdateDiscountRequest updateDiscountRequest) throws Exception {
        log.info("Updating discount ID: {}", discountId);

        Discount existingDiscount = discountRepository.findById(discountId)
                .orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_FOUND));

        // Update discount details
        existingDiscount.setDiscountName(updateDiscountRequest.getDiscountName());
        existingDiscount.setDiscountPercentage(updateDiscountRequest.getDiscountPercentage());
        existingDiscount.setDiscountAmount(updateDiscountRequest.getDiscountAmount());
        existingDiscount.setStartDate(updateDiscountRequest.getStartDate());
        existingDiscount.setEndDate(updateDiscountRequest.getEndDate());

        // Update product relationships if productIds are provided
        if (updateDiscountRequest.getProductIds() != null) {
            log.info("Updating products for discount ID {}: {} products", discountId, updateDiscountRequest.getProductIds().size());
            Set<Product> products = new HashSet<>(productRepository.findAllById(updateDiscountRequest.getProductIds()));
            existingDiscount.setProducts(products);
        }

        Discount updatedDiscount = discountRepository.save(existingDiscount);
        return DiscountResponse.fromDiscount(updatedDiscount);
    }
}
