package com.example.vuvisa.controllers;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.VnpayRequest;
import com.example.vuvisa.services.VnpayService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("${api.prefix}/vnpay")
@RequiredArgsConstructor
public class VnpayContronller {

    private final VnpayService vnpayService;

    @PostMapping
    public APIResponse<?> createPayment(@RequestBody VnpayRequest vnpayRequest) {
        try {
            String paymentUrl = vnpayService.createPayment(vnpayRequest);
            return APIResponse.builder()
                    .message("Payment URL generated successfully")
                    .result(paymentUrl)
                    .build();
        } catch (Exception e) {
            return APIResponse.builder()
                    .message("Error generating payment URL: " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/return")
    public APIResponse<?> returnPayment(@RequestParam("vnp_ResponseCode") String responseCode) {
        try {
            String result = vnpayService.handlePaymentReturn(responseCode);
            return APIResponse.builder()
                    .message("Payment handled successfully")
                    .result(result)
                    .build();
        } catch (Exception e) {
            return APIResponse.builder()
                    .message("Error handling payment: " + e.getMessage())
                    .build();
        }
    }
}
