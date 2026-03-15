import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell, MessageSquare, DollarSign, Star, CheckCircle, AlertCircle,
  Briefcase, ThumbsUp, ThumbsDown, CheckCheck,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { notificationService } from '@/services/notifications';
import { useNotifications } from '@/context/NotificationContext';
import { Notification, NotificationType } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  NEW_OFFER: <Briefcase className="h-5 w-5 text-blue-500" />,
  OFFER_ACCEPTED: <ThumbsUp className="h-5 w-5 text-green-500" />,
  OFFER_REJECTED: <ThumbsDown className="h-5 w-5 text-red-500" />,
  NEW_MESSAGE: <MessageSquare className="h-5 w-5 text-primary-500" />,
  TASK_ASSIGNED: <CheckCircle className="h-5 w-5 text-blue-500" />,
  TASK_COMPLETED: <CheckCircle className="h-5 w-5 text-green-500" />,
  NEW_REVIEW: <Star className="h-5 w-5 text-yellow-500" />,
  PAYMENT_RECEIVED: <DollarSign className="h-5 w-5 text-green-500" />,
  SYSTEM: <AlertCircle className="h-5 w-5 text-gray-500" />,
};

function getNotificationLink(notification: Notification): string | null {
  if (!notification.referenceId || !notification.referenceType) return null;
  switch (notification.referenceType) {
    case 'TASK': return `/tasks/${notification.referenceId}`;
    case 'OFFER': return `/tasks/${notification.referenceId}`;
    case 'MESSAGE': return `/messages/${notification.referenceId}`;
    case 'REVIEW': return `/tasks/${notification.referenceId}`;
    case 'PAYMENT': return `/dashboard`;
    default: return null;
  }
}

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { markAllAsRead: markAllReadContext } = useNotifications();
  const [page, setPage] = useState(0);

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['allNotifications', page],
    queryFn: () => notificationService.getNotifications(page, 20),
  });

  const markAsRead = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
    },
  });

  const handleClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead.mutateAsync(notification.id);
    }
    const link = getNotificationLink(notification);
    if (link) navigate(link);
  };

  const handleMarkAllRead = async () => {
    await markAllReadContext();
    queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <CheckCheck className="h-4 w-4 mr-1" />
          Mark all as read
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : notificationsData?.content.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border divide-y">
            {notificationsData?.content.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleClick(notification)}
                className={`w-full flex items-start gap-4 p-4 text-left hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-primary-50/50' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {notificationIcons[notification.type] || <Bell className="h-5 w-5 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="flex-shrink-0 h-2 w-2 bg-primary-600 rounded-full mt-1.5" />
                    )}
                  </div>
                  {notification.message && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{notification.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {notificationsData && notificationsData.totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={notificationsData.first}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {notificationsData.number + 1} of {notificationsData.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={notificationsData.last}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
