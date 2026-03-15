import { useState } from 'react';
import { X, DollarSign, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/payments';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  taskId: number;
  amount: number;
  onClose: () => void;
}

export default function PaymentModal({ taskId, amount, onClose }: PaymentModalProps) {
  const queryClient = useQueryClient();
  const [paymentComplete, setPaymentComplete] = useState(false);

  const platformFee = amount * 0.1;
  const netAmount = amount - platformFee;

  const createPayment = useMutation({
    mutationFn: async () => {
      const payment = await paymentService.createPaymentIntent(taskId);
      await paymentService.completePayment(payment.id);
      return payment;
    },
    onSuccess: () => {
      setPaymentComplete(true);
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['mySpending'] });
      toast.success('Payment completed!');
    },
    onError: () => {
      toast.error('Payment failed. Please try again.');
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        {paymentComplete ? (
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 mb-6">The tasker has been paid successfully.</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Confirm Payment</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Task Amount</span>
                <span className="font-semibold text-gray-900">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Platform Fee (10%)</span>
                <span className="text-gray-500">-${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Tasker Receives</span>
                <span className="font-semibold text-green-600">${netAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center text-gray-700">
                <DollarSign className="h-5 w-5 mr-2 text-primary-600" />
                <div>
                  <p className="font-medium">Total Charge</p>
                  <p className="text-2xl font-bold text-primary-600">${amount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => createPayment.mutate()}
                disabled={createPayment.isPending}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {createPayment.isPending ? 'Processing...' : 'Confirm Payment'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
