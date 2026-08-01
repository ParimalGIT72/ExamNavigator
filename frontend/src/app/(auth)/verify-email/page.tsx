'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GraduationCap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AuthService } from '@/services/auth.service';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing from the URL.');
      return;
    }

    const verify = async () => {
      try {
        const response = await AuthService.verifyEmail(token);
        if (response.success) {
          setStatus('success');
          setMessage('Your email address has been verified successfully.');
        } else {
          setStatus('error');
          setMessage(response.message || 'Email verification failed.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage('Network error during email verification.');
      }
    };

    verify();
  }, [token]);

  return (
    <Card className="py-8 px-4 sm:px-10 text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
          <p className="text-slate-600">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <p className="text-slate-800 font-medium">{message}</p>
          <Link href="/login" className="w-full">
            <Button variant="primary" className="w-full">
              Proceed to Login
            </Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-red-700 font-medium">{message}</p>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Login
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2">
          <GraduationCap className="h-10 w-10 text-brand-600" />
          <span className="text-2xl font-bold text-slate-900 tracking-tight">ExamNavigator</span>
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">Email Verification</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense
          fallback={
            <Card className="py-8 px-4 sm:px-10 text-center">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
                <p className="text-slate-600">Loading...</p>
              </div>
            </Card>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
