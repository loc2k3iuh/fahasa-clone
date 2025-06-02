import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import apiClient from "../services/apiService";
import { UserResponse } from "../types/user";
import { Message, MessageRequest } from "../types/message";

// Polyfill for 'global' to avoid "global is not defined" error
if (typeof window !== "undefined" && !window.global) {
  (window as any).global = window;
}

// URL đúng với context-path '/vuvisa'
const SOCKET_URL = "http://localhost:9090/vuvisa/ws";
const API_BASE = "http://localhost:9090/vuvisa/api/v1";
let stompClient: Client | null = null;
let connected = false;
let messageHandlers: ((message: Message) => void)[] = [];
let disableAccountHandlers: ((user: UserResponse) => void)[] = [];
let onlineStatusHandlers: ((users: UserResponse) => void)[] = [];
let userId: number | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let retryCount = 0;
const maxRetries = 5;

export const connectWebSocket = (user: UserResponse): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (stompClient && stompClient.connected) {
      console.log("WebSocket already connected");
      setUserOnline(user).then(() => resolve());
      return;
    }

    console.log("Initializing WebSocket connection to:", SOCKET_URL);

    try {
      const socket = new SockJS(SOCKET_URL);
      stompClient = new Client({
        webSocketFactory: () => socket,
        debug: (str) => console.log(`STOMP: ${str}`),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      stompClient.onConnect = (frame) => {
        console.log("Connected to WebSocket", frame);
        connected = true;
        retryCount = 0;
        userId = user.id;

        if (stompClient) {
          stompClient.subscribe(
            `/user/${user.id}/queue/messages`,
            (message) => {
              const messageData = JSON.parse(message.body);
              messageHandlers.forEach((handler) => handler(messageData));
            }
          );

          stompClient.subscribe(`/topic/room.*`, (message) => {
            const messageData = JSON.parse(message.body);
            messageHandlers.forEach((handler) => handler(messageData));
          });
          stompClient.subscribe("/topic/active-admin", (message) => {
            const response = JSON.parse(message.body);
            console.log("Received WebSocket admin status update:", response);
            console.log("Admin status result:", response.result);
            console.log("Admin status result type:", typeof response.result);
            onlineStatusHandlers.forEach((handler) => handler(response.result));
          });


            // Đăng ký lắng nghe chủ đề vô hiệu hóa tài khoản
        stompClient!.subscribe("/topic/disable-user", (message) => {
          try {
            const response = JSON.parse(message.body);
            const userData = response.result;
            console.log("User account disabled:", userData);
            // Nếu là tài khoản của người dùng hiện tại
            if (userData.id === userId) {
              disableAccountHandlers.forEach((handler) => handler(userData));
            }
          } catch (error) {
            console.error("Error handling disable account message:", error);
          }
        });


          stompClient.publish({
            destination: "/app/user/connect",
            body: JSON.stringify({ id: user.id }),
            headers: { "content-type": "application/json" },
          });
        } else {
          console.error(
            "stompClient is null during subscription or publishing"
          );
        }

        resolve();
      };

      stompClient.onStompError = (frame) => {
        console.error("STOMP error", frame);
        handleConnectionError();
        reject(frame);
      };

      stompClient.activate();
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
      handleConnectionError();
      reject(error);
    }
  });
};

const handleConnectionError = (): void => {
  connected = false;
  retryCount++;

  if (retryCount > maxRetries) {
    console.error(
      `Max retries (${maxRetries}) reached. Stopping reconnection attempts.`
    );
    return;
  }

  const timeout = Math.min(1000 * (Math.pow(2, retryCount) - 1), 30000);
  console.log(
    `Retrying connection in ${timeout}ms (attempt ${retryCount}/${maxRetries})`
  );

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }

  reconnectTimeout = setTimeout(() => {
    if (userId) {
      connectWebSocket({ id: userId } as UserResponse).catch((err) =>
        console.error("Reconnection failed:", err)
      );
    }
  }, timeout);
};

