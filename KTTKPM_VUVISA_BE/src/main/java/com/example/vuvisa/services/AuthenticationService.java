package com.example.vuvisa.services;

import java.text.ParseException;

import com.example.vuvisa.dtos.requests.*;
import com.example.vuvisa.dtos.responses.AuthenticationResponse;
import com.example.vuvisa.dtos.responses.IntrospectResponse;
import com.example.vuvisa.dtos.responses.TokenResponse;
import com.nimbusds.jose.JOSEException;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest, boolean flap) throws Exception;

    IntrospectResponse introspect(IntrospectRequest request) throws ParseException, JOSEException;

    void logout(LogoutRequest logoutRequest, String refreshToken) throws ParseException, JOSEException;

    TokenResponse refreshAccessToken(RefreshRequest refreshRequest) throws JOSEException;

    void sendResetToken(SendMailResetPasswordRequest sendMailResetPasswordRequest);

    void resetPassword(ResetPasswordRequest resetPasswordRequest) throws Exception;

    void changePassword(Long id, ChangePasswordRequest changePasswordRequest) throws Exception;

    AuthenticationResponse outboundGoogleAuthentication(String code) throws JOSEException;

    AuthenticationResponse outboundFacebookAuthentication(FacebookUserRequest facebookUserRequest) throws JOSEException;
}
