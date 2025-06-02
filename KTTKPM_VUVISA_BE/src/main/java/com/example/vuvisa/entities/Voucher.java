package com.example.vuvisa.entities;

import java.time.LocalDate;
import java.util.Date;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.HashSet;

import lombok.*;

@Entity
@Table(name = "vouchers")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Voucher {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "code")
	private String code;

	@Column(name = "discount_name")
	private String discountName;

	private Double discountPercentage;

	@Column(name = "discount_amount")
	private Double discountAmount;

	@Column(name = "min_order_value")
	private Double minOrderValue;

	@Column(name = "max_uses")
	private Double maxUses;

	@Column(name = "start_date")
	private LocalDate startDate;

	@Column(name = "end_date")
	private LocalDate endDate;

	@ManyToMany
	@JsonIgnore
	@JoinTable(
			name = "voucher_products",
			joinColumns = @JoinColumn(name = "voucher_id"),
			inverseJoinColumns = @JoinColumn(name = "product_id"))
	private Set<Product> products;

	@ManyToMany(mappedBy = "vouchers")
	@JsonIgnore
	@ToString.Exclude
	private Set<Order> orders = new HashSet<>();
}
