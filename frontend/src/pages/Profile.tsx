import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, MapPin, Star, Calendar, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { userService } from '@/services/users';
import { reviewService } from '@/services/reviews';
import { useAuth } from '@/context/AuthContext';
import TaskCard from '@/components/TaskCard';
import ReviewCard from '@/components/ReviewCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'posted' | 'completed' | 'reviews'>('posted');

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(Number(id)),
    enabled: !!id,
  });

  const { data: postedTasks } = useQuery({
    queryKey: ['userTasks', id],
    queryFn: () => userService.getUserTasks(Number(id)),
    enabled: !!id && activeTab === 'posted',
  });

  const { data: completedTasks } = useQuery({
    queryKey: ['userCompletedTasks', id],
    queryFn: () => userService.getAssignedTasks(Number(id)),
    enabled: !!id && activeTab === 'completed',
  });

  const { data: reviews } = useQuery({
    queryKey: ['userReviews', id],
    queryFn: () => reviewService.getReviewsByUserId(Number(id)),
    enabled: !!id && activeTab === 'reviews',
  });

  const isOwnProfile = currentUser?.id === Number(id);

  if (userLoading) {
    return <LoadingSpinner className="py-24" size="lg" />;
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-primary-600" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                  {user.location && (
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {user.location}
                    </span>
                  )}
                  {user.createdAt && (
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Member since {format(new Date(user.createdAt), 'MMM yyyy')}
                    </span>
                  )}
                </div>
              </div>

              {isOwnProfile && (
                <Link
                  to="/edit-profile"
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Edit Profile
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-6">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-1" />
                <span className="font-semibold">{user.rating.toFixed(1)}</span>
                <span className="text-gray-500 ml-1">({user.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-primary-600 mr-1" />
                <span className="font-semibold">{user.completedTasks}</span>
                <span className="text-gray-500 ml-1">tasks completed</span>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-gray-600 mt-4">{user.bio}</p>
            )}

            {/* Skills */}
            {user.skills && user.skills.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('posted')}
            className={`pb-3 border-b-2 font-medium text-sm ${
              activeTab === 'posted'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Posted Tasks
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed Tasks
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 font-medium text-sm ${
              activeTab === 'reviews'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reviews ({user.reviewCount})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'posted' && (
        <div>
          {postedTasks?.content.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No posted tasks yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {postedTasks?.content.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div>
          {completedTasks?.content.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No completed tasks yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {completedTasks?.content.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          {reviews?.content.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews?.content.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
