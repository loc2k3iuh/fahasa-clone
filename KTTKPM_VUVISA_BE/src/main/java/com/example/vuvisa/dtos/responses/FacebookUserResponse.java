package com.example.vuvisa.dtos.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class FacebookUserResponse {
	String id;
	String name;
	String email;

	@JsonProperty("first_name")
	String firstName;

	@JsonProperty("last_name")
	String lastName;

	@JsonProperty("picture")
	FacebookPicture picture;

	@Data
	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
	public static class FacebookPicture {
		Data data;

		@lombok.Data
		@Getter
		@Setter
		@NoArgsConstructor
		@AllArgsConstructor
		public static class Data {
			String url;
			int height;
			int width;

			@JsonProperty("is_silhouette")
			boolean isSilhouette;
		}
	}
}
