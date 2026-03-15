import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offerService } from '@/services/offers';
import { OfferCreateRequest } from '@/types';
import toast from 'react-hot-toast';

export function useTaskOffers(taskId: number) {
  return useQuery({
    queryKey: ['offers', 'task', taskId],
    queryFn: () => offerService.getOffersByTaskId(taskId),
    enabled: !!taskId,
  });
}

export function useMyOffers(page = 0, size = 10) {
  return useQuery({
    queryKey: ['offers', 'my', page, size],
    queryFn: () => offerService.getMyOffers(page, size),
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: OfferCreateRequest }) =>
      offerService.createOffer(taskId, data),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['offers', 'task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success('Offer submitted successfully!');
    },
    onError: () => {
      toast.error('Failed to submit offer');
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: number) => offerService.acceptOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Offer accepted!');
    },
    onError: () => {
      toast.error('Failed to accept offer');
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: number) => offerService.rejectOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.success('Offer rejected');
    },
    onError: () => {
      toast.error('Failed to reject offer');
    },
  });
}

export function useWithdrawOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: number) => offerService.withdrawOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.success('Offer withdrawn');
    },
    onError: () => {
      toast.error('Failed to withdraw offer');
    },
  });
}
