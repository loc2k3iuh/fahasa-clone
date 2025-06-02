package com.example.vuvisa.services.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.vuvisa.dtos.requests.MessageRequest;
import com.example.vuvisa.dtos.responses.MessageResponse;
import com.example.vuvisa.dtos.responses.MessageRoomResponse;
import com.example.vuvisa.entities.MessageContent;
import com.example.vuvisa.entities.MessageRoom;
import com.example.vuvisa.entities.MessageRoomMember;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.enums.RoleType;
import com.example.vuvisa.exceptions.AppException;
import com.example.vuvisa.exceptions.ErrorCode;
import com.example.vuvisa.repositories.MessageContentRepository;
import com.example.vuvisa.repositories.MessageRoomMemberRepository;
import com.example.vuvisa.repositories.MessageRoomRepository;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.services.MessageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageServiceImpl implements MessageService {

	private final MessageContentRepository messageContentRepository;
	private final MessageRoomRepository messageRoomRepository;
	private final MessageRoomMemberRepository messageRoomMemberRepository;
	private final UserRepository userRepository;

	@Override
	@Transactional
	public MessageResponse sendMessage(MessageRequest request) {
		// Find the message room
		MessageRoom messageRoom = messageRoomRepository
				.findById(request.getMessageRoomId())
				.orElseThrow(() -> new AppException(ErrorCode.MESSAGE_ROOM_NOT_FOUND));

		// Check if the user is a member of the message room
		boolean isMember = messageRoom.getMembers().stream()
				.anyMatch(member -> member.getUserId().equals(request.getSenderId()));

		if (!isMember) {
			throw new AppException(ErrorCode.USER_NOT_MEMBER_OF_ROOM);
		}

		// Create and save the message
		MessageContent messageContent = MessageContent.builder()
				.content(request.getContent())
				.messageType(request.getMessageType())
				.messageRoom(messageRoom)
				.user(userRepository
						.findById(request.getSenderId())
						.orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)))
				.build();

		messageContent = messageContentRepository.save(messageContent);

		return MessageResponse.fromMessageContent(messageContent);
	}

	@Override
	public List<MessageResponse> getMessagesByRoomId(UUID messageRoomId) {
		// Find the message room
		MessageRoom messageRoom = messageRoomRepository
				.findById(messageRoomId)
				.orElseThrow(() -> new AppException(ErrorCode.MESSAGE_ROOM_NOT_FOUND));

		// Get all messages in the room
		List<MessageContent> messages = messageContentRepository.findByMessageRoomOrderByDateSentAsc(messageRoom);

		// Convert to DTOs
		return messages.stream().map(MessageResponse::fromMessageContent).collect(Collectors.toList());
	}

	@Override
	public MessageResponse getMessageById(UUID messageId) {
		MessageContent messageContent = messageContentRepository
				.findById(messageId)
				.orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

		return MessageResponse.fromMessageContent(messageContent);
	}

	@Override
	public List<UUID> getUserMessageRooms(Long userId) {
		// Find all message room members for the user
		List<MessageRoomMember> members = messageRoomMemberRepository.findAll().stream()
				.filter(member -> member.getUserId().equals(userId))
				.collect(Collectors.toList());

		// Extract the message room IDs
		return members.stream().map(MessageRoomMember::getMessageRoomId).collect(Collectors.toList());
	}

	@Override
	public List<MessageRoomResponse> getUserMessageRoomsDetailed(Long userId) {
		// Get all message room IDs for the user
		List<UUID> roomIds = getUserMessageRooms(userId);

		// Get detailed information for each room
		return roomIds.stream().map(this::getMessageRoomById).collect(Collectors.toList());
	}

	@Override
	public MessageRoomResponse getMessageRoomById(UUID roomId) {
		// Find the message room
		MessageRoom messageRoom = messageRoomRepository
				.findById(roomId)
				.orElseThrow(() -> new AppException(ErrorCode.MESSAGE_ROOM_NOT_FOUND));

		// Get the last message in the room
		List<MessageContent> messages = messageContentRepository.findByMessageRoomOrderByDateSentAsc(messageRoom);
		MessageResponse lastMessage =
				messages.isEmpty() ? null : MessageResponse.fromMessageContent(messages.get(messages.size() - 1));

		// Create the response
		return MessageRoomResponse.fromMessageRoom(messageRoom, lastMessage);
	}

	@Override
	@Transactional
	public void createMessageRoomWithAdmins(Long userId) {

		User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

		// Create a new message room
		MessageRoom messageRoom = MessageRoom.builder()
				.name(user.getUsername())
				.isGroup(true)
				.createdDate(LocalDateTime.now())
				.createdBy(user)
				.build();

		// Save the message room
		messageRoom = messageRoomRepository.save(messageRoom);

		// Add the user to the message room
		MessageRoomMember userMember = MessageRoomMember.builder()
				.messageRoomId(messageRoom.getId())
				.messageRoom(messageRoom)
				.userId(user.getId())
				.user(user)
				.isAdmin(false)
				.lastSeen(LocalDateTime.now())
				.build();

		messageRoomMemberRepository.save(userMember);

		// Find all admin users
		List<User> adminUsers = userRepository.findByRole(RoleType.ADMIN);

		// Add all admin users to the message room
		for (User adminUser : adminUsers) {
			MessageRoomMember adminMember = MessageRoomMember.builder()
					.messageRoomId(messageRoom.getId())
					.messageRoom(messageRoom)
					.userId(adminUser.getId())
					.user(adminUser)
					.isAdmin(true)
					.lastSeen(LocalDateTime.now())
					.build();

			messageRoomMemberRepository.save(adminMember);
		}
	}

	@Override
	public void setLastSeen(Long userId) {
		MessageRoomMember roomMember = messageRoomMemberRepository.findByUserId(userId);
		if (roomMember.getLastSeen() == null) {
			roomMember.setLastSeen(LocalDateTime.now());
			messageRoomMemberRepository.save(roomMember);
		} else {
			roomMember.setLastSeen(null);
			messageRoomMemberRepository.save(roomMember);
		}
	}
}
