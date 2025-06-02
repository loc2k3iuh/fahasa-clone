# VUVISA Real-Time Chat Feature

This document provides information on the implementation and usage of the real-time chat feature in the VUVISA e-commerce application.

## Overview

The real-time chat feature allows users to communicate with admin support in real-time. The implementation uses WebSockets via STOMP protocol (Simple Text Oriented Messaging Protocol) and SockJS for browser compatibility.

## Implementation Details

### Technology Stack

- **Frontend**: React with TypeScript
- **WebSocket Library**: @stomp/stompjs and sockjs-client
- **Backend**: Spring Boot with Spring WebSocket

### Key Components

1. **WebSocketService**: Manages the WebSocket connection, message sending/receiving, and reconnection logic.
2. **WebSocketContext**: React Context to manage WebSocket state across the application.
3. **ChatIcon Component**: UI component for the chat interface.
4. **MessageService**: API service for message-related operations.

## Testing the Feature

### Using the Test HTML Page

A standalone HTML test page is included to test the WebSocket functionality directly:

1. Ensure the backend server is running on port 8080
2. Navigate to the project root directory
3. Open `chat-test.html` in a web browser or run the `test-chat.bat` file
4. Enter a user ID and room ID, then click "Connect"
5. Once connected, you can send and receive messages

### Testing in the Application

1. Ensure you're logged in to the application
2. Click on the chat icon in the bottom-right corner of any page
3. Start typing and sending messages
4. Messages are sent in real-time to admin users who can respond

## Troubleshooting

### Connection Issues

If you're experiencing connection issues:

1. Verify the backend WebSocket endpoint is available at `/ws`
2. Check that the backend is properly configured for CORS if testing from a different origin
3. Examine browser console logs for WebSocket errors
4. The WebSocket service includes automatic reconnection logic with exponential backoff

### Message Delivery Issues

If messages aren't being delivered:

1. Check that you're subscribed to the correct topics:
   - Personal messages: `/user/{userId}/queue/messages`
   - Room messages: `/topic/room.{roomId}`
2. Verify the destination for sending messages matches the backend controller: `/app/chat.sendMessage`
3. Ensure the message format matches what the server expects

## Architecture

### Message Flow

1. User sends a message through the chat interface
2. Message is sent via WebSocket to the backend
3. Backend processes the message and broadcasts it to all subscribers of the room
4. Recipients receive the message in real-time

### Reconnection Strategy

The WebSocket service includes a robust reconnection strategy:

1. If connection is lost, it attempts to reconnect automatically
2. Uses exponential backoff to avoid overwhelming the server
3. Retries up to a maximum number of attempts
4. Provides feedback to the user during reconnection attempts

## Future Improvements

- Implement message delivery acknowledgments
- Add typing indicators
- Support for file attachments
- Message read receipts
- Message encryption
- Push notifications for offline users

## Code Structure

- `src/services/websocketService.ts`: WebSocket connection management
- `src/contexts/WebSocketContext.tsx`: React Context for WebSocket state
- `src/components/ChatIcon.tsx`: Chat UI component
- `src/types/message.ts`: TypeScript interfaces for messages
- `src/services/messageService.ts`: API service for message operations

---

## Developer Notes

The WebSocket implementation replaces the previous mock implementation. The main differences are:

1. Real-time connection to backend instead of simulated messages
2. Robust reconnection handling
3. Integration with the backend's WebSocket authentication
4. Proper error handling and user feedback
