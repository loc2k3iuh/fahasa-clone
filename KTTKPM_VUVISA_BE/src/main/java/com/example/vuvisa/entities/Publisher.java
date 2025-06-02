package com.example.vuvisa.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import lombok.*;

import java.util.Set;

@Entity
@Table(name = "publishers")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Publisher {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "publisher_name")
	private String publisherName;

	@Column(name = "description")
	private String description;

	//    @OneToOne(mappedBy = "publisher")
	//    private Book book;

	@JsonIgnore
	@OneToMany(mappedBy = "publisher")
	private Set<Book> books;
}
