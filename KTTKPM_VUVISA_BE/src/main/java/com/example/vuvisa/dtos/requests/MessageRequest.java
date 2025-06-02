package com.example.vuvisa.dtos.requests;

import java.util.UUID;

import com.example.vuvisa.enums.MessageType;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequest {
	private String content;

	@JsonProperty("message_room_id")
	private UUID messageRoomId;

	@JsonProperty("message_type")
	private MessageType messageType = MessageType.TEXT;

	@JsonProperty("sender_id")
	private Long senderId;
}
