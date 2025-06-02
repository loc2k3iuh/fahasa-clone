package com.example.vuvisa.dtos.requests;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreatePublisherRequest {

    @NotBlank(message = "PUBLISHER_NAME_REQUIRED")
    @Size(min = 2, message = "PUBLISHER_NAME_MIN_2")
    String publisherName;

    @Size(max = 400, message = "DESCRIPTION_MAX_400_CHARS")
    String description;

    @Nullable
    Set<Long> productIds;
}
