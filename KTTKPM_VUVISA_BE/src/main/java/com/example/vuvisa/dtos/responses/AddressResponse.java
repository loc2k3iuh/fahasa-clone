package com.example.vuvisa.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
    private Long id;
    private String street;
    private String city;
    private String zip;
    private String ward;
    private String district;
    private String detailAddress;
    private String phoneNumber;
    private Long userId;
}