export const disconnectWebSocket = (user?: UserResponse): Promise<void> => {
  return new Promise<void>(async (resolve) => {
    if (stompClient && connected) {
      try {
        // If we have a user, try to mark them as offline first
        if (user && user.id && stompClient.connected) {
          stompClient.publish({
            destination: "/app/user/disconnect",
            body: JSON.stringify({ id: user.id }),
          });
          console.log(
            "User offline status sent via WebSocket before disconnect"
          );
        }

        stompClient.deactivate();
        console.log("WebSocket disconnected successfully");
        resolve();
      } catch (error) {
        console.error("Error disconnecting WebSocket:", error);

        // Try REST API fallback if we have a user
        if (user && user.id) {
          try {
            await fallbackToRestApiDisconnect(user);
          } catch (err) {
            console.error("Failed to disconnect via REST API:", err);
          }
        }
        resolve(); // Resolve anyway since we're cleaning up
      } finally {
        stompClient = null;
        connected = false;

        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }

        resolve();
      }
    } else {
      resolve();
    }
  });
};

export const setUserOnline = (user: UserResponse): Promise<void> => {
  return new Promise<void>(async (resolve, reject) => {
    if (!user || !user.id) {
      const error = "Cannot set user online: Invalid user data";
      console.warn(error);
      reject(error);
      return;
    }

    if (stompClient && stompClient.connected) {
      try {
        stompClient.publish({
          destination: "/app/user/connect",
          body: JSON.stringify({ id: user.id }),
          headers: { "content-type": "application/json" },
        });
        console.log("User online status sent via WebSocket");
        resolve();
      } catch (error) {
        console.error("Error sending online status via WebSocket:", error);
        try {
          await fallbackToRestApi(user);
          resolve();
        } catch (err) {
          reject(err);
        }
      }
    } else {
      console.log("WebSocket not connected, using REST API fallback");
      try {
        await fallbackToRestApi(user);
        resolve();
      } catch (err) {
        reject(err);
      }
    }
  });
};

// Helper function for the REST API fallback
const fallbackToRestApi = async (user: UserResponse): Promise<void> => {
  try {
    await apiClient.post(`${API_BASE}/users/connect-user`, { id: user.id });
    console.log("User online status sent via REST API");
  } catch (error) {
    console.error("Failed to update online status via REST API:", error);
    throw error; // Rethrow để caller biết lỗi
  }
};

// Helper function for the REST API fallback for disconnect
const fallbackToRestApiDisconnect = async (
  user: UserResponse
): Promise<void> => {
  try {
    await apiClient.post(`${API_BASE}/users/disconnect-user`, { id: user.id });
    console.log("User offline status sent via REST API");
  } catch (error) {
    console.error("Failed to update offline status via REST API:", error);
    throw error; // Rethrow để caller biết lỗi
  }
};

// Thêm function để kiểm tra trạng thái kết nối WebSocket
export const checkWebSocketConnection = () => {
  const isConnected = stompClient && stompClient.connected;
  console.log(
    "WebSocket connection status:",
    isConnected ? "Connected" : "Disconnected"
  );
  return isConnected;
};

// Export stompClient getter for components that need access to the client
export const getStompClient = () => stompClient;

export const sendMessage = (message: MessageRequest): boolean => {
  if (connected && stompClient) {
    try {
      stompClient.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(message),
        headers: { "content-type": "application/json" },
      });
      console.log("Message sent:", message);
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  } else {
    console.error("Cannot send message: WebSocket not connected");
    return false;
  }
};

export const onMessage = (
  handler: (message: Message) => void
): (() => void) => {
  messageHandlers.push(handler);
  return () => {
    messageHandlers = messageHandlers.filter((h) => h !== handler);
  };
};

export const onOnlineStatusUpdate = (
  handler: (users: UserResponse | UserResponse[] | null) => void
): (() => void) => {
  onlineStatusHandlers.push(handler as any);
  return () => {
    onlineStatusHandlers = onlineStatusHandlers.filter((h) => h !== handler);
  };
};

export const onAccountDisabled = (
  handler: (user: UserResponse) => void
): (() => void) => {
  disableAccountHandlers.push(handler);
  return () => {
    disableAccountHandlers = disableAccountHandlers.filter(
      (h) => h !== handler
    );
  };
};
export const isConnected = (): boolean => connected;
