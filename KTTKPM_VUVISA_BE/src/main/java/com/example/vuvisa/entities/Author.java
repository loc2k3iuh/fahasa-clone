package com.example.vuvisa.entities;

import java.util.Set;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "authors")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Author {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "author_name")
	private String authorName;

	@Column(name = "description")
	private String description;

	@ManyToMany(mappedBy = "authors")
	@ToString.Exclude
	private Set<Book> books;
}
