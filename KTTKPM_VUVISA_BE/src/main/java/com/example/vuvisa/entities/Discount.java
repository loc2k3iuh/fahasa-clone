package com.example.vuvisa.entities;

import java.time.LocalDate;
import java.util.Date;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "discounts")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Discount {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "discount_name")
	private String discountName;

	@Column(name = "discount_percentage")
	private Double discountPercentage;

	@Column(name = "discount_amount")
	private Double discountAmount;

	@Column(name = "start_date")
	private LocalDate startDate;

	@Column(name = "end_date")
	private LocalDate endDate;

	@ManyToMany
	@JsonIgnore
	@JoinTable(
			name = "discount_products",
			joinColumns = @JoinColumn(name = "discount_id"),
			inverseJoinColumns = @JoinColumn(name = "product_id"))
	private Set<Product> products;
}
