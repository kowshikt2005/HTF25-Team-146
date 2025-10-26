'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';
import { authService } from '../../../../lib/auth';

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing Google login...');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('Google login was cancelled or failed.');
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('Invalid callback parameters.');
          return;
        }

        // Send the authorization code to our backend
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/auth/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Store the JWT token and user info
          authService.setToken(data.token);
          authService.setUser(data.user);
          
          setStatus('success');
          setMessage(`Welcome ${data.user.name}! ${data.user.hasCalendarAccess ? 'Google Calendar is connected.' : ''}`);
          
          // Redirect based on user role
          setTimeout(() => {
            if (data.user.role === 'mentor') {
              router.push('/mentor/dashboard');
            } else {
              router.push('/employee/dashboard');
            }
          }, 2000);
        } else {
          const errorData = await response.json();
          setStatus('error');
          setMessage(errorData.error || 'Failed to login with Google.');
        }
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred.');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <LoadingSpinner />
              <h2 className="text-xl font-semibold text-gray-900 mt-4">Signing you in</h2>
              <p className="text-gray-600 mt-2">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">Login Successful!</h2>
              <p className="text-gray-600 mt-2">{message}</p>
              <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">Login Failed</h2>
              <p className="text-gray-600 mt-2">{message}</p>
              <button
                onClick={() => router.push('/auth/login')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}