package com.example.vuvisa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@EnableScheduling
@SpringBootApplication
@EnableFeignClients(basePackages = "com.example.vuvisa.repositories.httpclient")
@EnableJpaAuditing
@EnableTransactionManagement
public class VuvisaApplication {
	public static void main(String[] args) {
		SpringApplication.run(VuvisaApplication.class, args);
	}
}
