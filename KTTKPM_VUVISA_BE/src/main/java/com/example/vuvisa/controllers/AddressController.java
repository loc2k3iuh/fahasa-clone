package com.example.vuvisa.controllers;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.AddressRequest;
import com.example.vuvisa.dtos.responses.AddressResponse;
import com.example.vuvisa.services.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/addresses")
public class AddressController {

    private final AddressService addressService;

    @PostMapping("/users/{userId}")
    public APIResponse<AddressResponse> addAddress(
            @PathVariable Long userId,
            @Valid @RequestBody AddressRequest addressRequest) {
        return APIResponse.<AddressResponse>builder()
                .result(addressService.addAddress(userId, addressRequest))
                .message("Address added successfully")
                .build();
    }

    @GetMapping("/users/{userId}")
    public APIResponse<List<AddressResponse>> getAddressesByUserId(@PathVariable Long userId) {
        return APIResponse.<List<AddressResponse>>builder()
                .result(addressService.getAddressesByUserId(userId))
                .message("Addresses retrieved successfully")
                .build();
    }

    @GetMapping("/{addressId}")
    public APIResponse<AddressResponse> getAddressById(@PathVariable Long addressId) {
        return APIResponse.<AddressResponse>builder()
                .result(addressService.getAddressById(addressId))
                .message("Address retrieved successfully")
                .build();
    }

    @PutMapping("/{addressId}")
    public APIResponse<AddressResponse> updateAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest addressRequest) {
        return APIResponse.<AddressResponse>builder()
                .result(addressService.updateAddress(addressId, addressRequest))
                .message("Address updated successfully")
                .build();
    }

    @DeleteMapping("/{addressId}")
    public APIResponse<Void> deleteAddress(@PathVariable Long addressId) {
        addressService.deleteAddress(addressId);
        return APIResponse.<Void>builder()
                .message("Address deleted successfully")
                .build();
    }
}