package com.example.vuvisa.services;

import java.util.List;

import com.example.vuvisa.dtos.requests.PermissionRequest;
import com.example.vuvisa.dtos.responses.PermissionResponse;

public interface PermissionService {
	PermissionResponse create(PermissionRequest obj);

	List<PermissionResponse> getAllPermissions();

	void deletePermission(String name);
}
