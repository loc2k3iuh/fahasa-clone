package com.example.vuvisa.dtos.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FacebookUserRequest {

	String email;
	String name;
	String picture;
}
