package com.example.vuvisa.services;

import com.example.vuvisa.dtos.requests.AddressRequest;
import com.example.vuvisa.dtos.responses.AddressResponse;

import java.util.List;

public interface AddressService {

    /**
     * Add a new address for a user
     *
     * @param userId the ID of the user
     * @param addressRequest the address data
     * @return the created address
     */
    AddressResponse addAddress(Long userId, AddressRequest addressRequest);

    /**
     * Get all addresses for a user
     *
     * @param userId the ID of the user
     * @return list of addresses
     */
    List<AddressResponse> getAddressesByUserId(Long userId);

    /**
     * Get an address by its ID
     *
     * @param addressId the ID of the address
     * @return the address
     */
    AddressResponse getAddressById(Long addressId);

    /**
     * Update an address
     *
     * @param addressId the ID of the address
     * @param addressRequest the updated address data
     * @return the updated address
     */
    AddressResponse updateAddress(Long addressId, AddressRequest addressRequest);

    /**
     * Delete an address
     *
     * @param addressId the ID of the address
     */
    void deleteAddress(Long addressId);
}