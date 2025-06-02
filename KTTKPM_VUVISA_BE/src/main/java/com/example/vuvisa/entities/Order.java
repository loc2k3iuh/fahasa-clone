package com.example.vuvisa.entities;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.example.vuvisa.enums.PaymentMethod;
import com.example.vuvisa.enums.ShippingMethod;
import jakarta.persistence.*;

import com.example.vuvisa.enums.OrderStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.*;

@Entity
@Table(name = "orders")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Order implements Serializable {

	@Id
	private Long id;

	@PrePersist
	public void prePersist() {
		if (id == null) {
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern("ddMMyyyyHHmmss");
			String dateTimeStr = LocalDateTime.now().format(formatter);
			// thêm 2 số random (00–99)
			int randomSuffix = (int) (Math.random() * 100);
			id = Long.parseLong(dateTimeStr + String.format("%02d", randomSuffix));
		}
	}


	@Column(name = "full_name")
	private String fullName;

	@Column(name = "email")
	private String email;

	@Column(name = "phone_number")
	private String phoneNumber;

	@Column(name = "city")
	private String city;

	@Column(name = "district")
	private String district;

	@Column(name = "ward")
	private String ward;

	@Column(name = "address")
	private String address;

	@Column(name = "order_date")
	private Date orderDate;

	@Column(name = "status")
	@Enumerated(EnumType.STRING)
	private OrderStatus status;

	@Column(name = "payment_method")
	@Enumerated(EnumType.STRING)
	private PaymentMethod paymentMethod;

	@Column(name = "shipping_date")
	private Date shippingDate;

	@Column(name = "shipping_method")
	@Enumerated(EnumType.STRING)
	private ShippingMethod shippingMethod;

	@Column(name = "note")
	private String note;

	@Column(name = "discount_code")
	private String discountCode;

	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;

	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@ToString.Exclude
	private List<OrderDetail> orderDetails;

	@ManyToMany
	@JsonIgnore
	@JoinTable(
			name = "order_vouchers",
			joinColumns = @JoinColumn(name = "order_id"),
			inverseJoinColumns = @JoinColumn(name = "voucher_id"))
	@ToString.Exclude
	private Set<Voucher> vouchers = new HashSet<>();
}
