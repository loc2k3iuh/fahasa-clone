import API_BASE_URL from '../config/apiConfig';
import apiClient from '../services/apiService';
import { ChatMessage, ChatConversation, AdminStatus } from '../types/chat';

const API_BASE = `${API_BASE_URL}`;



export const chatService = {
  // Get chat history with admin
  getAdminChatHistory: async (userId: number): Promise<ChatMessage[]> => {
    try {
      const response = await apiClient.get(`${API_BASE}/chat/history/admin/${userId}`);
      return response.data.result || [];
    } catch (error) {
      console.error('Error fetching admin chat history:', error);
      return [];
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (userId: number): Promise<boolean> => {
    try {
      const response = await apiClient.post(`${API_BASE}/chat/read/${userId}`);
      return !!response.data.result;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  },

  // Check admin status (online/offline)
  getAdminStatus: async (): Promise<AdminStatus> => {
    try {
      const response = await apiClient.get(`${API_BASE}/users/admin/status`);
      return {
        isOnline: response.data.result?.status === 'ONLINE',
        lastSeen: response.data.result?.lastSeen
      };
    } catch (error) {
      console.error('Error checking admin status:', error);
      return { isOnline: false };
    }
  },

  // Send message via REST API (fallback when WebSocket is unavailable)
  sendMessageREST: async (message: ChatMessage): Promise<boolean> => {
    try {
      await apiClient.post(`${API_BASE}/chat/send`, message);
      return true;
    } catch (error) {
      console.error('Error sending message via REST:', error);
      return false;
    }
  }
};
