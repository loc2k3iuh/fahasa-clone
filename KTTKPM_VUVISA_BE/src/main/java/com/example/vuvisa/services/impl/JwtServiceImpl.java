package com.example.vuvisa.services.impl;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.example.vuvisa.entities.*;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.exceptions.AppException;
import com.example.vuvisa.exceptions.ErrorCode;
import com.example.vuvisa.repositories.InvalidatedTokenRepository;
import com.example.vuvisa.services.JwtService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JwtServiceImpl implements JwtService {

	InvalidatedTokenRepository invalidatedTokenRepository;

	@NonFinal
	@Value("${jwt.signerKey}")
	protected String SIGNER_KEY;

	@NonFinal
	@Value("${jwt.token.valid-duration}")
	protected long VALID_DURATION;

	@Override
	public String generateToken(User user) throws JOSEException {
		JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
		JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
				.subject(user.getUsername())
				.issuer("vuvisa.com")
				.issueTime(new Date())
				.expirationTime(new Date(
						Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
				.jwtID(UUID.randomUUID().toString())
				.claim("scope", buildScope(user))
				.claim("userId", user.getId())
				.build();

		Payload payload = new Payload(claimsSet.toJSONObject());
		JWSObject jwsObject = new JWSObject(header, payload);
		jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
		return jwsObject.serialize();
	}

	@Override
	public String buildScope(User user) {
		StringJoiner scopeJoiner = new StringJoiner(" ");
		if (!CollectionUtils.isEmpty(user.getRoles())) {
			user.getRoles()
					.forEach(role -> scopeJoiner.add("ROLE_" + role.getName().name()));
			Role firstRole = user.getRoles().stream().findFirst().orElse(null);
			if (firstRole != null && !CollectionUtils.isEmpty(firstRole.getPermissions())) {
				firstRole.getPermissions().forEach(permission -> scopeJoiner.add(permission.getName()));
			}
		}
		return scopeJoiner.toString();
	}

	@Override
	public SignedJWT verifyToken(String token) throws JOSEException, ParseException {
		JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

		SignedJWT signedJWT = SignedJWT.parse(token);

		Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

		var verified = signedJWT.verify(verifier);

		if (!(verified && expiryTime.after(new Date()))) throw new AppException(ErrorCode.UNAUTHENTICATED);

		if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
			throw new AppException(ErrorCode.UNAUTHENTICATED);

		return signedJWT;
	}
}
