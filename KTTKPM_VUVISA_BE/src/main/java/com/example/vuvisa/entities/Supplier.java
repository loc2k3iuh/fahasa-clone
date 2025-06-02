package com.example.vuvisa.entities;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Supplier {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "supplier_name")
	private String supplierName;

	@Column(name = "description")
	private String description;

	@JsonIgnore
	@OneToMany(mappedBy = "supplier")
	private Set<Product> products;
}
