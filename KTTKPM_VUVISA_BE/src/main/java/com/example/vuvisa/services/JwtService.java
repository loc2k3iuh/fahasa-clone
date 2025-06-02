package com.example.vuvisa.services;

import java.text.ParseException;

import com.example.vuvisa.entities.User;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.stereotype.Service;

@Service
public interface JwtService {
	String generateToken(User user) throws JOSEException;

	String buildScope(User user);

	SignedJWT verifyToken(String token) throws JOSEException, ParseException;
}
