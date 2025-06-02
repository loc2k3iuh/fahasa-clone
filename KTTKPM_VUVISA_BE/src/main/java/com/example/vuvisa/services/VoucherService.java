package com.example.vuvisa.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.vuvisa.dtos.requests.CreateVoucherRequest;
import com.example.vuvisa.dtos.requests.UpdateVoucherRequest;
import com.example.vuvisa.dtos.responses.VoucherResponse;

import java.util.List;

public interface VoucherService {

    /**
     * Creates a new Voucher based on the provided request.
     *
     * @param createVoucherRequest The DTO containing voucher creation details.
     * @return VoucherResponse containing the details of the created voucher.
     * @throws Exception if any error occurs during the operation.
     */
    VoucherResponse createVoucher(CreateVoucherRequest createVoucherRequest) throws Exception;

    /**
     * Retrieves voucher details by its unique identifier.
     *
     * @param voucherId The ID of the voucher.
     * @return VoucherResponse containing the details of the voucher.
     * @throws Exception if the voucher is not found.
     */
    VoucherResponse getVoucherDetailsById(Long voucherId) throws Exception;

    /**
     * Retrieves voucher details by the voucher code.
     *
     * @param code The code of the voucher.
     * @return VoucherResponse containing the details of the voucher.
     * @throws Exception if the voucher is not found.
     */
    VoucherResponse getVoucherDetailsByCode(String code) throws Exception;

    /**
     * Retrieves a paginated list of all vouchers.
     *
     * @param pageable The paging and sorting information.
     * @return A Page of VoucherResponse containing all vouchers.
     */
    Page<VoucherResponse> getAllVouchers(Pageable pageable);

    /**
     * Searches vouchers by their code with pagination.
     *
     * @param code     The code to search for.
     * @param pageable The paging and sorting information.
     * @return A Page of VoucherResponse containing matching vouchers.
     */
    Page<VoucherResponse> searchVouchersByCode(String code, Pageable pageable);

    /**
     * Deletes a voucher by its ID.
     *
     * @param voucherId The ID of the voucher to be deleted.
     * @throws Exception if the voucher is not found.
     */
    void deleteVoucher(Long voucherId) throws Exception;

    /**
     * Updates an existing voucher with new data.
     *
     * @param voucherId         The ID of the voucher to be updated.
     * @param updateVoucherRequest The DTO containing updated voucher details.
     * @return VoucherResponse containing the updated voucher details.
     * @throws Exception if the voucher is not found or validation fails.
     */
    VoucherResponse updateVoucher(Long voucherId, UpdateVoucherRequest updateVoucherRequest) throws Exception;

    Page<VoucherResponse> searchVouchersByName(String voucherName, Pageable pageable);

    /**
     * Retrieves a list of random vouchers.
     *
     * @param count The number of random vouchers to retrieve.
     * @return A List of VoucherResponse containing random vouchers.
     */
    List<VoucherResponse> getRandomVouchers(int count);
}
