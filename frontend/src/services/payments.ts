import api from './api';
import { Payment, Page } from '@/types';

export const paymentService = {
  async getPaymentHistory(page = 0, size = 20): Promise<Page<Payment>> {
    const response = await api.get<Page<Payment>>(`/payments/history?page=${page}&size=${size}`);
    return response.data;
  },

  async createPaymentIntent(taskId: number): Promise<Payment> {
    const response = await api.post<Payment>(`/payments/create-intent?taskId=${taskId}`);
    return response.data;
  },

  async completePayment(paymentId: number): Promise<Payment> {
    const response = await api.post<Payment>(`/payments/${paymentId}/complete`);
    return response.data;
  },

  async refundPayment(paymentId: number): Promise<Payment> {
    const response = await api.post<Payment>(`/payments/${paymentId}/refund`);
    return response.data;
  },

  async getTotalEarnings(): Promise<number> {
    const response = await api.get<{ total: number }>('/payments/earnings');
    return response.data.total;
  },

  async getTotalSpending(): Promise<number> {
    const response = await api.get<{ total: number }>('/payments/spending');
    return response.data.total;
  },
};
