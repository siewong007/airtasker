import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, User } from 'lucide-react';
import { format } from 'date-fns';
import { messageService } from '@/services/messages';
import { taskService } from '@/services/tasks';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/context/WebSocketContext';
import { Message } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Messages() {
  const { taskId } = useParams<{ taskId: string }>();
  const { user } = useAuth();
  const { isConnected, subscribe } = useWebSocket();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: task } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskService.getTaskById(Number(taskId)),
    enabled: !!taskId,
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', taskId],
    queryFn: () => messageService.getMessagesByTaskId(Number(taskId)),
    enabled: !!taskId,
    // Only poll if WebSocket is not connected
    refetchInterval: isConnected ? false : 5000,
  });

  // WebSocket real-time messages
  useEffect(() => {
    if (isConnected && taskId) {
      const unsubscribe = subscribe('/user/queue/messages', (data) => {
        const newMsg = data as Message;
        if (newMsg.taskId === Number(taskId)) {
          queryClient.setQueryData(['messages', taskId], (old: Message[] | undefined) => {
            if (!old) return [newMsg];
            if (old.some((m) => m.id === newMsg.id)) return old;
            return [...old, newMsg];
          });
        }
      });
      return unsubscribe;
    }
  }, [isConnected, taskId, subscribe, queryClient]);

  const sendMessage = useMutation({
    mutationFn: (content: string) => {
      const receiverId = task?.poster.id === user?.id
        ? task?.assignedTasker?.id
        : task?.poster.id;

      if (!receiverId) throw new Error('No receiver found');

      return messageService.sendMessage(Number(taskId), {
        receiverId,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', taskId] });
      setMessage('');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage.mutate(message);
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="py-24" size="lg" />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg border p-4 mb-4">
        <h1 className="font-semibold text-gray-900">{task?.title}</h1>
        <p className="text-sm text-gray-500">
          Conversation about this task
          {isConnected && (
            <span className="ml-2 inline-flex items-center text-green-600">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-1" />
              Live
            </span>
          )}
        </p>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg border h-[500px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages?.map((msg) => {
              const isOwn = msg.sender.id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] ${
                      isOwn
                        ? 'bg-primary-600 text-white rounded-l-lg rounded-tr-lg'
                        : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
                    } p-3`}
                  >
                    {!isOwn && (
                      <div className="flex items-center mb-1">
                        <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                          {msg.sender.avatarUrl ? (
                            <img
                              src={msg.sender.avatarUrl}
                              alt={msg.sender.name}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-3 w-3 text-primary-600" />
                          )}
                        </div>
                        <span className="text-xs font-medium">{msg.sender.name}</span>
                      </div>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-primary-200' : 'text-gray-400'
                      }`}
                    >
                      {format(new Date(msg.createdAt), 'h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={!message.trim() || sendMessage.isPending}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
