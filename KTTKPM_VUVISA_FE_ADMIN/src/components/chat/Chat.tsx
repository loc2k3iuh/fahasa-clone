import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaComments, FaSearch, FaUser } from 'react-icons/fa';
import { messageService } from '../../services/usemessageService';
import {
  onMessage,
  sendMessage,
  isConnected,
  onOnlineStatusUpdate
} from "../../socket/connectWebSocket";
import { Message, MessageRoom } from '../../types/message';
import { useUserService } from "../../services/useUserService";
import './Chat.css';
import { UserResponse } from '../../types/user';
interface ChatProps {
  currentUser: any;
}


const formatMessageDate = (dateSent: any): string => {
  try {
    if (Array.isArray(dateSent) && dateSent.length >= 6) {
      // Handle array format: [year, month, day, hour, minute, second, nano]
      const [year, month, day, hour, minute] = dateSent;
      // Create a date - note that months in JS are 0-indexed
      const date = new Date(year, month - 1, day, hour, minute);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (typeof dateSent === "string") {
      // Handle ISO string format
      return new Date(dateSent).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "Invalid date";
  } catch (error) {
    console.error("Error formatting date:", error, dateSent);
    return "Invalid date";
  }
};

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  
  const [messageRooms, setMessageRooms] = useState<MessageRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<MessageRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<UserResponse[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getOnlineUsers } = useUserService();

  // Register message handler for real-time updates
  useEffect(() => {
    if (isConnected()) {
      const unsubscribe = onMessage((newMessage) => {
        // If message belongs to current room, add it to messages
        if (currentRoom && newMessage.messageRoomId === currentRoom.id) {
          setMessages(prevMessages => {
            // Check if message already exists to avoid duplicates
            // This also checks if the message is from the current user (to avoid duplicating local messages)
            const exists = prevMessages.some(msg => 
              msg.id === newMessage.id || 
              (newMessage.senderId === currentUser?.id && 
               msg.content === newMessage.content && 
               Math.abs(new Date(msg.dateSent).getTime() - new Date(newMessage.dateSent).getTime()) < 5000)
            );
            
            console.log('WebSocket received message, exists?', exists, newMessage);
            
            if (!exists) {
              return [...prevMessages, newMessage];
            }
            return prevMessages;
          });
        } 
        
        // Cập nhật lastMessage cho phòng chat có tin nhắn mới (không tải lại toàn bộ danh sách)
        setMessageRooms(prevRooms => 
          prevRooms.map(room => {
            if (room.id === newMessage.messageRoomId) {
              // Chỉ cập nhật lastMessage của phòng nhận tin nhắn
              return {
                ...room,
                lastMessage: newMessage
              };
            }
            return room;
          })
        );
      });
      
      return unsubscribe;
    }
  }, [isConnected, currentRoom, currentUser?.id]);  // Load all chat rooms when component mounts
  useEffect(() => {
    loadChatRooms();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Fetch online users and register WebSocket listener for online status updates
  useEffect(() => {
    // Initial load of online users from API
    const loadOnlineUsers = async () => {
      try {
        const users = await getOnlineUsers();
        setOnlineUsers(users);
        console.log('Loaded online users:', users);
      } catch (error) {
        console.error('Error loading online users:', error);
      }
    };
    
    loadOnlineUsers();
      // Register WebSocket handler for real-time online status updates
    if (isConnected()) {
      const unsubscribe = onOnlineStatusUpdate((user) => {
        console.log('Online status update from WebSocket:', user);
        if (user && typeof user === 'object') {
          // Nếu user có status là ONLINE, thêm vào danh sách
          if (user.status === 'ONLINE') {
            setOnlineUsers(prevUsers => {
              // Kiểm tra xem user đã tồn tại trong danh sách chưa
              const exists = prevUsers.some(u => u.id === user.id);
              if (!exists) {
                console.log('Adding online user:', user.username);
                return [...prevUsers, user];
              }
              return prevUsers;
            });
          }
          // Nếu user có status OFFLINE hoặc khác, xóa khỏi danh sách
          else {
            setOnlineUsers(prevUsers => {
              console.log('Removing offline user:', user.id);
              return prevUsers.filter(u => u.id !== user.id);
            });
          }
        }
      });
      
      return unsubscribe;
    }
    
    // Set up periodic polling as fallback if WebSocket isn't connected
    const pollingInterval = setInterval(() => {
      if (!isConnected()) {
        loadOnlineUsers();
      }
    }, 30000); // Poll every 30 seconds if WebSocket is not connected
    
    return () => clearInterval(pollingInterval);
  }, [getOnlineUsers]);

  const loadChatRooms = async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      const rooms = await messageService.getUserMessageRoomsDetailed(currentUser.id);
      console.log("Loaded chat rooms:", rooms);
      setMessageRooms(rooms);
      
      // If there are rooms and no current room is selected, select the first one by default
      if (rooms.length > 0 && !currentRoom) {
        setCurrentRoom(rooms[0]);
        loadMessages(rooms[0].id);
      } else if (currentRoom) {
        // If a room is selected, find it in updated rooms and update it
        const updatedRoom = rooms.find(room => room.id === currentRoom.id);
        if (updatedRoom) {
          setCurrentRoom(updatedRoom);
        }
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };
  const loadMessages = async (roomId: string) => {
    try {
      setLoading(true);
      const messagesData = await messageService.getMessagesByRoomId(roomId);
      console.log(`Loaded ${messagesData.length} messages for room ${roomId}`);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }; 
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !currentRoom) return;
    
    try {
      // Create message request object
      const messageRequest = {
        content: input,
        message_room_id: currentRoom.id,
        message_type: 'TEXT',
        sender_id: currentUser?.id,
      };
      
      // Create temporary message for immediate UI display
      const tempMessage: Message = {
        id: `temp-${Date.now()}`, // Temporary ID
        content: input,
        messageRoomId: currentRoom.id,
        messageType: 'TEXT',
        senderId: currentUser?.id,
        senderUsername: currentUser?.username || 'Admin',
        dateSent: new Date().toISOString(),
      };
      
      // Show temporary message immediately
      setMessages(prev => [...prev, tempMessage]);
        // Clear input field immediately for better UX
      setInput('');      // Only send via WebSocket
      const webSocketSent = sendMessage(messageRequest);
      
      if (webSocketSent) {
        console.log('Tin nhắn đã gửi thành công qua WebSocket');
        // The real message will be received via WebSocket and processed by the WebSocket message handler
        // No need to send via API
      } else {
        console.log('Gửi qua WebSocket thất bại, không gửi tin nhắn');
        // Remove the temporary message on error since we couldn't send it
        // setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        // throw new Error('Could not send message via WebSocket');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => !msg.id.toString().startsWith('temp-')));
      alert('Could not send message. Please try again.');
    }
  };

  const handleRoomChange = (room: MessageRoom) => {
    setCurrentRoom(room);
    loadMessages(room.id);
  };

 
  
  const formatLastSeen = (dateSent: any): string => {
    try {
      if (Array.isArray(dateSent) && dateSent.length >= 6) {
        // Handle array format: [year, month, day, hour, minute, second, nano]
        const [year, month, day, hour, minute] = dateSent;
        // Create a date - note that months in JS are 0-indexed
        const date = new Date(year, month - 1, day, hour, minute);
        return date.toLocaleDateString([], { day: 'numeric', month: 'short' }) + ' ' + 
               date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (typeof dateSent === "string") {
        // Handle ISO string format
        const date = new Date(dateSent);
        return date.toLocaleDateString([], { day: 'numeric', month: 'short' }) + ' ' + 
               date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return "Invalid date";
    } catch (error) {
      console.error("Error formatting last seen date:", error, dateSent);
      return "Invalid date";
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };
  const isUserMessage = (message: Message) => {
    return message.senderId !== currentUser?.id;
  };
  const isUserOnline = (userId: number) => {
    if (!Array.isArray(onlineUsers) || onlineUsers.length === 0) {
      return false;
    }
    return onlineUsers.some(user => user.id === userId);
  };

  const filteredRooms = messageRooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.members.some(member => 
      member.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="admin-chat-container">      
    <div className="chat-sidebar">        <div className="chat-sidebar-header">
          Chat
          {!isConnected && <span className="connection-status">(Mất kết nối)</span>}
          {/* {connectionError && <span className="connection-error">{connectionError}</span>} */}
        </div>
        <div className="chat-sidebar-search">
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="chat-rooms-list">
          {loading ? (
            <div className="text-center p-3">Đang tải...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center p-3">Không tìm thấy phòng chat</div>
          ) : (
            filteredRooms.map((room) => {
              // Find the other member (not the admin) for 1:1 chats
              const otherMember = room.members.find(member => !member.isAdmin);
              
              return (
                <div 
                  key={room.id} 
                  className={`chat-room-item ${currentRoom?.id === room.id ? 'active' : ''}`}
                  onClick={() => handleRoomChange(room)}
                >
                  <div className="chat-room-avatar">                    {otherMember?.avatarUrl ? (
                      <img src={otherMember.avatarUrl} alt={otherMember.username} />
                    ) : (
                      <div className="avatar-initial">{getInitials(otherMember?.username || room.name)}</div>
                    )}
                  </div>                  <div className="chat-room-info">
                    <div className="chat-room-name">
                      <span>{room.isGroup ? room.name : (otherMember?.username || 'Unknown')}</span>
                     
                    </div>
                    <div className="chat-room-last-message">
                      {room.lastMessage?.content || 'Chưa có tin nhắn'}
                    </div>
                  </div>
                  {room.lastMessage && (
                    <div className="chat-room-time">
                      {formatMessageDate(room.lastMessage.dateSent)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <div className="chat-main">
        {currentRoom ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                {/* For 1:1 chats, show the other person's name */}
                {(() => {
                  const otherMember = currentRoom.members.find(member => !member.isAdmin);
                  console.log('Other member:', otherMember);
                  return (
                    <>                      <div className="chat-header-name">                        {currentRoom.isGroup ? currentRoom.name : (otherMember?.username || 'Unknown')}
                        {otherMember && (
                          <span className={`online-indicator ${isUserOnline(otherMember.userId) ? 'online' : 'offline'}`}></span>
                        )}
                      </div>                      <div className="chat-header-status">
                        {otherMember && !isUserOnline(otherMember.userId) ? (
                          <span className="last-seen-text">Last seen: {formatLastSeen(otherMember.lastSeen || new Date().toISOString())}</span>
                        ) : (
                          <span className="active-now">Active now</span>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            
            <div className="chat-messages">
              {loading ? (
                <div className="loading">Đang tải...</div>
              ) : messages.length === 0 ? (
                <div className="empty-chat">
                  <FaComments />
                  <div>Chưa có tin nhắn nào</div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${isUserMessage(message) ? 'received' : 'sent'}`}
                    >
                      {isUserMessage(message) && (
                        <div className="message-avatar">                          {message.senderAvatarUrl ? (
                            <img src={message.senderAvatarUrl} alt={message.senderUsername} />
                          ) : (
                            <div className="avatar-initial">{getInitials(message.senderUsername)}</div>
                          )}
                        </div>
                      )}
                      <div className="message-content">
                        {message.content}
                        <div className="message-time">{formatMessageDate(message.dateSent)}</div>
                      </div>
                    
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="chat-input">
              <textarea
                placeholder="Enter message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
              >
                <FaPaperPlane />
              </button>
            </form>
          </>
        ) : (
          <div className="empty-chat">
            <FaComments />
            <div>Chọn một cuộc hội thoại để bắt đầu</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;