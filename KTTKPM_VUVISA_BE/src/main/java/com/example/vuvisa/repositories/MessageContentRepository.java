package com.example.vuvisa.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.vuvisa.entities.MessageContent;
import com.example.vuvisa.entities.MessageRoom;

@Repository
public interface MessageContentRepository extends JpaRepository<MessageContent, UUID> {
	List<MessageContent> findByMessageRoomOrderByDateSentAsc(MessageRoom messageRoom);

	List<MessageContent> findByMessageRoomIdOrderByDateSentAsc(UUID messageRoomId);
}
