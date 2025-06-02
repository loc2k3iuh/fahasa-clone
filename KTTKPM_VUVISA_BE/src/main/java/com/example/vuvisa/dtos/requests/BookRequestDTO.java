package com.example.vuvisa.dtos.requests;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.util.Date;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookRequestDTO {
    private String productName;
    private String description;
    private Double price;
    private Long stockQuantity;
    private String imageUrl;

    private CategoryRequestDTO category;
    private SupplierRequestDTO supplier;
    private PublisherRequestDTO publisher;

    private String isbn;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date publisherDate;

    private List<AuthorRequestDTO> authors;
    private List<ImageProductRequestDTO> imageProducts;


}

