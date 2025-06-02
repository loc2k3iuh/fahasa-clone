package com.example.vuvisa.entities;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@Table(name = "message_rooms")
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MessageRoom {
	@Id
	@GeneratedValue(generator = "UUID", strategy = GenerationType.AUTO)
	private UUID id;

	private String name;

	private Boolean isGroup;

	@CreatedDate
	private LocalDateTime createdDate;

	@ManyToOne
	@JoinColumn(name = "createdBy")
	private User createdBy;

	@OneToMany(mappedBy = "messageRoom", cascade = CascadeType.ALL)
	private List<MessageRoomMember> members;

	@OneToMany(mappedBy = "messageRoom", cascade = CascadeType.ALL)
	private List<MessageContent> messageContents;
}
