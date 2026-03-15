import api from './api';
import { Review, ReviewCreateRequest, Page } from '@/types';

export const reviewService = {
  async getReviewsByTaskId(taskId: number): Promise<Review[]> {
    const response = await api.get<Review[]>(`/tasks/${taskId}/reviews`);
    return response.data;
  },

  async getReviewsByUserId(userId: number, page = 0, size = 10): Promise<Page<Review>> {
    const response = await api.get<Page<Review>>(`/users/${userId}/reviews?page=${page}&size=${size}`);
    return response.data;
  },

  async createReview(taskId: number, data: ReviewCreateRequest): Promise<Review> {
    const response = await api.post<Review>(`/tasks/${taskId}/reviews`, data);
    return response.data;
  },
};
