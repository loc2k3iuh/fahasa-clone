package com.example.vuvisa.entities;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
@Table(name = "product")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Product {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	protected Long id;

	@Column(name = "product_name")
	protected String productName;

	@Column(name = "description", columnDefinition = "TEXT")
	protected String description;

	@Column(name = "price")
	protected Long price;

	@Column(name = "stock_quantity")
	protected Long stockQuantity;

	@Column(name = "image_url")
	protected String imageUrl;

	@ManyToOne
	@JoinColumn(name = "category_id")
	protected Category category;

	@ManyToOne
	@JoinColumn(name = "supplier_id")
	@JsonIgnore
	protected Supplier supplier;

//	@OneToMany(mappedBy = "product")
//	protected Set<ImageProduct> imageProducts;

	@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
	@ToString.Exclude
	@JsonIgnore
	private Set<ImageProduct> imageProducts = new HashSet<>();

	@OneToMany(mappedBy = "product")
	@ToString.Exclude
	@JsonIgnore
	protected Set<Review> reviews;

	@OneToMany(mappedBy = "product")
	@JsonIgnore
	protected Set<OrderDetail> orderDetails;

	@ManyToMany(mappedBy = "products")
	@ToString.Exclude
	protected Set<Discount> discounts;

	@ManyToMany(mappedBy = "products")
	@ToString.Exclude
	protected Set<Voucher> vouchers;

	@OneToMany(mappedBy = "product")
	@ToString.Exclude
	@JsonIgnore
	protected Set<Favorite> favorites;
}
