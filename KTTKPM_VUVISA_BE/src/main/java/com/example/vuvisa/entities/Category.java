package com.example.vuvisa.entities;

import java.util.Set;

import com.example.vuvisa.enums.CategoryType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Category {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "category_name")
	private String categoryName;

	@Column(name = "description")
	private String description;


	@OneToMany(mappedBy = "category")
	@JsonIgnore
	private Set<Product> products;

	@Enumerated(EnumType.STRING)
	@Column(name = "type")
	private CategoryType type;
}
