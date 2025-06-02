package com.example.vuvisa.repositories;

import com.example.vuvisa.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.vuvisa.entities.MessageRoomMember;
import com.example.vuvisa.entities.MessageRoomMemberKey;

@Repository
public interface MessageRoomMemberRepository extends JpaRepository<MessageRoomMember, MessageRoomMemberKey> {

	MessageRoomMember findByUserId(Long userId);
}
