package com.example.vuvisa.entities;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.*;

@Entity
@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "invalidated_tokens")
public class InvalidatedToken {

	@Id
	private String id;

	@Column(name = "expiry_time")
	Date expiryTime;
}
