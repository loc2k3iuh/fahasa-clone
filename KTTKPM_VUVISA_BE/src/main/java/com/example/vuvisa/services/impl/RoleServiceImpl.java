package com.example.vuvisa.services.impl;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.example.vuvisa.dtos.requests.RoleRequest;
import com.example.vuvisa.dtos.requests.UpdateRoleRequest;
import com.example.vuvisa.dtos.responses.RoleResponse;
import com.example.vuvisa.entities.Role;
import com.example.vuvisa.enums.RoleType;
import com.example.vuvisa.exceptions.AppException;
import com.example.vuvisa.exceptions.ErrorCode;
import com.example.vuvisa.repositories.PermissionRepository;
import com.example.vuvisa.repositories.RoleRepository;
import com.example.vuvisa.services.RoleService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleServiceImpl implements RoleService {

	RoleRepository roleRepository;
	PermissionRepository permissionRepository;

	@Override
	@PreAuthorize("hasAuthority('APPROVE_POST')")
	public RoleResponse create(RoleRequest obj) {
		var role = Role.builder()
				.name(RoleType.valueOf(obj.getName()))
				.description(obj.getDescription())
				.permissions(new HashSet<>(permissionRepository.findAllById(obj.getPermissions())))
				.build();
		return RoleResponse.from(roleRepository.save(role));
	}

	@Override
	@PreAuthorize("hasAuthority('APPROVE_POST')")
	public List<RoleResponse> getAllRoles() {
		return roleRepository.findAll().stream().map(RoleResponse::from).collect(Collectors.toList());
	}

	@Override
	@PreAuthorize("hasAuthority('APPROVE_POST')")
	public void deleteRole(String name) {
		Role role = roleRepository
				.findByName(RoleType.valueOf(name))
				.orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
		roleRepository.delete(role);
	}

	@Override
	@PreAuthorize("hasAuthority('APPROVE_POST')")
	public RoleResponse updateRole(String name, UpdateRoleRequest obj) {
		Role role = roleRepository
				.findByName(RoleType.valueOf(name))
				.orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
		role.setDescription(obj.getDescription());
		if (obj.getPermissions() != null) {
			role.setPermissions(new HashSet<>(permissionRepository.findAllById(obj.getPermissions())));
		}
		return RoleResponse.from(roleRepository.save(role));
	}
}
