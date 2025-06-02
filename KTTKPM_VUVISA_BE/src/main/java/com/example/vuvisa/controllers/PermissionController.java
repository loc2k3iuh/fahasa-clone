package com.example.vuvisa.controllers;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.PermissionRequest;
import com.example.vuvisa.dtos.responses.PermissionResponse;
import com.example.vuvisa.services.PermissionService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/permissions")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionController {
	PermissionService permissionService;

	@PostMapping("")
	public APIResponse<PermissionResponse> createPermission(@Valid @RequestBody PermissionRequest permissionRequest) {
		return APIResponse.<PermissionResponse>builder()
				.result(permissionService.create(permissionRequest))
				.message("Permission created successfully")
				.build();
	}

	@GetMapping("")
	public APIResponse<List<PermissionResponse>> getAllPermissions() {
		return APIResponse.<List<PermissionResponse>>builder()
				.result(permissionService.getAllPermissions())
				.message("Permissions retrieved successfully")
				.build();
	}

	@DeleteMapping("/{name}")
	public APIResponse<String> deletePermission(@PathVariable String name) {
		permissionService.deletePermission(name);
		return APIResponse.<String>builder()
				.message("Permission deleted successfully")
				.build();
	}
}
