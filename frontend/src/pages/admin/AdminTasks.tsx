import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/services/api';
import { Task, Page } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminTasks() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['adminTasks', page],
    queryFn: async () => {
      const res = await api.get<Page<Task>>(`/admin/tasks?page=${page}&size=20`);
      return res.data;
    },
  });

  const cancelTask = useMutation({
    mutationFn: (id: number) => api.post(`/admin/tasks/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTasks'] });
      toast.success('Task cancelled');
    },
  });

  const statusColors: Record<string, string> = {
    OPEN: 'bg-green-100 text-green-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Task Moderation</h1>
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : (
        <>
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poster</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasksData?.content.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link to={`/tasks/${task.id}`} className="font-medium text-gray-900 hover:text-primary-600 line-clamp-1">
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.poster.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${task.budgetMax?.toFixed(0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[task.status]}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(task.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.status !== 'CANCELLED' && task.status !== 'COMPLETED' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Cancel this task?')) {
                              cancelTask.mutate(task.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Cancel task"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tasksData && tasksData.totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={tasksData.first}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {tasksData.number + 1} of {tasksData.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={tasksData.last}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
