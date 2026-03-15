import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, User, Star, Clock, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { formatDistanceToNow, format } from 'date-fns';
import { useTask, useStartTask, useCompleteTask, useDeleteTask } from '@/hooks/useTasks';
import { useTaskOffers, useCreateOffer, useAcceptOffer, useRejectOffer } from '@/hooks/useOffers';
import { useTaskReviews, useCreateReview } from '@/hooks/useReviews';
import { useAuth } from '@/context/AuthContext';
import { OfferCreateRequest } from '@/types';
import OfferCard from '@/components/OfferCard';
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';
import PaymentModal from '@/components/PaymentModal';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: task, isLoading: taskLoading } = useTask(Number(id));
  const { data: offers, isLoading: offersLoading } = useTaskOffers(Number(id));
  const { data: reviews } = useTaskReviews(Number(id));

  const createOffer = useCreateOffer();
  const acceptOffer = useAcceptOffer();
  const rejectOffer = useRejectOffer();
  const startTask = useStartTask();
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();
  const createReview = useCreateReview();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OfferCreateRequest>();

  if (taskLoading) {
    return <LoadingSpinner className="py-24" size="lg" />;
  }

  if (!task) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Task not found</h1>
        <Link to="/tasks" className="text-primary-600 hover:text-primary-700">
          Back to tasks
        </Link>
      </div>
    );
  }

  const isPoster = user?.id === task.poster.id;
  const isAssignedTasker = user?.id === task.assignedTasker?.id;
  const hasUserMadeOffer = offers?.some((o) => o.tasker.id === user?.id);
  const canMakeOffer =
    isAuthenticated &&
    !isPoster &&
    !hasUserMadeOffer &&
    task.status === 'OPEN';

  const hasUserReviewed = reviews?.some((r) => r.reviewer.id === user?.id);
  const canReview =
    isAuthenticated &&
    task.status === 'COMPLETED' &&
    !hasUserReviewed &&
    (isPoster || isAssignedTasker);

  const statusColors: Record<string, string> = {
    OPEN: 'bg-green-100 text-green-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const onSubmitOffer = async (data: OfferCreateRequest) => {
    await createOffer.mutateAsync({ taskId: task.id, data });
    setShowOfferForm(false);
    reset();
  };

  const handleCancelTask = async () => {
    if (window.confirm('Are you sure you want to cancel this task? This action cannot be undone.')) {
      await deleteTask.mutateAsync(task.id);
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border p-6 mb-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  statusColors[task.status]
                }`}
              >
                {task.status.replace('_', ' ')}
              </span>
              {task.category && (
                <span className="text-sm text-gray-500 flex items-center">
                  <span className="mr-1">{task.category.icon}</span>
                  {task.category.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h1>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
              {task.location && (
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {task.location}
                </span>
              )}
              {task.dueDate && (
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              )}
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Posted {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>

            {/* Images */}
            {task.images && task.images.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-gray-900 mb-2">Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {task.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Task image ${idx + 1}`}
                      className="rounded-lg object-cover w-full h-32"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Task Actions */}
            <div className="space-y-3">
              {isAssignedTasker && task.status === 'ASSIGNED' && (
                <button
                  onClick={() => startTask.mutate(task.id)}
                  disabled={startTask.isPending}
                  className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
                >
                  {startTask.isPending ? 'Starting...' : 'Start Working on Task'}
                </button>
              )}

              {isPoster && task.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => completeTask.mutate(task.id)}
                  disabled={completeTask.isPending}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                >
                  {completeTask.isPending ? 'Completing...' : 'Mark as Complete'}
                </button>
              )}

              {isPoster && task.status === 'COMPLETED' && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center"
                >
                  <DollarSign className="h-5 w-5 mr-1" />
                  Pay Now
                </button>
              )}

              {isPoster && task.status === 'OPEN' && (
                <div className="flex gap-3">
                  <Link
                    to={`/tasks/${task.id}/edit`}
                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-center"
                  >
                    Edit Task
                  </Link>
                  <button
                    onClick={handleCancelTask}
                    disabled={deleteTask.isPending}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                  >
                    {deleteTask.isPending ? 'Cancelling...' : 'Cancel Task'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Offers Section */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Offers ({offers?.length || 0})
            </h2>

            {canMakeOffer && !showOfferForm && (
              <button
                onClick={() => setShowOfferForm(true)}
                className="w-full px-4 py-3 mb-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
              >
                Make an Offer
              </button>
            )}

            {showOfferForm && (
              <form
                onSubmit={handleSubmit(onSubmitOffer)}
                className="bg-gray-50 rounded-lg p-4 mb-6"
              >
                <h3 className="font-medium text-gray-900 mb-4">Make Your Offer</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', {
                      required: 'Price is required',
                      min: { value: 1, message: 'Price must be positive' },
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your price"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Hours (optional)
                  </label>
                  <input
                    type="number"
                    {...register('estimatedHours')}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 2"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message (optional)
                  </label>
                  <textarea
                    {...register('message')}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Introduce yourself and explain why you're the right person for this task..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={createOffer.isPending}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
                  >
                    {createOffer.isPending ? 'Submitting...' : 'Submit Offer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOfferForm(false);
                      reset();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {offersLoading ? (
              <LoadingSpinner />
            ) : offers?.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                No offers yet. Be the first to make an offer!
              </p>
            ) : (
              <div className="space-y-4">
                {offers?.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    showActions={isPoster || offer.tasker.id === user?.id}
                    isOwner={offer.tasker.id === user?.id}
                    onAccept={() => acceptOffer.mutate(offer.id)}
                    onReject={() => rejectOffer.mutate(offer.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Reviews ({reviews?.length || 0})
            </h2>

            {canReview && (
              <ReviewForm
                taskId={task.id}
                onSubmit={async (data) => {
                  await createReview.mutateAsync({ taskId: task.id, data });
                }}
                isSubmitting={createReview.isPending}
              />
            )}

            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No reviews yet.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Budget Card */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Budget</h2>
            <div className="text-3xl font-bold text-primary-600 mb-2">
              ${task.budgetMax?.toFixed(0)}
              {task.budgetMin && (
                <span className="text-lg text-gray-400 font-normal">
                  {' '}
                  (from ${task.budgetMin.toFixed(0)})
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {task.flexible ? 'Flexible budget' : 'Fixed budget'}
            </p>
          </div>

          {/* Poster Card */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Posted by</h2>
            <Link to={`/profile/${task.poster.id}`} className="flex items-center group">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                {task.poster.avatarUrl ? (
                  <img
                    src={task.poster.avatarUrl}
                    alt={task.poster.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-primary-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-primary-600">
                  {task.poster.name}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  {task.poster.rating?.toFixed(1)} ({task.poster.reviewCount} reviews)
                </div>
              </div>
            </Link>
          </div>

          {/* Assigned Tasker Card */}
          {task.assignedTasker && (
            <div className="bg-white rounded-lg border p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">Assigned Tasker</h2>
              <Link
                to={`/profile/${task.assignedTasker.id}`}
                className="flex items-center group"
              >
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                  {task.assignedTasker.avatarUrl ? (
                    <img
                      src={task.assignedTasker.avatarUrl}
                      alt={task.assignedTasker.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-primary-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-primary-600">
                    {task.assignedTasker.name}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    {task.assignedTasker.rating?.toFixed(1)} ({task.assignedTasker.reviewCount}{' '}
                    reviews)
                  </div>
                </div>
              </Link>

              {task.agreedPrice && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">Agreed Price</p>
                  <p className="text-xl font-bold text-primary-600">
                    ${task.agreedPrice.toFixed(0)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Login Prompt */}
          {!isAuthenticated && (
            <div className="bg-primary-50 rounded-lg p-6">
              <h3 className="font-semibold text-primary-900 mb-2">Want to make an offer?</h3>
              <p className="text-primary-700 text-sm mb-4">
                Sign up or log in to submit your offer for this task.
              </p>
              <Link
                to="/login"
                className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
              >
                Log in to Make Offer
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && task.assignedTasker && (
        <PaymentModal
          taskId={task.id}
          amount={task.agreedPrice || task.budgetMax || 0}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
