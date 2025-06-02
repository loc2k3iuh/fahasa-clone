package com.example.vuvisa.services.impl;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.example.vuvisa.dtos.requests.PermissionRequest;
import com.example.vuvisa.dtos.responses.PermissionResponse;
import com.example.vuvisa.entities.Permission;
import com.example.vuvisa.exceptions.AppException;
import com.example.vuvisa.exceptions.ErrorCode;
import com.example.vuvisa.repositories.PermissionRepository;
import com.example.vuvisa.services.PermissionService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionServiceImpl implements PermissionService {

	PermissionRepository permissionRepository;

	@Override
	@PreAuthorize("hasAuthority('APPROVE_POST')")
	public PermissionResponse create(PermissionRequest obj) {
		Permission permission = Permission.builder()
				.name(obj.getName())
				.description(obj.getDescription())
				.build();
		return PermissionResponse.from(permissionRepository.save(permission));
	}

	@Override
	@PreAuthorize("hasAuthority('APPROVE_POST')")
	public List<PermissionResponse> getAllPermissions() {
		return permissionRepository.findAll().stream()
				.map(PermissionResponse::from)
				.toList();
	}

	@Override
	@PreAuthorize("hasAuthority('APPROVE_POST')")
	public void deletePermission(String name) {
		Permission permission = permissionRepository
				.findByName(name)
				.orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
		permissionRepository.delete(permission);
	}
}
