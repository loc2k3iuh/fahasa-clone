package com.example.vuvisa.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "image_products")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ImageProduct {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "description")
	private String description;

	@Column(name = "url")
	private String url;

	@ManyToOne
	@JsonIgnore
	@JoinColumn(name = "product_id")
	private Product product;
}
