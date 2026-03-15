import api from './api';
import { User, Task, Page } from '@/types';

export const userService = {
  async getUserById(id: number): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await api.put<User>(`/users/${id}/profile`, data);
    return response.data;
  },

  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
    await api.put(`/users/${id}/password?oldPassword=${encodeURIComponent(oldPassword)}&newPassword=${encodeURIComponent(newPassword)}`);
  },

  async getUserTasks(id: number, page = 0, size = 10): Promise<Page<Task>> {
    const response = await api.get<Page<Task>>(`/users/${id}/tasks?page=${page}&size=${size}`);
    return response.data;
  },

  async getAssignedTasks(id: number, page = 0, size = 10): Promise<Page<Task>> {
    const response = await api.get<Page<Task>>(`/users/${id}/assigned-tasks?page=${page}&size=${size}`);
    return response.data;
  },
};
