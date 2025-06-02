package com.example.vuvisa.dtos.responses;

import java.time.LocalDateTime;
import java.util.UUID;

import com.example.vuvisa.entities.MessageContent;
import com.example.vuvisa.enums.MessageType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
	private UUID id;
	private String content;
	private LocalDateTime dateSent;
	private MessageType messageType;
	private UUID messageRoomId;
	private Long senderId;
	private String senderUsername;
	private String senderAvatarUrl;

	public static MessageResponse fromMessageContent(MessageContent messageContent) {
		return MessageResponse.builder()
				.id(messageContent.getId())
				.content(messageContent.getContent())
				.dateSent(messageContent.getDateSent())
				.messageType(messageContent.getMessageType())
				.messageRoomId(messageContent.getMessageRoom().getId())
				.senderId(messageContent.getUser().getId())
				.senderUsername(messageContent.getUser().getUsername())
				.senderAvatarUrl(messageContent.getUser().getAvatarUrl())
				.build();
	}
}
