import { User, Clock, Star } from 'lucide-react';
import { Offer } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface OfferCardProps {
  offer: Offer;
  onAccept?: () => void;
  onReject?: () => void;
  onWithdraw?: () => void;
  showActions?: boolean;
  isOwner?: boolean;
}

export default function OfferCard({
  offer,
  onAccept,
  onReject,
  onWithdraw,
  showActions = false,
  isOwner = false,
}: OfferCardProps) {
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            {offer.tasker.avatarUrl ? (
              <img
                src={offer.tasker.avatarUrl}
                alt={offer.tasker.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-primary-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{offer.tasker.name}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Star className="h-3 w-3 text-yellow-400 mr-1" />
              <span>{offer.tasker.rating.toFixed(1)}</span>
              <span className="mx-1">·</span>
              <span>{offer.tasker.completedTasks} tasks done</span>
            </div>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
            statusColors[offer.status]
          }`}
        >
          {offer.status}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-2xl font-bold text-primary-600">${offer.price.toFixed(0)}</p>
        {offer.estimatedHours && (
          <p className="text-sm text-gray-500 flex items-center mt-1">
            <Clock className="h-4 w-4 mr-1" />
            Estimated: {offer.estimatedHours} hours
          </p>
        )}
      </div>

      {offer.message && (
        <p className="text-gray-600 text-sm mb-3 bg-gray-50 p-3 rounded">
          "{offer.message}"
        </p>
      )}

      <p className="text-xs text-gray-400 mb-4">
        {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
      </p>

      {showActions && offer.status === 'PENDING' && (
        <div className="flex gap-2">
          {!isOwner ? (
            <>
              <button
                onClick={onAccept}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
              >
                Accept
              </button>
              <button
                onClick={onReject}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Decline
              </button>
            </>
          ) : (
            <button
              onClick={onWithdraw}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Withdraw Offer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
