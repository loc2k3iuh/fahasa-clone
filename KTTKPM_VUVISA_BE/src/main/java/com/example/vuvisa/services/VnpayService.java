package com.example.vuvisa.services;

import com.example.vuvisa.dtos.requests.VnpayRequest;

import java.io.UnsupportedEncodingException;

public interface VnpayService {
    String createPayment(VnpayRequest vnpayRequest) throws UnsupportedEncodingException;
    String handlePaymentReturn(String responseCode) ;
}
