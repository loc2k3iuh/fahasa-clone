package com.example.vuvisa.repositories.httpclient.google;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import com.example.vuvisa.dtos.responses.GoogleUserResponse;

@FeignClient(name = "outbound-user-client", url = "https://openidconnect.googleapis.com")
public interface OutboundGoogleUserClient {

	@GetMapping(value = "/v1/userinfo")
	GoogleUserResponse getUserInfo(@RequestHeader("Authorization") String bearerToken);
}
