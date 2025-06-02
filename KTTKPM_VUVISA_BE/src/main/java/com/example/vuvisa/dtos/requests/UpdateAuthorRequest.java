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
public class UpdateAuthorRequest {
    @NotBlank(message = "AUTHOR_NAME_REQUIRED")
    @Size(min = 2,message = "AUTHOR_NAME_MIN_2_CHARTS")
    String authorName;
    @Size(max = 400,message = "DESCRIPTION_MAX_400_CHARS")
    String description;
    @Nullable
    Set<Long> bookIds; //có thể null / rỗng
}
