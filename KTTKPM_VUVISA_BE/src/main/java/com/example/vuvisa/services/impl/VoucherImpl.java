package com.example.vuvisa.services.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.vuvisa.dtos.requests.CreateVoucherRequest;
import com.example.vuvisa.dtos.requests.UpdateVoucherRequest;
import com.example.vuvisa.dtos.responses.VoucherResponse;
import com.example.vuvisa.entities.Voucher;
import com.example.vuvisa.exceptions.AppException;
import com.example.vuvisa.exceptions.ErrorCode;
import com.example.vuvisa.repositories.VoucherRepository;
import com.example.vuvisa.services.VoucherService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VoucherImpl implements VoucherService {

    VoucherRepository voucherRepository;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    @Override
    public VoucherResponse createVoucher(CreateVoucherRequest createVoucherRequest) throws Exception {
        if (voucherRepository.existsByCode(createVoucherRequest.getCode())) {
            throw new AppException(ErrorCode.VOUCHER_CODE_ALREADY_EXISTS);
        }

        Voucher newVoucher = Voucher.builder()
                .code(createVoucherRequest.getCode())
                .discountName(createVoucherRequest.getDiscountName())
                .discountPercentage(createVoucherRequest.getDiscountPercentage())
                .discountAmount(createVoucherRequest.getDiscountAmount())
                .minOrderValue(createVoucherRequest.getMinOrderValue())
                .maxUses(createVoucherRequest.getMaxUses().doubleValue())
                .startDate(createVoucherRequest.getStartDate())
                .endDate(createVoucherRequest.getEndDate())
                .build();

        voucherRepository.save(newVoucher);

        return VoucherResponse.fromVoucher(newVoucher);
    }

    @Override
    public VoucherResponse getVoucherDetailsById(Long voucherId) throws Exception {
        Voucher voucher =
                voucherRepository.findById(voucherId).orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        return VoucherResponse.fromVoucher(voucher);
    }

    @Override
    public VoucherResponse getVoucherDetailsByCode(String code) throws Exception {
        Voucher voucher =
                voucherRepository.findByCode(code).orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        return VoucherResponse.fromVoucher(voucher);
    }

    @Override
    public Page<VoucherResponse> getAllVouchers(Pageable pageable) {
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.ASC, "id")
        );
        return voucherRepository.findAll(sortedPageable).map(VoucherResponse::fromVoucher);
    }

    @Override
    public Page<VoucherResponse> searchVouchersByCode(String code, Pageable pageable) {
        return voucherRepository.findByCodeContainingIgnoreCase(code, pageable).map(VoucherResponse::fromVoucher);
    }

    @Override
    public void deleteVoucher(Long voucherId) throws Exception {
        Voucher voucher =
                voucherRepository.findById(voucherId).orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        voucherRepository.delete(voucher);
    }

    @Override
    public VoucherResponse updateVoucher(Long voucherId, UpdateVoucherRequest updateVoucherRequest) throws Exception {
        Voucher existingVoucher =
                voucherRepository.findById(voucherId).orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        // Check for changes in code and validate uniqueness
        String newCode = updateVoucherRequest.getCode();
        if (!existingVoucher.getCode().equals(newCode) && voucherRepository.existsByCode(newCode)) {
            throw new AppException(ErrorCode.VOUCHER_CODE_ALREADY_EXISTS);
        }

        // Update voucher details from DTO
        existingVoucher.setCode(newCode);
        existingVoucher.setDiscountName(updateVoucherRequest.getDiscountName());
        existingVoucher.setDiscountPercentage(updateVoucherRequest.getDiscountPercentage());
        existingVoucher.setDiscountAmount(updateVoucherRequest.getDiscountAmount());
        existingVoucher.setMinOrderValue(updateVoucherRequest.getMinOrderValue());
        existingVoucher.setMaxUses(updateVoucherRequest.getMaxUses().doubleValue());
        existingVoucher.setStartDate(updateVoucherRequest.getStartDate());
        existingVoucher.setEndDate(updateVoucherRequest.getEndDate());

        voucherRepository.save(existingVoucher);

        return VoucherResponse.fromVoucher(existingVoucher);
    }

    @Override
    public Page<VoucherResponse> searchVouchersByName(String voucherName, Pageable pageable) {
        return voucherRepository
                .findByDiscountNameContainingIgnoreCase(voucherName, pageable)
                .map(VoucherResponse::fromVoucher);
    }

    @Override
    public List<VoucherResponse> getRandomVouchers(int count) {
        // Get all vouchers
        List<Voucher> allVouchers = voucherRepository.findAll();

        // If there are fewer vouchers than requested, return all of them
        if (allVouchers.size() <= count) {
            return allVouchers.stream()
                    .map(VoucherResponse::fromVoucher)
                    .collect(Collectors.toList());
        }

        // Shuffle the list to get random vouchers
        List<Voucher> randomVouchers = new ArrayList<>(allVouchers);
        Collections.shuffle(randomVouchers);

        // Return the first 'count' vouchers
        return randomVouchers.stream()
                .limit(count)
                .map(VoucherResponse::fromVoucher)
                .collect(Collectors.toList());
    }
}
