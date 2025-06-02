package com.example.vuvisa.dtos.responses;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.example.vuvisa.entities.MessageRoom;
import com.example.vuvisa.entities.MessageRoomMember;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageRoomResponse {
	private UUID id;
	private String name;
	private Boolean isGroup;
	private LocalDateTime createdDate;
	private UserResponse createdBy;
	private List<MessageRoomMemberResponse> members;
	private MessageResponse lastMessage;

	public static MessageRoomResponse fromMessageRoom(MessageRoom messageRoom, MessageResponse lastMessage) {
		return MessageRoomResponse.builder()
				.id(messageRoom.getId())
				.name(messageRoom.getName())
				.isGroup(messageRoom.getIsGroup())
				.createdDate(messageRoom.getCreatedDate())
				.createdBy(UserResponse.fromUser(messageRoom.getCreatedBy()))
				.members(messageRoom.getMembers().stream()
						.map(MessageRoomMemberResponse::fromMessageRoomMember)
						.collect(Collectors.toList()))
				.lastMessage(lastMessage)
				.build();
	}

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class MessageRoomMemberResponse {
		private Long userId;
		private String username;
		private String avatarUrl;
		private Boolean isAdmin;
		private LocalDateTime lastSeen;

		public static MessageRoomMemberResponse fromMessageRoomMember(MessageRoomMember member) {
			return MessageRoomMemberResponse.builder()
					.userId(member.getUserId())
					.username(member.getUser().getUsername())
					.avatarUrl(member.getUser().getAvatarUrl())
					.isAdmin(member.getIsAdmin())
					.lastSeen(member.getLastSeen())
					.build();
		}
	}
}
