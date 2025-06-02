package com.example.vuvisa.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.example.vuvisa.enums.MessageType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "message_contents")
@EntityListeners(AuditingEntityListener.class)
public class MessageContent {
	@Id
	@GeneratedValue(generator = "UUID", strategy = GenerationType.AUTO)
	private UUID id;

	private String content;

	@CreatedDate
	private LocalDateTime dateSent;

	@Enumerated(EnumType.STRING)
	private MessageType messageType;

	@ManyToOne
	@JoinColumn(name = "message_room_id")
	private MessageRoom messageRoom;

	@ManyToOne
	@JoinColumn(name = "username")
	private User user;
}
