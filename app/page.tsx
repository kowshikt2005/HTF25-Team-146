'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const user = authService.getUser();
      if (user?.role === 'mentor') {
        router.push('/mentor/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Collaborative Workspace System
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Redirecting to your dashboard...
        </p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}
