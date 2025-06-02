package com.example.vuvisa.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.*;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.MessageRequest;
import com.example.vuvisa.dtos.responses.MessageResponse;
import com.example.vuvisa.dtos.responses.MessageRoomResponse;
import com.example.vuvisa.services.MessageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("${api.prefix}/messages")
@RequiredArgsConstructor
public class MessageController {

	private final MessageService messageService;

	/**
	 * Send a message to a message room
	 * @param messageRequest The message request containing user ID and message details
	 * @return The created message
	 */
	@PostMapping
	public APIResponse<MessageResponse> sendMessage(@RequestBody MessageRequest messageRequest) {
		MessageResponse response = messageService.sendMessage(messageRequest);
		return APIResponse.<MessageResponse>builder()
				.message("Message sent successfully")
				.result(response)
				.build();
	}

	@PostMapping("/rooms/create-with-admin")
	public APIResponse<Void> createMessageRoomWithAdmins(@RequestParam Long userId) {
		messageService.createMessageRoomWithAdmins(userId);
		return APIResponse.<Void>builder()
				.message("Message room created successfully")
				.build();
	}

	/**
	 * Get all messages in a message room
	 * @param roomId The ID of the message room
	 * @return List of messages in the room
	 */
	@GetMapping("/room/{roomId}")
	public APIResponse<List<MessageResponse>> getMessagesByRoomId(@PathVariable UUID roomId) {
		List<MessageResponse> messages = messageService.getMessagesByRoomId(roomId);
		return APIResponse.<List<MessageResponse>>builder()
				.message("Messages retrieved successfully")
				.result(messages)
				.build();
	}

	/**
	 * Get a message by its ID
	 * @param messageId The ID of the message
	 * @return The message
	 */
	@GetMapping("/{messageId}")
	public APIResponse<MessageResponse> getMessageById(@PathVariable UUID messageId) {
		MessageResponse message = messageService.getMessageById(messageId);
		return APIResponse.<MessageResponse>builder()
				.message("Message retrieved successfully")
				.result(message)
				.build();
	}

	/**
	 * Get all message rooms for the user
	 * @param userId The user ID
	 * @return List of message room IDs
	 */
	@GetMapping("/rooms")
	public APIResponse<List<UUID>> getUserMessageRooms(@RequestParam Long userId) {
		List<UUID> roomIds = messageService.getUserMessageRooms(userId);
		return APIResponse.<List<UUID>>builder()
				.message("Rooms retrieved successfully")
				.result(roomIds)
				.build();
	}

	/**
	 * Get detailed information about all message rooms for the user
	 * @param userId The user ID
	 * @return List of message rooms with detailed information
	 */
	@GetMapping("/rooms/detailed")
	public APIResponse<List<MessageRoomResponse>> getUserMessageRoomsDetailed(@RequestParam Long userId) {
		List<MessageRoomResponse> rooms = messageService.getUserMessageRoomsDetailed(userId);
		return APIResponse.<List<MessageRoomResponse>>builder()
				.message("Rooms retrieved successfully")
				.result(rooms)
				.build();
	}

	/**
	 * Get detailed information about a message room
	 * @param roomId The ID of the message room
	 * @return The message room with detailed information
	 */
	@GetMapping("/room/{roomId}/detailed")
	public APIResponse<MessageRoomResponse> getMessageRoomById(@PathVariable UUID roomId) {
		MessageRoomResponse room = messageService.getMessageRoomById(roomId);
		return APIResponse.<MessageRoomResponse>builder()
				.message("Room retrieved successfully")
				.result(room)
				.build();
	}
}
