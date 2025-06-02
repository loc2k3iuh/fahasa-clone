package com.example.vuvisa.entities;

import java.util.Date;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "confirmation_tokens")
@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConfirmationToken {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String token;

	@ManyToOne
	@JoinColumn(nullable = false, name = "user_id")
	private User user;

	private Date createdAt;
	private Date expiresAt;
	private Date confirmedAt;
}
