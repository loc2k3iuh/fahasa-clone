package com.example.vuvisa.controllers;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.CreateVoucherRequest;
import com.example.vuvisa.dtos.requests.UpdateVoucherRequest;
import com.example.vuvisa.dtos.responses.VoucherResponse;
import com.example.vuvisa.services.VoucherService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/vouchers")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VoucherController {

    VoucherService voucherService;

    /**
     * Create a new voucher.
     */
    @PostMapping("")
    public APIResponse<VoucherResponse> createVoucher(@Valid @RequestBody CreateVoucherRequest createVoucherRequest) throws Exception {
        log.info("Creating a new voucher");
        return APIResponse.<VoucherResponse>builder()
                .result(voucherService.createVoucher(createVoucherRequest))
                .message("Voucher created successfully")
                .build();
    }

    /**
     * Get voucher details by ID.
     */
    @GetMapping("/{id}")
    public APIResponse<VoucherResponse> getVoucherDetailsById(@PathVariable Long id) throws Exception {
        log.info("Retrieving voucher details for ID: {}", id);
        return APIResponse.<VoucherResponse>builder()
                .result(voucherService.getVoucherDetailsById(id))
                .message("Voucher retrieved successfully")
                .build();
    }

    /**
     * Get all vouchers with pagination.
     */
    @GetMapping("")
    public APIResponse<Page<VoucherResponse>> getAllVouchers(Pageable pageable) {
        log.info("Retrieving all vouchers with pagination");
        return APIResponse.<Page<VoucherResponse>>builder()
                .result(voucherService.getAllVouchers(pageable))
                .message("Vouchers retrieved successfully")
                .build();
    }

    /**
     * Search vouchers by name with pagination.
     */
    @GetMapping("/search-name")
    public APIResponse<Page<VoucherResponse>> searchVouchersByName(
            @RequestParam("name") String voucherName,
            Pageable pageable) {
        log.info("Searching vouchers by name: {}", voucherName);
        return APIResponse.<Page<VoucherResponse>>builder()
                .result(voucherService.searchVouchersByName(voucherName, pageable))
                .message("Vouchers retrieved successfully")
                .build();
    }

    /**
     * Search vouchers by name with pagination.
     */
    @GetMapping("/search-code")
    public APIResponse<Page<VoucherResponse>> searchVouchersByCode(
            @RequestParam("name") String voucherCode,
            Pageable pageable) {
        log.info("Searching vouchers by name: {}", voucherCode);
        return APIResponse.<Page<VoucherResponse>>builder()
                .result(voucherService.searchVouchersByCode(voucherCode, pageable))
                .message("Vouchers retrieved successfully")
                .build();
    }

    /**
     * Get 5 random vouchers.
     */
    @GetMapping("/random")
    public APIResponse<List<VoucherResponse>> getRandomVouchers() {
        log.info("Retrieving 5 random vouchers");
        return APIResponse.<List<VoucherResponse>>builder()
                .result(voucherService.getRandomVouchers(5))
                .message("Random vouchers retrieved successfully")
                .build();
    }

    /**
     * Update an existing voucher by ID.
     */
    @PutMapping("/{id}")
    public APIResponse<VoucherResponse> updateVoucher(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVoucherRequest updateVoucherRequest) throws Exception {
        log.info("Updating voucher with ID: {}", id);
        return APIResponse.<VoucherResponse>builder()
                .result(voucherService.updateVoucher(id, updateVoucherRequest))
                .message("Voucher updated successfully")
                .build();
    }

    /**
     * Delete a voucher by ID.
     */
    @DeleteMapping("/delete/{id}")
    public APIResponse<String> deleteVoucher(@PathVariable Long id) throws Exception {
        log.info("Deleting voucher with ID: {}", id);
        voucherService.deleteVoucher(id);
        return APIResponse.<String>builder()
                .message("Voucher deleted successfully")
                .build();
    }
}
