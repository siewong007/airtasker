import { Star, User } from 'lucide-react';
import { Review } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            {review.reviewer.avatarUrl ? (
              <img
                src={review.reviewer.avatarUrl}
                alt={review.reviewer.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-primary-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{review.reviewer.name}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= review.rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {review.comment && (
        <p className="text-gray-600 text-sm">{review.comment}</p>
      )}
    </div>
  );
}
