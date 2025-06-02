package com.example.vuvisa.entities;

import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Review {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "rating")
	private Long rating;

	@Column(name = "comment")
	private String comment;

	@ManyToOne
	@JoinColumn(name = "product_id")
	private Product product;

	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;

	// Temporarily commented out until the database schema is updated
	// @Column(name = "created_at", nullable = false)
	// private LocalDateTime createdAt;

	// @PrePersist
	// protected void onCreate() {
	// 	createdAt = LocalDateTime.now();
	// }
}
