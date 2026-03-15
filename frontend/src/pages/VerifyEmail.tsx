import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }

    api.get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus(res.data.verified ? 'success' : 'error');
      })
      .catch(() => {
        setStatus('error');
      });
  }, [searchParams]);

  if (status === 'loading') {
    return <LoadingSpinner className="py-24" size="lg" />;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      {status === 'success' ? (
        <>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
          <p className="text-gray-500 mb-6">
            Your email has been verified successfully. You can now enjoy all features.
          </p>
          <Link
            to="/dashboard"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            Go to Dashboard
          </Link>
        </>
      ) : (
        <>
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-gray-500 mb-6">
            The verification link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/dashboard"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            Go to Dashboard
          </Link>
        </>
      )}
    </div>
  );
}
