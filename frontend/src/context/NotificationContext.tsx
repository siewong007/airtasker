import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification } from '@/types';
import { notificationService } from '@/services/notifications';
import { useAuth } from './AuthContext';
import { useWebSocket } from './WebSocketContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { isConnected, subscribe } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const [unread, count] = await Promise.all([
        notificationService.getUnreadNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(unread);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Initial fetch
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // WebSocket real-time notifications
  useEffect(() => {
    if (isConnected && isAuthenticated) {
      const unsubscribe = subscribe('/user/queue/notifications', (data) => {
        const notification = data as Notification;
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
      return unsubscribe;
    }
  }, [isConnected, isAuthenticated, subscribe]);

  // Fallback polling when WebSocket is not connected
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      const interval = setInterval(refreshNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, isAuthenticated, refreshNotifications]);

  const markAsRead = async (id: number) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
