package com.example.vuvisa.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.vuvisa.entities.MessageRoom;

@Repository
public interface MessageRoomRepository extends JpaRepository<MessageRoom, UUID> {}
