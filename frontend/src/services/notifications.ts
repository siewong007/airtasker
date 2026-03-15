import api from './api';
import { Notification, Page } from '@/types';

export const notificationService = {
  async getNotifications(page = 0, size = 20): Promise<Page<Notification>> {
    const response = await api.get<Page<Notification>>(`/notifications?page=${page}&size=${size}`);
    return response.data;
  },

  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await api.get<Notification[]>('/notifications/unread');
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  },

  async markAsRead(id: number): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  },
};
