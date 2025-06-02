package com.example.vuvisa.services;

import com.example.vuvisa.dtos.requests.FacebookUserRequest;
import com.example.vuvisa.dtos.responses.AuthenticationResponse;
import com.nimbusds.jose.JOSEException;

public interface OutboundIdentityService {
	AuthenticationResponse authenticateWithGoogle(String code) throws JOSEException;

	AuthenticationResponse authenticateWithFacebook(FacebookUserRequest facebookUserRequest) throws JOSEException;
}
