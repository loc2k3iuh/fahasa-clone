package com.example.vuvisa.services.impl;

import com.example.vuvisa.dtos.requests.AddressRequest;
import com.example.vuvisa.dtos.responses.AddressResponse;
import com.example.vuvisa.entities.Address;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.exceptions.AppException;
import com.example.vuvisa.exceptions.ErrorCode;
import com.example.vuvisa.repositories.AddressRepository;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.services.AddressService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest addressRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));


        if (userRepository.existsByPhoneNumber(addressRequest.getPhoneNumber()) && !user.getPhoneNumber().equals(addressRequest.getPhoneNumber())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }

        Address address = Address.builder()
                .street(addressRequest.getStreet())
                .city(addressRequest.getCity())
                .zip(addressRequest.getZip())
                .ward(addressRequest.getWard())
                .district(addressRequest.getDistrict())
                .detailAddress(addressRequest.getDetailAddress())
                .phoneNumber(addressRequest.getPhoneNumber())
                .user(user)
                .build();

        Address savedAddress = addressRepository.save(address);
        return mapToAddressResponse(savedAddress);
    }

    @Override
    public List<AddressResponse> getAddressesByUserId(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        return addresses.stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AddressResponse getAddressById(Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found with id: " + addressId));
        return mapToAddressResponse(address);
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long addressId, AddressRequest addressRequest) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found with id: " + addressId));

        User user = userRepository.findById(addressRequest.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (userRepository.existsByPhoneNumber(addressRequest.getPhoneNumber()) && !user.getPhoneNumber().equals(addressRequest.getPhoneNumber())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }

        address.setStreet(addressRequest.getStreet());
        address.setCity(addressRequest.getCity());
        address.setZip(addressRequest.getZip());
        address.setWard(addressRequest.getWard());
        address.setDistrict(addressRequest.getDistrict());
        address.setDetailAddress(addressRequest.getDetailAddress());
        address.setPhoneNumber(addressRequest.getPhoneNumber());

        Address updatedAddress = addressRepository.save(address);
        return mapToAddressResponse(updatedAddress);
    }

    @Override
    @Transactional
    public void deleteAddress(Long addressId) {
        if (!addressRepository.existsById(addressId)) {
            throw new EntityNotFoundException("Address not found with id: " + addressId);
        }
        addressRepository.deleteById(addressId);
    }

    private AddressResponse mapToAddressResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .street(address.getStreet())
                .city(address.getCity())
                .zip(address.getZip())
                .ward(address.getWard())
                .district(address.getDistrict())
                .detailAddress(address.getDetailAddress())
                .phoneNumber(address.getPhoneNumber())
                .userId(address.getUser().getId())
                .build();
    }
}