package com.example.vuvisa.entities;

import java.io.Serializable;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageRoomMemberKey implements Serializable {
	private Long userId;
	private UUID messageRoomId;
}
