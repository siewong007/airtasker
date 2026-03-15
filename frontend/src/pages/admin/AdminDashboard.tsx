import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Briefcase, FolderOpen, TrendingUp } from 'lucide-react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await api.get<Record<string, number>>('/admin/stats');
      return res.data;
    },
  });

  if (isLoading) {
    return <LoadingSpinner className="py-24" size="lg" />;
  }

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600', link: '/admin/users' },
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: Briefcase, color: 'text-green-600', link: '/admin/tasks' },
    { label: 'Open Tasks', value: stats?.openTasks || 0, icon: TrendingUp, color: 'text-yellow-600', link: '/admin/tasks' },
    { label: 'Categories', value: stats?.totalCategories || 0, icon: FolderOpen, color: 'text-purple-600', link: '/admin/categories' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <card.icon className={`h-10 w-10 ${card.color}`} />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
          <p className="text-sm text-gray-500">View, activate/deactivate users, manage roles</p>
        </Link>
        <Link
          to="/admin/tasks"
          className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Task Moderation</h3>
          <p className="text-sm text-gray-500">Review and moderate tasks, cancel inappropriate listings</p>
        </Link>
        <Link
          to="/admin/categories"
          className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Category Management</h3>
          <p className="text-sm text-gray-500">Create, edit, and manage task categories</p>
        </Link>
      </div>
    </div>
  );
}
