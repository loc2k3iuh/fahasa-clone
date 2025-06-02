package com.example.vuvisa.configurations;

import java.util.Date;
import java.util.HashSet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.vuvisa.entities.Role;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.enums.RoleType;
import com.example.vuvisa.exceptions.AppException;
import com.example.vuvisa.exceptions.ErrorCode;
import com.example.vuvisa.repositories.RoleRepository;
import com.example.vuvisa.repositories.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationInitConfig {

	@Autowired
	PasswordEncoder passwordEncoder;

	@Bean
	ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
		HashSet<Role> roles = new HashSet<>();
		Role defaultRole = roleRepository
				.findByName(RoleType.valueOf("ADMIN"))
				.orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
		roles.add(defaultRole);

		return args -> {
			if (userRepository.findByUsername("admin").isEmpty()) {
				User user = User.builder()
						.username("admin")
						.password(passwordEncoder.encode("admin"))
						.createdDate(new Date())
						.roles(roles)
						.isActive(true)
						.build();
				userRepository.save(user);
				log.warn("admin user created with default password: admin, please change it !");
			}
		};
	}
}