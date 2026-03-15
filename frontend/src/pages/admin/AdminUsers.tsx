import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Shield, Ban, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/services/api';
import { User, Page } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['adminUsers', page],
    queryFn: async () => {
      const res = await api.get<Page<User>>(`/admin/users?page=${page}&size=20`);
      return res.data;
    },
  });

  const toggleActive = useMutation({
    mutationFn: (id: number) => api.post(`/admin/users/${id}/toggle-active`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User status updated');
    },
  });

  const setRole = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      api.post(`/admin/users/${id}/set-role?role=${role}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User role updated');
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : (
        <>
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usersData?.content.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/profile/${user.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                        {user.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.emailVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="text-xs text-yellow-600">Unverified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setRole.mutate({
                            id: user.id,
                            role: user.role === 'ADMIN' ? 'USER' : 'ADMIN',
                          })}
                          className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                          title={user.role === 'ADMIN' ? 'Remove admin' : 'Make admin'}
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleActive.mutate(user.id)}
                          className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                          title="Toggle active"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {usersData && usersData.totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={usersData.first}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {usersData.number + 1} of {usersData.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={usersData.last}
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
