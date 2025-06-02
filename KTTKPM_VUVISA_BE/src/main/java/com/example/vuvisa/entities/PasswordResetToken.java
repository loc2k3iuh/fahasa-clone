package com.example.vuvisa.entities;

import java.util.Calendar;
import java.util.Date;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "password_reset_tokens")
@NoArgsConstructor
//@Table(name = "password_reset_tokens")
public class PasswordResetToken {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String token;

	private Date expiryDate;

	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;

	public PasswordResetToken(String token, User user) {
		this.token = token;
		this.user = user;
		Calendar calendar = Calendar.getInstance();
		calendar.add(Calendar.MINUTE, 30);
		this.expiryDate = calendar.getTime();
	}
}
