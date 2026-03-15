import api from './api';
import { Message, MessageCreateRequest } from '@/types';

export const messageService = {
  async getMessagesByTaskId(taskId: number): Promise<Message[]> {
    const response = await api.get<Message[]>(`/tasks/${taskId}/messages`);
    return response.data;
  },

  async sendMessage(taskId: number, data: MessageCreateRequest): Promise<Message> {
    const response = await api.post<Message>(`/tasks/${taskId}/messages`, data);
    return response.data;
  },
};
