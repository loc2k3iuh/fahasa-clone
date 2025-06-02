import apiClient from './apiClient';
import { Message, MessageRoom, MessageRequest } from '../types/message';
import API_BASE_URL from '../config/apiConfig';


const API_BASE = `${API_BASE_URL}/messages`;

export const messageService = {
  /**
   * Gửi tin nhắn mới
   */
  sendMessage: async (message: MessageRequest): Promise<Message> => {
    const response = await apiClient.post(API_BASE, message);
    return response.data.result;
  },

  /**
   * Lấy tất cả tin nhắn trong một phòng chat
   */
  getMessagesByRoomId: async (roomId: string): Promise<Message[]> => {
    const response = await apiClient.get(`${API_BASE}/room/${roomId}`);
    return response.data.result;
  },

  /**
   * Lấy thông tin chi tiết về một tin nhắn
   */
  getMessageById: async (messageId: string): Promise<Message> => {
    const response = await apiClient.get(`${API_BASE}/${messageId}`);
    return response.data.result;
  },

  /**
   * Lấy danh sách ID các phòng chat của người dùng hiện tại
   */
  getUserMessageRooms: async (userId: string): Promise<string[]> => {
    const response = await apiClient.get(`${API_BASE}/rooms`, { params: { userId } });
    return response.data.result;
  },

  /**
   * Lấy thông tin chi tiết về tất cả phòng chat của người dùng hiện tại
   */
  getUserMessageRoomsDetailed: async (userId: string): Promise<MessageRoom[]> => {
    const response = await apiClient.get(`${API_BASE}/rooms/detailed`, { params: { userId } });
    return response.data.result;
  },

  /**
   * Lấy thông tin chi tiết về một phòng chat
   */
  getMessageRoomById: async (roomId: string): Promise<MessageRoom> => {
    const response = await apiClient.get(`${API_BASE}/room/${roomId}/detailed`);
    return response.data.result;
  }
};

export default messageService;
