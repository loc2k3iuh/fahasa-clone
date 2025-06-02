package com.example.vuvisa.components;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import com.example.vuvisa.services.TokenCleanupService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StartupCleanupRunner implements ApplicationListener<ApplicationReadyEvent> {

	TokenCleanupService tokenCleanupService;

	@Override
	public void onApplicationEvent(ApplicationReadyEvent event) {
		tokenCleanupService.cleanUpExpiredTokens();
	}
}