package com.example.vuvisa.dtos.responses;

import com.example.vuvisa.entities.Product;
import com.example.vuvisa.entities.Publisher;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;
import java.util.stream.Collectors;

@Data
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PublisherResponse {
    Long id;
    String publisherName;
    String description;

    public static PublisherResponse fromPublisher(Publisher publisher) {
        return PublisherResponse.builder()
                .id(publisher.getId())
                .publisherName(publisher.getPublisherName())
                .description(publisher.getDescription())
                .build();

    }
}
