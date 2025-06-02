package com.example.vuvisa.configurations;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.exceptions.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
	@Override
	public void commence(
			HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
			throws IOException {
		ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;
		response.setStatus(errorCode.getHttpStatusCode().value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		APIResponse<?> apiResponse = new APIResponse<>();
		apiResponse.setCode(errorCode.getCode());
		apiResponse.setMessage(errorCode.getMessage());
		ObjectMapper mapper = new ObjectMapper();
		response.getWriter().write(mapper.writeValueAsString(apiResponse));
		response.flushBuffer();
	}
}
