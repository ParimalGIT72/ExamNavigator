'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GraduationCap, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { useVerifyEmailMutation } from '@/hooks/useAuth';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const verifyMutation = useVerifyEmailMutation();

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    }
  }, [token]);

  if (!token) {
    return (
      <Card className="py-8 px-4 sm:px-10 text-center shadow-md">
        <Alert
          variant="error"
          title="Missing Token"
          message="Verification token is missing from the URL."
        />
        <div className="mt-6">
          <Link href="/login" className="w-full inline-block">
            <Button variant="outline" className="w-full">
              Back to Login
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="py-8 px-4 sm:px-10 text-center shadow-md">
      {verifyMutation.isPending && (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
          <p className="text-slate-600">Verifying your email address...</p>
        </div>
      )}

      {verifyMutation.isSuccess && (
        <div className="flex flex-col items-center space-y-4">
          <Alert
            variant="success"
            title="Email Verified!"
            message="Your email address has been verified successfully."
          />
          <Link href="/login" className="w-full">
            <Button variant="primary" className="w-full">
              Proceed to Login
            </Button>
          </Link>
        </div>
      )}

      {verifyMutation.isError && (
        <div className="flex flex-col items-center space-y-4">
          <Alert
            variant="error"
            title="Verification Failed"
            message={verifyMutation.error.message || 'Email verification failed.'}
          />
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
    <PublicRoute>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link href="/" className="inline-flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1">
            <GraduationCap className="h-10 w-10 text-brand-600" />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">ExamNavigator</span>
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">Email Verification</h1>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Suspense
            fallback={
              <Card className="py-8 px-4 sm:px-10 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
                  <p className="text-slate-600">Loading verification session...</p>
                </div>
              </Card>
            }
          >
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
    </PublicRoute>
  );
}
