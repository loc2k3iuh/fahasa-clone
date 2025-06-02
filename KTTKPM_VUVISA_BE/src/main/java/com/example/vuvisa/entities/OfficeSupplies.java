package com.example.vuvisa.entities;

import jakarta.persistence.*;

import lombok.*;

@Builder
@Entity
@Table(name = "office_supplies")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class OfficeSupplies extends Product {
	@Column(name = "classify")
	private String classify;
}
