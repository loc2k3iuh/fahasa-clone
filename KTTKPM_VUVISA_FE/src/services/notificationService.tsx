import { useCallback, useEffect, useState } from 'react';
import apiClient from "./apiService";
import { useTokenService } from './useTokenService';
import API_BASE_URL from '../config/apiConfig';

const API_BASE = `${API_BASE_URL}`;

export enum BackendNotificationType {
  // Calendar related notifications
  CALENDAR_REMINDER = 'CALENDAR_REMINDER',
  CALENDAR_CREATED = 'CALENDAR_CREATED',
  CALENDAR_UPDATED = 'CALENDAR_UPDATED',
  CALENDAR_CANCELLED = 'CALENDAR_CANCELLED',

  // Order related notifications
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',

  // Product related notifications
  PRODUCT_ADDED = 'PRODUCT_ADDED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_OUT_OF_STOCK = 'PRODUCT_OUT_OF_STOCK',
  PRODUCT_BACK_IN_STOCK = 'PRODUCT_BACK_IN_STOCK',

  // Promotion related notifications
  PROMOTION_ADDED = 'PROMOTION_ADDED',
  PROMOTION_ENDING_SOON = 'PROMOTION_ENDING_SOON',

  // System notifications
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT'
}

export enum NotificationType {
  CALENDAR = 'CALENDAR',
  ORDER = 'ORDER',
  PRODUCT = 'PRODUCT',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM'
}

export const mapNotificationType = (backendType: string): NotificationType => {
  if (backendType.startsWith('CALENDAR_')) return NotificationType.CALENDAR;
  if (backendType.startsWith('ORDER_')) return NotificationType.ORDER;
  if (backendType.startsWith('PRODUCT_')) return NotificationType.PRODUCT;
  if (backendType.startsWith('PROMOTION_')) return NotificationType.PROMOTION;
  return NotificationType.SYSTEM;
};

// Type for notification from backend
export interface BackendNotificationResponseDTO {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: string; // This is the detailed backend type
}

export interface NotificationResponseDTO {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: NotificationType;
  originalType: string;
}

export interface NotificationPageResponse {
  content: NotificationResponseDTO[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export const useNotificationService = () => {
  const [notifications, setNotifications] = useState<NotificationResponseDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getAccessToken } = useTokenService();

  // Transform backend notification to frontend format
  const transformNotification = (backendNotification: BackendNotificationResponseDTO): NotificationResponseDTO => {
    return {
      ...backendNotification,
      type: mapNotificationType(backendNotification.type),
      originalType: backendNotification.type
    };
  };

  // Get paginated notifications
  const getNotifications = useCallback(async (
    userId: number,
    page: number = 0,
    size: number = 10
  ): Promise<NotificationPageResponse> => {
    try {
      setLoading(true);
      const response = await apiClient.get(`${API_BASE}/notifications`, {
        params: { page, size, userId }
      });
      const backendData = response.data.result;

      const transformedNotifications = backendData.content.map(transformNotification);

      const notificationsData = {
        ...backendData,
        content: transformedNotifications
      };

      setNotifications(transformedNotifications);
      return notificationsData;
    } catch (error: any) {
      setError(error.response?.data?.message || "Không thể tải thông báo");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get unread notifications
  const getUnreadNotifications = useCallback(async (userId: number): Promise<NotificationResponseDTO[]> => {
    try {
      setLoading(true);
      const response = await apiClient.get(`${API_BASE}/notifications/user/${userId}/unread/count`);
      const backendNotifications = response.data.result;
      const transformedNotifications = backendNotifications.map(transformNotification);
      return transformedNotifications;
    } catch (error: any) {
      setError(error.response?.data?.message || "Không thể tải thông báo chưa đọc");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback(async (
    type: NotificationType
  ): Promise<NotificationResponseDTO[]> => {
    try {
      setLoading(true);
      // Since we're grouping types on the frontend, we need to get all notifications
      // and filter them client-side based on our simplified categories
      const response = await apiClient.get(`${API_BASE}/notifications`);
      const backendNotifications = response.data.result.content;

      // Transform and filter notifications
      const transformedNotifications = backendNotifications
        .map(transformNotification)
        .filter((notification: NotificationResponseDTO) => notification.type === type);

      return transformedNotifications;
    } catch (error: any) {
      setError(error.response?.data?.message || `Không thể tải thông báo loại ${type}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId: number): Promise<NotificationResponseDTO> => {
    try {
      const response = await apiClient.put(`${API_BASE}/notifications/${notificationId}/read`);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

      return transformNotification(response.data.result);
    } catch (error: any) {
      setError(error.response?.data?.message || "Không thể đánh dấu là đã đọc");
      throw error;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (userId: number): Promise<number> => {
    try {
      const response = await apiClient.put(`${API_BASE}/notifications/user/${userId}/read-all`);

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );

      // Reset unread count
      setUnreadCount(0);

      return response.data.result;
    } catch (error: any) {
      setError(error.response?.data?.message || "Không thể đánh dấu tất cả là đã đọc");
      throw error;
    }
  }, []);

  // Count unread notifications
  const getUnreadCount = useCallback(async (userId: number): Promise<number> => {
    try {
      const response = await apiClient.get(`${API_BASE}/notifications/unread/count?userId=${userId}`);
      const count = response.data.result;
      setUnreadCount(count);
      return count;
    } catch (error: any) {
      setError(error.response?.data?.message || "Không thể lấy số lượng thông báo chưa đọc");
      throw error;
    }
  }, []);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: number): Promise<void> => {
    try {
      await apiClient.delete(`${API_BASE}/notifications/${notificationId}`);

      // Update local state
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );

      // Update unread count if needed
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Không thể xóa thông báo");
      throw error;
    }
  }, [notifications]);

  // Get local notifications from storage
  const getLocalNotifications = (): NotificationResponseDTO[] => {
    try {
      const storedNotifications = localStorage.getItem("notifications");
      if (!storedNotifications) return [];

      const parsedNotifications = JSON.parse(storedNotifications);

      if (parsedNotifications.length > 0 && !parsedNotifications[0].hasOwnProperty('originalType')) {
        return parsedNotifications.map(transformNotification);
      }

      return parsedNotifications;
    } catch (error) {
      console.error("Error retrieving local notifications:", error);
      return [];
    }
  };

  // Save notifications to local storage
  const saveLocalNotifications = (notificationsToSave: NotificationResponseDTO[]): void => {
    try {
      localStorage.setItem("notifications", JSON.stringify(notificationsToSave));
    } catch (error) {
      console.error("Error saving local notifications:", error);
    }
  };

  // Load unread count on mount and when auth token changes
  useEffect(() => {

    const userResponseJSON = localStorage.getItem("user");
    const storedUser = JSON.parse(userResponseJSON || '{}');

    const token = getAccessToken();
    if (token && storedUser && storedUser.id != null) {
      getUnreadCount(storedUser.id).catch(err => {
        console.error("Failed to fetch initial unread notification count", err);
      });
    }
  }, [getAccessToken, getUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    getNotifications,
    getUnreadNotifications,
    getNotificationsByType,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
    getLocalNotifications,
    saveLocalNotifications
  };
};

export default useNotificationService;