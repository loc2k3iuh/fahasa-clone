package com.example.vuvisa.configurations;

import java.text.ParseException;
import java.util.Objects;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import com.example.vuvisa.dtos.requests.IntrospectRequest;
import com.example.vuvisa.services.AuthenticationService;
import com.nimbusds.jose.JOSEException;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomJwtDecoder implements JwtDecoder {
	@Value("${jwt.signerKey}")
	String signerKey;

	@Autowired
	AuthenticationService authenticationService;

	NimbusJwtDecoder nimbusJwtDecoder = null;

	@Override
	public Jwt decode(String token) throws JwtException {

		try {
			var response = authenticationService.introspect(
					IntrospectRequest.builder().token(token).build());

			if (!response.isValid()) throw new JwtException("Token invalid");
		} catch (JOSEException | ParseException e) {
			throw new JwtException(e.getMessage());
		}

		if (Objects.isNull(nimbusJwtDecoder)) {
			SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
			nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
					.macAlgorithm(MacAlgorithm.HS512)
					.build();
		}

		return nimbusJwtDecoder.decode(token);
	}
}