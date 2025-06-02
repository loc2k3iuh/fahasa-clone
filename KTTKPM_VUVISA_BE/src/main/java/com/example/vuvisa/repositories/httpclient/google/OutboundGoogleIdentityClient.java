package com.example.vuvisa.repositories.httpclient.google;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;

import com.example.vuvisa.dtos.requests.GoogleExchangeTokenRequest;
import com.example.vuvisa.dtos.responses.GoogleExchangeTokenResponse;

import feign.QueryMap;

@FeignClient(name = "outbound-identity-client", url = "https://oauth2.googleapis.com")
public interface OutboundGoogleIdentityClient {
	@PostMapping(value = "/token", produces = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
	GoogleExchangeTokenResponse exchangeToken(@QueryMap GoogleExchangeTokenRequest googleExchangeTokenRequest);
}
