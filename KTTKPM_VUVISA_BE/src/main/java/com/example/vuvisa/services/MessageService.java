package com.example.vuvisa.services;

import java.util.List;
import java.util.UUID;

import com.example.vuvisa.dtos.requests.MessageRequest;
import com.example.vuvisa.dtos.responses.MessageResponse;
import com.example.vuvisa.dtos.responses.MessageRoomResponse;

public interface MessageService {
	/**
	 * Send a message to a message room
	 * @param request The message request containing content and room ID
	 * @return The created message
	 */
	MessageResponse sendMessage(MessageRequest request);

	/**
	 * Get all messages in a message room
	 * @param messageRoomId The ID of the message room
	 * @return List of messages in the room
	 */
	List<MessageResponse> getMessagesByRoomId(UUID messageRoomId);

	/**
	 * Get a message by its ID
	 * @param messageId The ID of the message
	 * @return The message
	 */
	MessageResponse getMessageById(UUID messageId);

	/**
	 * Get all message rooms for a user
	 * @param userId The ID of the user
	 * @return List of message room IDs
	 */
	List<UUID> getUserMessageRooms(Long userId);

	/**
	 * Get detailed information about all message rooms for a user
	 * @param userId The ID of the user
	 * @return List of message rooms with detailed information
	 */
	List<MessageRoomResponse> getUserMessageRoomsDetailed(Long userId);

	/**
	 * Get detailed information about a message room
	 * @param roomId The ID of the message room
	 * @return The message room with detailed information
	 */
	MessageRoomResponse getMessageRoomById(UUID roomId);

	void createMessageRoomWithAdmins(Long userId);

	void setLastSeen(Long userId);
}
