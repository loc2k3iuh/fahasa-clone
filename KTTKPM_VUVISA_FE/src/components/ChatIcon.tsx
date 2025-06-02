import React, { useState, useEffect, useRef, useCallback } from "react";

const API_BASE = "http://localhost:9090/vuvisa/api/v1";

interface AIResponse {
  chatResponse: string;
  results: any[];
}

// Helper function to format dates that can come as arrays or ISO strings
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

import messageService from "../services/messageService";

import {
  onMessage,
  sendMessage,
  isConnected,
  onOnlineStatusUpdate,
} from "../socket/connectWebSocket";

import {
  Message,
  MessageRequest,
  MessageRoom,

} from "../types/message";
import "./ChatIcon.css";
import { UserResponse } from "../types/user";
import { useUserService } from "../services/useUserService";
import { toast } from "sonner";

// Giả sử chúng ta có một hàm để lấy thông tin user hiện tại từ localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
    return null;
  }
};

const ChatIcon: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [currentRoom, setCurrentRoom] = useState<MessageRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminOnline, setAdminOnline] = useState(false);
  const [onlineAdmins, setOnlineAdmins] = useState<UserResponse[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = getCurrentUser();
  const { getOnlineAdmins } = useUserService(); // Scroll đến cuối cùng của tin nhắn

  // Thêm state để theo dõi chế độ chat
  const [chatMode, setChatMode] = useState<'admin' | 'ai'>('admin');
  const [isSearching, setIsSearching] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      // Scroll với behavior smooth cho trải nghiệm mượt mà
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });

      // Đảm bảo cuộn xuống trong trường hợp scrollIntoView không hoạt động tốt
      const container = document.getElementById("chat-messages-container");
      if (container) {
        // Thêm cuộn với setTimeout để đảm bảo nó luôn thực hiện sau khi DOM đã được cập nhật
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
        }, 50);
      }
    }
  }, []); 
  
  // Lấy tin nhắn từ phòng chat
  const loadMessages = useCallback(
    async (roomId: string) => {
      try {
        setLoading(true);
        setError(null);
        const messages = await messageService.getMessagesByRoomId(roomId);
        setChatMessages(messages);
        console.log("Loaded messages:", messages);
     
        setUnreadCount(0);
      } catch (error) {
        console.error("Error loading messages:", error);
        setError("Không thể tải tin nhắn. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    },
    [scrollToBottom]
  );

  // Thêm function xử lý chat với AI
  const handleAIChat = async (message: string) => {
    try {
      setIsSearching(true);

      const searchingMessage: Message = {
        id: `ai-searching-${Date.now()}`,
        content: 'Đang tìm kiếm...',
        dateSent: new Date().toISOString(),
        messageType: 'TEXT',
        messageRoomId: 'ai-chat',
        senderId: -1,
        senderUsername: 'VUVISA AI'
      };

      setChatMessages(prev => [...prev, searchingMessage]);
      scrollToBottom();

      const response = await fetch(`${API_BASE}/recommend?userNeed=${encodeURIComponent(message)}`);
      const data: AIResponse = await response.json();

      setChatMessages(prev => prev.filter(msg => msg.id !== searchingMessage.id));

      let content = '';

      if (data.results && data.results.length > 0) {
        // Nếu có kết quả sản phẩm, hiển thị slider
        const productSlider = `
          <div class="product-slider">
            <div class="slider-container">
              ${data.results.map((p: any) => `
                <div class="product-slide">
                  <a href="/product?id=${p.id}" class="product-link">
                    <img src="${p.imageUrl}" alt="${p.productName}" class="product-image"/>
                    <div class="product-info">
                      <h4 class="product-name">${p.productName}</h4>
                      <p class="product-price">${p.price.toLocaleString()}đ</p>
                    </div>
                  </a>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        
        content = `
          <p>${data.chatResponse}</p>
          ${productSlider}
          <p class="mt-2">Bạn có thể vuốt sang trái/phải để xem thêm sản phẩm.</p>
        `;
      } else {
        // Nếu không có kết quả sản phẩm, chỉ hiển thị response text
        content = `${data.chatResponse}`;
      }
      
      // Tạo tin nhắn phản hồi từ AI
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        content: content,
        dateSent: new Date().toISOString(),
        messageType: 'TEXT',
        messageRoomId: 'ai-chat',
        senderId: -1,
        senderUsername: 'VUVISA AI'
      };

      setChatMessages(prev => [...prev, aiResponse]);
      scrollToBottom();

      // Khởi tạo slider sau khi tin nhắn được render
      if (data.results && data.results.length > 0) {
        setTimeout(() => {
          initializeSlider();
        }, 100);
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      setError('Không thể lấy gợi ý từ AI. Vui lòng thử lại sau.');
    } finally {
      setIsSearching(false);
    }
  };

  // Thêm hàm khởi tạo slider
  const initializeSlider = () => {
    const slider = document.querySelector('.slider-container');
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    slider.addEventListener('mousedown', (e: Event) => {
      const mouseEvent = e as MouseEvent;
      isDown = true;
      slider.classList.add('active');
      startX = mouseEvent.pageX - (slider as HTMLElement).offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
      isDown = false;
      slider.classList.remove('active');
    });

    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.classList.remove('active');
    });

    slider.addEventListener('mousemove', (e: Event) => {
      if (!isDown) return;
      e.preventDefault();
      const mouseEvent = e as MouseEvent;
      const x = mouseEvent.pageX - (slider as HTMLElement).offsetLeft;
      const walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    });
  };
  
  // Sử dụng ref để tránh các request trùng lặp
  const isInitializingRef = useRef(false);

  // Tải hoặc tạo phòng chat khi mở chat
  const initializeChat = useCallback(async () => {
    if (!currentUser) {
      setError("Vui lòng đăng nhập để sử dụng tính năng chat.");
      return;
    }

    // Ngăn nhiều request trùng lặp
    if (isInitializingRef.current) {
      console.log("Đã có một request đang xử lý, bỏ qua request mới");
      return;
    }

    isInitializingRef.current = true;

    try {
      setLoading(true);
      setError(null);

      console.log("Đang tải phòng chat cho user ID:", currentUser.id);

      // Lấy danh sách phòng chat của người dùng với timeout
      const rooms = await messageService.getUserMessageRoomsDetailed(
        currentUser.id
      );

      // Tìm phòng chat với admin
      let adminRoom = rooms.find((room) =>
        room.members.some((member) => member.isAdmin)
      );

      // Nếu chưa có phòng chat với admin, tạo mới
      if (!adminRoom) {
        try {
          adminRoom = await messageService.createChatRoomWithAdmin(
            currentUser.id
          );
        } catch (err) {
          console.error("Error creating chat room with admin:", err);
          // Nếu không tạo được phòng chat, thêm tin nhắn chào mừng
          setChatMessages([
            {
              id: "welcome",
              content: "Xin chào! VUVISA có thể giúp gì cho bạn?",
              dateSent: new Date().toISOString(),
              messageType: "TEXT",
              messageRoomId: "temp-room",
              senderId: 1,
              senderUsername: "Admin VUVISA",
            },
          ]);
          setLoading(false);
          isInitializingRef.current = false;
          return;
        }
      }

      // Lưu phòng chat hiện tại
      setCurrentRoom(adminRoom);

      // Tải tin nhắn từ phòng chat
      if (adminRoom) {
        await loadMessages(adminRoom.id);
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      setError("Không thể khởi tạo chat. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
      isInitializingRef.current = false;
    }
  }, [currentUser, loadMessages]);
  
  const hasInitializedThisSessionRef = useRef(false); // ADDED: Ref to track initialization per session

  // Gửi tin nhắn
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (chatMode === 'ai') { 

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: message,
        dateSent: new Date().toISOString(),
        messageType: 'TEXT',
        messageRoomId: 'ai-chat',
        senderId: currentUser?.id || 0,
        senderUsername: currentUser?.username || 'Bạn',
      };

      setChatMessages(prev => [...prev, userMessage]);
      setMessage('');
      await handleAIChat(message);

    }else {

      if (!message.trim() ) {
        toast.error("Vui lòng nhập tin nhắn và đảm bảo bạn đã đăng nhập.");
        return;
      }

      if (!currentUser || !currentRoom) {
        toast.error("Bạn chưa đăng nhập hoặc tính năng chat đang bị lỗi.");
        return;
      }

      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        content: message,
        dateSent: new Date().toISOString(),
        messageType: "TEXT",
        messageRoomId: currentRoom.id,
        senderId: currentUser.id,
        senderUsername: currentUser.username || "Bạn",
      };

      // Thêm tin nhắn vào danh sách
      setChatMessages((prev) => [...prev, tempMessage]);
      scrollToBottom();

      // Xóa nội dung input
      setMessage("");

      try {
        // Chuẩn bị tin nhắn để gửi
        const messageRequest: MessageRequest = {
          content: tempMessage.content,
          message_room_id: currentRoom.id,
          message_type: "TEXT",
          sender_id: currentUser?.id,
        }; // Lưu id tin nhắn tạm để tránh hiển thị lặp lại khi nhận từ WebSocket
        // Không cần lưu tempMessageId vì chúng ta đã có cơ chế kiểm tra tin nhắn trùng lặp

        // Gửi tin nhắn qua WebSocket
        const sent = sendMessage(messageRequest);
        // Nếu không gửi được qua WebSocket thì gửi qua REST API như backup
        if (!sent) {
          console.log("Gửi qua WebSocket thất bại, chuyển qua API...");
          // const result = await messageService.sendMessage(messageRequest);

          // // Cập nhật id của tin nhắn tạm thời nếu gửi thành công qua API
          // if (result && result.id) {
          //   setChatMessages((prev) =>
          //     prev.map((msg) => (msg.id === tempMessage.id ? { ...result } : msg))
          //   );
          // }
        } else {
          console.log("Tin nhắn đã gửi thành công qua WebSocket, chờ phản hồi");
          // Tin nhắn đã được gửi qua WebSocket, tin nhắn tạm đã được thêm vào UI
          // Tin nhắn thực tế sẽ được nhận qua WebSocket và xử lý theo logic dedupe ở trên
          setChatMessages((prev) => prev.filter(msg => msg.id !== tempMessage.id));
          throw new Error('Could not send message via WebSocket');
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setError("Không thể gửi tin nhắn. Vui lòng thử lại sau.");

        // Xóa tin nhắn tạm thời khỏi UI nếu gửi thất bại
        setChatMessages((prev) =>
          prev.filter((msg) => msg.id !== tempMessage.id)
        );
      }

    }
  }; 
  // Fetch online admin status when component mounts or when chat opens
  useEffect(() => {
    const fetchOnlineAdmins = async () => {
      try {
        const admins = await getOnlineAdmins();
        console.log("Initial fetch online admins:", admins);
        setOnlineAdmins(admins || []);
        setAdminOnline(admins && admins.length > 0);
      } catch (error) {
        console.error("Failed to fetch online admins:", error);
        setOnlineAdmins([]);
        setAdminOnline(false);
      }
    };

    fetchOnlineAdmins();

    // Set up WebSocket listener for admin status
    const unsubscribeStatus = onOnlineStatusUpdate((adminData) => {
      console.log("Received admin online status update:", adminData);

      if (Array.isArray(adminData)) {
        // If it's an array, update with the array
        console.log("Admin data is array, length:", adminData.length);
        setOnlineAdmins(adminData);
        setAdminOnline(adminData.length > 0);
      } else if (adminData && typeof adminData === "object") {
        // If it's a single admin object
        console.log("Admin data is single object:", adminData);

        // Check if the admin's status is online
        if (adminData.status === "ONLINE") {
          // Add to existing admins if not already present
          setOnlineAdmins((prev) => {
            // Check if admin already exists in the array
            const exists = prev.some((admin) => admin.id === adminData.id);
            if (!exists) {
              return [...prev, adminData];
            }
            return prev;
          });
          setAdminOnline(true);
        } else if (adminData.status === "OFFLINE") {
          // Remove admin from list if status is OFFLINE
          setOnlineAdmins((prev) =>
            prev.filter((admin) => admin.id !== adminData.id)
          );
          // Check if there are any admins left
          setOnlineAdmins((prev) => {
            setAdminOnline(prev.length > 0);
            return prev;
          });
        }
      } else if (adminData === null || adminData === undefined) {
        // Handle case when no admins are online
        console.log("No admin data received");
        setOnlineAdmins([]);
        setAdminOnline(false);
      }
    });

    return () => {
      unsubscribeStatus();
    };
  }, [getOnlineAdmins]);
  // Effect cho việc cuộn xuống khi chat được mở
  useEffect(() => {
    if (isChatOpen && chatMessages.length > 0) {
      // Đợi một chút để DOM được cập nhật hoàn toàn
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    }
  }, [isChatOpen, scrollToBottom, chatMessages.length]);

  // Effect 1: Initialize chat session (fetch room, load initial messages)
  useEffect(() => {
    if (isChatOpen && currentUser && !hasInitializedThisSessionRef.current) {
      initializeChat();
      hasInitializedThisSessionRef.current = true;
    }
    // Reset when chat is closed, so it re-initializes on next open
    if (!isChatOpen) {
      hasInitializedThisSessionRef.current = false;
    }
  }, [isChatOpen, currentUser, initializeChat]);

  // Effect 2: Handle WebSocket message subscription
  useEffect(() => {
    if (isChatOpen && currentUser) {
      // Lắng nghe tin nhắn mới
      const unsubscribe = onMessage((newMessage) => {
        // Chỉ xử lý tin nhắn từ phòng chat hiện tại
        // currentRoom will be from the closure and updated when this effect re-runs due to currentRoom changing
        if (currentRoom && newMessage.messageRoomId === currentRoom.id) {
          setChatMessages((prev) => {
            // Kiểm tra xem message có ID trùng đã tồn tại chưa
            const messageExists = prev.some(
              (msg) =>
                (newMessage.id && msg.id === newMessage.id) ||
                (msg.content === newMessage.content &&
                  msg.senderId === newMessage.senderId &&
                  Math.abs(
                    new Date(msg.dateSent).getTime() -
                      new Date(newMessage.dateSent).getTime()
                  ) < 5000)
            );

            if (messageExists) {
              // Nếu tin nhắn đã tồn tại, không thêm lại
              return prev;
            }

            console.log("Thêm tin nhắn mới vào danh sách:", newMessage);
            // Nếu là tin nhắn mới, thêm vào danh sách
            return [...prev, newMessage];
          });

          // Tăng số tin nhắn chưa đọc nếu chat đang đóng
          // This check is valid as onMessage is a global listener setup
          if (!isChatOpen) {
            setUnreadCount((prev) => prev + 1);
          }

          scrollToBottom();
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [isChatOpen, currentUser, currentRoom, scrollToBottom]); // Dependencies include currentRoom

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages, scrollToBottom]);
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadCount(0);
      // Khi mở chat, đợi một chút để nội dung được render rồi cuộn xuống
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isChatOpen && (
        <div className="bg-white rounded-lg shadow-xl mb-4 w-80 sm:w-96 overflow-hidden chat-window">
          <div className="bg-[#C92127] text-white p-4 flex justify-between items-center mb-2">
            {" "}
            <div className="flex items-center">
              <h3 className="font-medium">VUVISA Chat</h3>
              {chatMode === 'admin' ? ( <>
                {adminOnline && (
                  <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    {onlineAdmins.length > 1
                      ? `${onlineAdmins.length} Admin đang trực tuyến`
                      : "Admin đang trực tuyến"}
                  </span>
                )}
                {!adminOnline && (
                  <span className="ml-2 text-xs bg-gray-500 text-white px-2 py-0.5 rounded-full">
                    Admin không trực tuyến
                  </span>
                )}
              </>
              ): (
              <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                AI Assistant - 24/7
              </span>
            )}
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 cursor-pointer"

            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>{" "}

          <div className="flex items-center justify-center bg-[#a71b20] rounded-full p-1 mx-2">
            <button
              className={`px-4 py-1 rounded-full text-sm transition-all cursor-pointer ${
                chatMode === 'admin' 
                  ? 'bg-white text-[#C92127]' 
                  : 'text-white hover:bg-[#8B1418]'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={async () => {
                if (loading) return;
                setChatMode('admin');
                setChatMessages([]);
                initializeChat();
                // setChatMessages([
                // {
                //   id: "welcome",
                //   content: "Xin chào! VUVISA có thể giúp gì cho bạn?",
                //   dateSent: new Date().toISOString(),
                //   messageType: "TEXT",
                //   messageRoomId: "temp-room",
                //   senderId: 1,
                //   senderUsername: "Admin VUVISA",
                // },
                // ]);
              
              }}
              disabled={loading}
            >
              Chat với Admin
            </button>
            <button
              className={`px-4 py-1 rounded-full text-sm transition-all cursor-pointer ${
                chatMode === 'ai' 
                  ? 'bg-white text-[#C92127]' 
                  : 'text-white hover:bg-[#8B1418]'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => {
                if (loading) return;
                setChatMode('ai');
                setChatMessages([]);
                setChatMessages([{
                  id: 'ai-welcome',
                  content: 'Xin chào! Tôi là VUVISA AI Assistant. Tôi có thể giúp bạn tìm kiếm sản phẩm phù hợp. Hãy mô tả sản phẩm bạn cần!',
                  dateSent: new Date().toISOString(),
                  messageType: 'TEXT',
                  messageRoomId: 'ai-chat',
                  senderId: -1,
                  senderUsername: 'VUVISA AI'
                }]);
              }}
              disabled={loading}
            >
              VUVISA AI
            </button>
          </div>

          <div
            className="h-80 overflow-y-auto p-4 bg-gray-50 flex-grow"
            id="chat-messages-container"
          >
            {loading && (
              <div className="flex justify-center my-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C92127]"></div>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                <p>{error}</p>
              </div>
            )}


            {!currentUser && chatMode === 'admin' && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                <p>Vui lòng đăng nhập để sử dụng tính năng chat.</p>
              </div>
            )}

            {chatMessages.length === 0 && !loading && !error && currentUser && (
              <div className="text-center text-gray-500 mt-8">
                <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            )}

            <div className="space-y-3">
              {chatMessages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`mb-3 ${
                    msg.senderId === currentUser?.id ? "text-right" : "text-left"
                  } chat-message ${msg.content === 'Đang tìm kiếm...' ? 'searching-message' : ''}`}
                >
                  {" "}
                  <div
                    className={`flex ${
                      msg.senderId === currentUser?.id
                        ? "justify-end"
                        : "justify-start"
                    } items-end w-full`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        msg.senderId === currentUser?.id
                          ? "bg-[#C92127] text-white"
                          : "bg-gray-200 text-gray-800"
                      } max-w-[85%]`}
                    >
                      <div className="break-words">
                        {msg.content.includes('<div class="product-slider"') ? (
                          <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                        ) : (
                          msg.content
                        )}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          msg.senderId === currentUser?.id
                            ? "text-gray-200"
                            : "text-gray-500"
                        }`}
                      >                        {formatMessageDate(msg.dateSent)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-200 p-4 flex"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                !currentUser 
                  ? "Vui lòng đăng nhập để chat" 
                  : "Nhập tin nhắn của bạn..."
              }
              disabled={!currentUser}
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92127] disabled:bg-gray-100 disabled:text-gray-400"
            />
            <button
              type="submit"
              disabled={!message.trim() || !currentUser}
              className="bg-[#C92127] text-white px-4 py-2 rounded-r-lg hover:bg-[#a71b20] disabled:bg-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        onClick={toggleChat}
        className="flex items-center justify-center w-16 h-16 rounded-full bg-[#C92127] text-white shadow-lg hover:bg-[#a71b20] transition-all duration-300 hover:scale-110 chat-button cursor-pointer"
        aria-label="Chat with us"
      >
        {!isChatOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}

        {!isChatOpen && unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-green-500 min-w-[20px] h-5 rounded-full border-2 border-white notification-badge flex items-center justify-center text-xs font-bold">
            {unreadCount}
          </span>
        )}
        
        {!isChatOpen && adminOnline && unreadCount === 0 && (
          <span className="absolute top-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></span>
        )}
      </button>
    </div>
  );
};

export default ChatIcon;
