package com.example.vuvisa.controllers;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.RoleRequest;
import com.example.vuvisa.dtos.requests.UpdateRoleRequest;
import com.example.vuvisa.dtos.responses.RoleResponse;
import com.example.vuvisa.services.RoleService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/roles")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleController {

	RoleService roleService;

	@PostMapping("")
	public APIResponse<RoleResponse> createRole(@Valid @RequestBody RoleRequest roleRequest) {
		return APIResponse.<RoleResponse>builder()
				.result(roleService.create(roleRequest))
				.message("Role created successfully")
				.build();
	}

	@GetMapping("")
	public APIResponse<List<RoleResponse>> getAllRoles() {
		return APIResponse.<List<RoleResponse>>builder()
				.result(roleService.getAllRoles())
				.message("Roles retrieved successfully")
				.build();
	}

	@DeleteMapping("/{name}")
	public APIResponse<String> deleteRole(@PathVariable String name) {
		roleService.deleteRole(name);
		return APIResponse.<String>builder()
				.message("Role deleted successfully")
				.build();
	}

	@PutMapping("/{name}")
	public APIResponse<RoleResponse> updateRole(
			@PathVariable String name, @Valid @RequestBody UpdateRoleRequest updateRoleRequest) {
		return APIResponse.<RoleResponse>builder()
				.result(roleService.updateRole(name, updateRoleRequest))
				.message("Role updated successfully")
				.build();
	}
}
