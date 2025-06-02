import apiClient from './apiService';
import API_BASE_URL from '../config/apiConfig';
import { Message, MessageRequest, MessageRoom } from '../types/message';
import axios from 'axios';
import { plainTokenService } from './plainTokenService';

const API_BASE = `${API_BASE_URL}/messages`;

// Tạo instance axios riêng cho chat để không ảnh hưởng đến apiClient chính
const chatApiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  }
});

// Clone interceptors từ apiClient để xử lý refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

chatApiClient.interceptors.request.use(
  (config) => {
    const token = plainTokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

chatApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return chatApiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/users/auth/refresh-token`, {}, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const newAccessToken = res?.data?.result?.token;
        if (!newAccessToken) {
          window.location.href = '/user/login';
          return Promise.reject(error);
        }

        plainTokenService.setAccessToken(newAccessToken);
        chatApiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        processQueue(null, newAccessToken);
        return chatApiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        plainTokenService.removeToken();
        window.location.href = '/user/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Thêm interceptor không sử dụng hooks
chatApiClient.interceptors.request.use(
  (config) => {
    const token = plainTokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const messageService = {
  /**
   * Gửi tin nhắn mới
   */
  sendMessage: async (message: MessageRequest): Promise<Message> => {
    try {
      const response = await apiClient.post(API_BASE, message);
      return response.data.result;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả tin nhắn trong một phòng chat
   */
  getMessagesByRoomId: async (roomId: string): Promise<Message[]> => {
    try {
      const response = await apiClient.get(`${API_BASE}/room/${roomId}`);
      return response.data.result;
    } catch (error) {
      console.error(`Error fetching messages for room ${roomId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết về một tin nhắn
   */
  getMessageById: async (messageId: string): Promise<Message> => {
    try {
      const response = await apiClient.get(`${API_BASE}/${messageId}`);
      return response.data.result;
    } catch (error) {
      console.error(`Error fetching message ${messageId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phòng chat của người dùng hiện tại
   */
  getUserMessageRooms: async (userId: number): Promise<string[]> => {
    try {
      const response = await apiClient.get(`${API_BASE}/rooms`, {params: {userId}});
      return response.data.result;
    } catch (error) {
      console.error(`Error fetching message rooms for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết về tất cả phòng chat của người dùng hiện tại
   */
  getUserMessageRoomsDetailed: async (userId: number): Promise<MessageRoom[]> => {
    try {
      const response = await apiClient.get(`${API_BASE}/rooms/detailed`, {
        params: {userId},
      });
      return response.data.result;
    } catch (error) {
      console.error(`Error fetching detailed message rooms for user ${userId}:`, error);
      return [];
    }
  },

  /**
   * Lấy thông tin chi tiết về một phòng chat
   */
  getMessageRoomById: async (roomId: string): Promise<MessageRoom> => {
    try {
      const response = await apiClient.get(`${API_BASE}/room/${roomId}/detailed`);
      return response.data.result;
    } catch (error) {
      console.error(`Error fetching room details for ${roomId}:`, error);
      throw error;
    }
  },
  
  /**
   * Tạo một phòng chat mới với admin
   */
  createChatRoomWithAdmin: async (userId: number): Promise<MessageRoom> => {
    try {
      const response = await apiClient.post(`${API_BASE}/rooms/create-with-admin`, { userId });
      return response.data.result;
    } catch (error) {
      console.error('Error creating chat room with admin:', error);
      throw error;
    }
  }
};

export default messageService;