package com.example.vuvisa.services;

import java.util.List;

import com.example.vuvisa.dtos.requests.RoleRequest;
import com.example.vuvisa.dtos.requests.UpdateRoleRequest;
import com.example.vuvisa.dtos.responses.RoleResponse;

public interface RoleService {
	RoleResponse create(RoleRequest obj);

	List<RoleResponse> getAllRoles();

	void deleteRole(String name);

	RoleResponse updateRole(String name, UpdateRoleRequest obj);
}
