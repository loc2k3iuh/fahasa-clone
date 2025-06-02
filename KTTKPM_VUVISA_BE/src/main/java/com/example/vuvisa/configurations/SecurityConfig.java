package com.example.vuvisa.configurations;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SecurityConfig {

	@Autowired
	CustomJwtDecoder customJwtDecoder;

	final String[] PUBLIC_POST_ENDPOINTS = {
		"/api/v1/users/auth/login",
		"/api/v1/users/auth/login-temporarily",
		"/api/v1/users/register",
		"/api/v1/users/auth/logout",
		"/api/v1/users/auth/introspect",
		"/api/v1/users/auth/refresh-token",
		"/api/v1/users/auth/forgot-password",
		"/api/v1/users/auth/reset-password",
		"/api/v1/users/confirm",
        "/api/v1/users/auth/outbound/authentication",
		"/api/v1/users/resend-confirmation",
		"/api/v1/users/auth/outbound-google/authentication",
		"/api/v1/users/auth/outbound-facebook/authentication",
		"/api/v1/users/connect-user",
		"/api/v1/users/disconnect-user",
		"/api/v1/users/connect-admin",
		"/api/v1/users/disconnect-admin",

	};
//		http://localhost:9090/vuvisa/swagger-ui/index.html xem api bằng UI.

	final String[] PUBLIC_GET_ENDPOINTS = {
			"/api/v1/users/auth/ping",
			"/api/v1/roles",
			"/api/v1/recommend",
			"/api/v1/users/online-admins",
            "/api/v1/users/auth/outbound-facebook/authentication",
			"/api/v1/products",
			"/api/v1/products/category/{categoryId}",
			"/api/v1/products/category/{categoryId}/supplier/{supplierId}",
			"/api/v1/products/search/{term}",
			"/api/v1/categories/by-type",
			"/api/v1/products/{productId}/related",
			"/api/v1/products/newest",
			"/api/v1/products/random-with-discounts",
			"/api/v1/products/books/{id}",
            "/api/v1/products/office-supplies/{id}",
            "/api/v1/reviews/product/{productId}",
			"/api/v1/suppliers/all",
			"/api/v1/rate-limiter-test/ping",
			"/api/v1/retry-test/success",
			"/api/v1/retry-test/simulate-failure",
			"/api/v1/retry-test/always-fail",
			"/api/v1/products/count-by-category-type"
	};

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
		httpSecurity.csrf(AbstractHttpConfigurer::disable);
//		http://localhost:9090/vuvisa/swagger-ui/index.html xem api bằng UI.
		httpSecurity.authorizeHttpRequests(auth -> auth.requestMatchers(HttpMethod.POST, PUBLIC_POST_ENDPOINTS)
				.permitAll()
				.requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS)
				.permitAll()
				.requestMatchers("/ws/**", "/swagger-ui/**", "/v3/api-docs/**")
				.permitAll()
				.anyRequest()
				.authenticated());

		httpSecurity.oauth2ResourceServer(oauth2 -> oauth2.jwt(
						jwt -> jwt.decoder(customJwtDecoder).jwtAuthenticationConverter(jwtAuthenticationConverter()))
				.authenticationEntryPoint(new JwtAuthenticationEntryPoint()));

		httpSecurity.cors(cors -> {
			CorsConfiguration configuration = new CorsConfiguration();
			configuration.setAllowedOrigins(List.of("http://localhost:8888", "http://localhost:5173", "http://18.138.58.254:5173", "http://18.138.58.254:8888"));
			configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
			configuration.setAllowedHeaders(List.of("*"));
			configuration.setExposedHeaders(List.of("x-auth-token"));
			configuration.setAllowCredentials(true);
			UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
			source.registerCorsConfiguration("/**", configuration);
			cors.configurationSource(source);
		});

		return httpSecurity.build();
	}

	@Bean
	JwtAuthenticationConverter jwtAuthenticationConverter() {
		JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
		jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");
		JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
		jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
		return jwtAuthenticationConverter;
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder(10);
	}
}
