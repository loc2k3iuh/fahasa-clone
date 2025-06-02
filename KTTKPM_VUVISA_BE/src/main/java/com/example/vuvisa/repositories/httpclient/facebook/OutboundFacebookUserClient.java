package com.example.vuvisa.repositories.httpclient.facebook;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.vuvisa.dtos.responses.FacebookUserResponse;

@FeignClient(name = "outbound-facebook-client", url = "https://graph.facebook.com")
public interface OutboundFacebookUserClient {
	@GetMapping(value = "/v18.0/me")
	FacebookUserResponse getUserInfo(
			@RequestParam("access_token") String accessToken, @RequestParam("fields") String fields);
}
