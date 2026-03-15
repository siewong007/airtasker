import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, User } from 'lucide-react';
import { Task } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const statusColors: Record<string, string> = {
    OPEN: 'bg-green-100 text-green-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <Link
      to={`/tasks/${task.id}`}
      className="block bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
              statusColors[task.status]
            }`}
          >
            {task.status.replace('_', ' ')}
          </span>
          {task.category && (
            <span className="text-xs text-gray-500 flex items-center">
              <span className="mr-1">{task.category.icon}</span>
              {task.category.name}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {task.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>

        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
          {task.location && (
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {task.location}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
              {task.poster.avatarUrl ? (
                <img
                  src={task.poster.avatarUrl}
                  alt={task.poster.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-primary-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{task.poster.name}</p>
              <p className="text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-primary-600">
              ${task.budgetMax?.toFixed(0)}
            </p>
            {task.offerCount > 0 && (
              <p className="text-xs text-gray-500">{task.offerCount} offer(s)</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
