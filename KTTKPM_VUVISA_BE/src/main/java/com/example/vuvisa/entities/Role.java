package com.example.vuvisa.entities;

import java.util.Set;

import jakarta.persistence.*;

import com.example.vuvisa.enums.RoleType;

import lombok.*;

@Entity
@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "roles")
public class Role {
	@Id
	@Enumerated(EnumType.STRING)
	private RoleType name;

	private String description;

	@ManyToMany
	Set<Permission> permissions;
}
