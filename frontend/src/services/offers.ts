import api from './api';
import { Offer, OfferCreateRequest, Page } from '@/types';

export const offerService = {
  async getOffersByTaskId(taskId: number): Promise<Offer[]> {
    const response = await api.get<Offer[]>(`/tasks/${taskId}/offers`);
    return response.data;
  },

  async getMyOffers(page = 0, size = 10): Promise<Page<Offer>> {
    const response = await api.get<Page<Offer>>(`/offers/my?page=${page}&size=${size}`);
    return response.data;
  },

  async createOffer(taskId: number, data: OfferCreateRequest): Promise<Offer> {
    const response = await api.post<Offer>(`/tasks/${taskId}/offers`, data);
    return response.data;
  },

  async acceptOffer(offerId: number): Promise<Offer> {
    const response = await api.post<Offer>(`/offers/${offerId}/accept`);
    return response.data;
  },

  async rejectOffer(offerId: number): Promise<Offer> {
    const response = await api.post<Offer>(`/offers/${offerId}/reject`);
    return response.data;
  },

  async withdrawOffer(offerId: number): Promise<Offer> {
    const response = await api.post<Offer>(`/offers/${offerId}/withdraw`);
    return response.data;
  },
};
