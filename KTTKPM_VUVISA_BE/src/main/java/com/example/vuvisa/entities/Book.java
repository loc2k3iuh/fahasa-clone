package com.example.vuvisa.entities;

import java.util.Date;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import lombok.*;

@Builder
@Entity
@Table(name = "books")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Book extends Product {

	@Column(name = "isbn")
	private String isbn;

	@Column(name = "publisher_date")
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
	private Date publisherDate;

//	@OneToOne(cascade = CascadeType.ALL)
//	@JoinColumn(name = "publisher_id", referencedColumnName = "id")
//	private Publisher publisher;

	@ManyToOne
	@JoinColumn(name = "publisher_id")
	private Publisher publisher;


	@ManyToMany
	@JsonIgnore
	@JoinTable(
			name = "book_authors",
			joinColumns = @JoinColumn(name = "book_id"),
			inverseJoinColumns = @JoinColumn(name = "author_id"))
	@ToString.Exclude
	private Set<Author> authors;
}
