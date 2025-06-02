package com.example.vuvisa.controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.ConnectUserRequest;
import com.example.vuvisa.dtos.requests.MessageRequest;
import com.example.vuvisa.dtos.responses.MessageResponse;
import com.example.vuvisa.dtos.responses.UserResponse;
import com.example.vuvisa.services.MessageService;
import com.example.vuvisa.services.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatWebSocketController {

	SimpMessagingTemplate messagingTemplate;
	MessageService messageService;
	UserService userService;

	@MessageMapping("/user/connect") // Receives message from clients sending to /app/user/connect
	@SendTo("/topic/active-user") // Send the response to all clients subscribe to /topic/active
	public APIResponse<UserResponse> connectUser(@Payload ConnectUserRequest connectUserRequest) {
		return APIResponse.<UserResponse>builder()
				.result(userService.connectUser(connectUserRequest))
				.message("User connected successfully")
				.build();
	}

	@MessageMapping("/admin/connect") // Receives message from clients sending to /app/user/connect
	@SendTo("/topic/active-admin") // Send the response to all clients subscribe to /topic/active
	public APIResponse<UserResponse> connectAdmin(@Payload ConnectUserRequest connectUserRequest) {
		return APIResponse.<UserResponse>builder()
				.result(userService.connectAdmin(connectUserRequest))
				.message("User connected successfully")
				.build();
	}

	@MessageMapping("/user/disconnect")
	@SendTo("/topic/active-user") // Send the response to all clients subscribe to /topic/active
	public APIResponse<UserResponse> disconnectUser(@Payload ConnectUserRequest connectUserRequest) {
		return APIResponse.<UserResponse>builder()
				.result(userService.disconnectUser(connectUserRequest))
				.message("User disconnected successfully via WebSocket")
				.build();
	}

	@MessageMapping("/admin/disconnect")
	@SendTo("/topic/active-admin") // Send the response to all clients subscribe to /topic/active
	public APIResponse<UserResponse> disconnectAdmin(@Payload ConnectUserRequest connectUserRequest) {
		return APIResponse.<UserResponse>builder()
				.result(userService.disconnectAdmin(connectUserRequest))
				.message("User disconnected successfully via WebSocket")
				.build();
	}

	@MessageMapping("/user/disable")
	@SendTo("/topic/disable-user") // Send the response to all clients subscribe to /topic/active-user
	public APIResponse<UserResponse> disableUser(@Payload ConnectUserRequest connectUserRequest) throws Exception {
		return APIResponse.<UserResponse>builder()
				.result(userService.notificationInactivedUser(connectUserRequest.getId()))
				.message("Notification sent to user " + connectUserRequest.getId() + " to disable account")
				.build();
	}

	@MessageMapping("/chat.sendMessage")
	public void sendMessage(@Payload MessageRequest request) throws Exception {
		UserResponse sender = userService.getUserDetails(request.getSenderId());
		log.info("Received message from user {} to room {}", sender.getUsername(), request.getMessageRoomId());

		// Save the message
		MessageResponse message = messageService.sendMessage(request);

		// Broadcast the message to all subscribers of the room's topic
		messagingTemplate.convertAndSend("/topic/room." + request.getMessageRoomId(), message);
	}
}
