import api from './api';
import { Task, TaskCreateRequest, TaskFilters, Page } from '@/types';

export const taskService = {
  async getTasks(filters: TaskFilters = {}): Promise<Page<Task>> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters.minBudget) params.append('minBudget', filters.minBudget.toString());
    if (filters.maxBudget) params.append('maxBudget', filters.maxBudget.toString());
    if (filters.location) params.append('location', filters.location);
    if (filters.search) params.append('search', filters.search);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size) params.append('size', filters.size.toString());

    const response = await api.get<Page<Task>>(`/tasks?${params.toString()}`);
    return response.data;
  },

  async getTaskById(id: number): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  async createTask(data: TaskCreateRequest): Promise<Task> {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  async updateTask(id: number, data: Partial<TaskCreateRequest>): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async startTask(id: number): Promise<Task> {
    const response = await api.post<Task>(`/tasks/${id}/start`);
    return response.data;
  },

  async completeTask(id: number): Promise<Task> {
    const response = await api.post<Task>(`/tasks/${id}/complete`);
    return response.data;
  },
};
