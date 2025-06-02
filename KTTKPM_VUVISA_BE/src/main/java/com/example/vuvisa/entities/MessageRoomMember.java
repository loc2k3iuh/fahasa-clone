package com.example.vuvisa.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(MessageRoomMemberKey.class)
@Table(name = "message_room_members")
public class MessageRoomMember {
	@Id
	@Column(name = "message_room_id")
	private UUID messageRoomId;

	@ManyToOne
	@JoinColumn(name = "message_room_id", insertable = false, updatable = false)
	private MessageRoom messageRoom;

	@Id
	@Column(name = "user_id")
	private Long userId;

	@ManyToOne
	@JoinColumn(name = "user_id", insertable = false, updatable = false)
	private User user;

	private Boolean isAdmin;

	private LocalDateTime lastSeen;
}
