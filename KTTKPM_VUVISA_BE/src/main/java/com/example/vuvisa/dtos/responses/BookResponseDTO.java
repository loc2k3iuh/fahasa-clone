package com.example.vuvisa.dtos.responses;

import com.example.vuvisa.entities.Category;
import com.example.vuvisa.entities.ImageProduct;
import com.example.vuvisa.entities.Publisher;
import com.example.vuvisa.entities.Supplier;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookResponseDTO {
    private Long id;
    private String productName;
    private String description;
    private Double price;
    private Long stockQuantity;
    private String imageUrl;
    private String isbn;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date publisherDate;

    private Category category;
    private Supplier supplier;
    private Publisher publisher;
    private Set<AuthorResponseDTO> authors;
    private Set<ImageProduct> imageProducts;
    private Set<DiscountResponse> discounts;
}
