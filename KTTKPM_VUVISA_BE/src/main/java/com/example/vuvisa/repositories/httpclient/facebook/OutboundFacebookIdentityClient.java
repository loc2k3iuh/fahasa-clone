package com.example.vuvisa.repositories.httpclient.facebook;

import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "outbound-facebook-identity-client", url = "https://graph.facebook.com")
public interface OutboundFacebookIdentityClient {

	//    @GetMapping(value = "/v22.0/oauth/access_token")
	//    FacebookExchangeTokenResponse exchangeToken(@SpringQueryMap FacebookExchangeTokenRequest
	// facebookExchangeTokenRequest);
}
