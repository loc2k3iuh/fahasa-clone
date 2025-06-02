import API_BASE_URL from '../config/apiConfig';
import apiClient from './apiClient';

const API_URL = `${API_BASE_URL}`;


export interface SystemNotificationRequestDTO {
  title: string;
  message: string;
}

export interface NotificationResponseDTO {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  userId: number;
}

export interface NotificationListResponse {
  content: NotificationResponseDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const notificationService = {
  /**
   * Send notification to all users
   */
  sendToAllUsers: async (request: SystemNotificationRequestDTO) => {
    try {
      const response = await apiClient.post(
        `${API_URL}/notifications/send-to-all-users`,
        request
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || 'Failed to send notification!';
    }
  },

  /**
   * Get notifications with pagination
   */
  getNotifications: async (userId: number, page: number = 0, size: number = 10) => {
    try {
      const response = await apiClient.get(`${API_URL}/notifications/user/${userId}`, {
        params: { page, size }
      });
      return response.data.result;
    } catch (error: any) {
      throw error.response?.data || 'Failed to fetch notifications!';
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: number) => {
    try {
      const response = await apiClient.put(
        `${API_URL}/notifications/${notificationId}/read`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || 'Failed to mark notification as read!';
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (userId: number) => {
    try {
      const response = await apiClient.put(`${API_URL}/notifications/user/${userId}/read-all`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || 'Failed to mark all notifications as read!';
    }
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId: number) => {
    try {
      const response = await apiClient.delete(
        `${API_URL}/notifications/${notificationId}`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || 'Failed to delete notification!';
    }
  },

  /**
   * Count unread notifications
   */
  countUnreadNotifications: async (userId: number) => {
    try {
      const response = await apiClient.get(`${API_URL}/notifications/user/${userId}/unread/count`);
      return response.data.result;
    } catch (error: any) {
      throw error.response?.data || 'Failed to count unread notifications!';
    }
  },
};

export default notificationService;