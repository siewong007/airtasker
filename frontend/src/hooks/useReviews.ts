import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/reviews';
import { ReviewCreateRequest } from '@/types';
import toast from 'react-hot-toast';

export function useTaskReviews(taskId: number) {
  return useQuery({
    queryKey: ['taskReviews', taskId],
    queryFn: () => reviewService.getReviewsByTaskId(taskId),
    enabled: !!taskId,
  });
}

export function useUserReviews(userId: number, page = 0) {
  return useQuery({
    queryKey: ['userReviews', userId, page],
    queryFn: () => reviewService.getReviewsByUserId(userId, page),
    enabled: !!userId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: ReviewCreateRequest }) =>
      reviewService.createReview(taskId, data),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['taskReviews', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success('Review submitted!');
    },
    onError: () => {
      toast.error('Failed to submit review');
    },
  });
}
