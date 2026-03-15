import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Briefcase, DollarSign, Star, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/users';
import { paymentService } from '@/services/payments';
import { useMyOffers } from '@/hooks/useOffers';
import TaskCard from '@/components/TaskCard';
import OfferCard from '@/components/OfferCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posted' | 'assigned' | 'offers' | 'payments'>('posted');
  const [paymentPage, setPaymentPage] = useState(0);

  const { data: postedTasks, isLoading: postedLoading } = useQuery({
    queryKey: ['myPostedTasks', user?.id],
    queryFn: () => userService.getUserTasks(user!.id),
    enabled: !!user && activeTab === 'posted',
  });

  const { data: assignedTasks, isLoading: assignedLoading } = useQuery({
    queryKey: ['myAssignedTasks', user?.id],
    queryFn: () => userService.getAssignedTasks(user!.id),
    enabled: !!user && activeTab === 'assigned',
  });

  const { data: myOffers, isLoading: offersLoading } = useMyOffers();

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['paymentHistory', paymentPage],
    queryFn: () => paymentService.getPaymentHistory(paymentPage),
    enabled: activeTab === 'payments',
  });

  const { data: earnings } = useQuery({
    queryKey: ['myEarnings'],
    queryFn: () => paymentService.getTotalEarnings(),
  });

  const { data: spending } = useQuery({
    queryKey: ['mySpending'],
    queryFn: () => paymentService.getTotalSpending(),
  });

  if (!user) {
    return null;
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    HELD: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
    FAILED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Email Verification Banner */}
      {user.emailVerified === false && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-yellow-800">Verify your email</p>
            <p className="text-sm text-yellow-600">Please check your inbox to verify your email address.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>
        <Link
          to="/post-task"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          <Plus className="h-5 w-5 mr-1" />
          Post a Task
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center text-gray-500 mb-2">
            <Briefcase className="h-5 w-5 mr-2" />
            <span className="text-sm">Tasks Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{user.completedTasks}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center text-gray-500 mb-2">
            <Star className="h-5 w-5 mr-2" />
            <span className="text-sm">Rating</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {user.rating?.toFixed(1)} <span className="text-sm font-normal text-gray-500">({user.reviewCount})</span>
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center text-green-600 mb-2">
            <DollarSign className="h-5 w-5 mr-2" />
            <span className="text-sm">Earned</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            ${(earnings || 0).toFixed(0)}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center text-gray-500 mb-2">
            <DollarSign className="h-5 w-5 mr-2" />
            <span className="text-sm">Spent</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${(spending || 0).toFixed(0)}
          </p>
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
            My Posted Tasks
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`pb-3 border-b-2 font-medium text-sm ${
              activeTab === 'assigned'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Assigned to Me
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`pb-3 border-b-2 font-medium text-sm ${
              activeTab === 'offers'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Offers
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'payments'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="h-4 w-4 mr-1" />
            Payment History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'posted' && (
        <div>
          {postedLoading ? (
            <LoadingSpinner />
          ) : postedTasks?.content.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't posted any tasks yet.</p>
              <Link
                to="/post-task"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                <Plus className="h-5 w-5 mr-1" />
                Post your first task
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {postedTasks?.content.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'assigned' && (
        <div>
          {assignedLoading ? (
            <LoadingSpinner />
          ) : assignedTasks?.content.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No tasks assigned to you yet.</p>
              <Link
                to="/tasks"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Browse available tasks
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {assignedTasks?.content.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'offers' && (
        <div>
          {offersLoading ? (
            <LoadingSpinner />
          ) : myOffers?.content.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't made any offers yet.</p>
              <Link
                to="/tasks"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Browse tasks to make offers
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myOffers?.content.map((offer) => (
                <div key={offer.id} className="bg-white rounded-lg border p-4">
                  <Link
                    to={`/tasks/${offer.taskId}`}
                    className="text-primary-600 hover:text-primary-700 font-medium mb-3 block"
                  >
                    View Task #{offer.taskId}
                  </Link>
                  <OfferCard offer={offer} showActions isOwner />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div>
          {paymentsLoading ? (
            <LoadingSpinner />
          ) : payments?.content.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No payment history yet.</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments?.content.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {payment.description || `Payment for Task #${payment.taskId}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={payment.payer.id === user.id ? 'text-red-600' : 'text-green-600'}>
                            {payment.payer.id === user.id ? '-' : '+'}${payment.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${(payment.platformFee || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[payment.status]}`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {payments && payments.totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  <button
                    onClick={() => setPaymentPage((p) => Math.max(0, p - 1))}
                    disabled={payments.first}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-600">
                    Page {payments.number + 1} of {payments.totalPages}
                  </span>
                  <button
                    onClick={() => setPaymentPage((p) => p + 1)}
                    disabled={payments.last}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
