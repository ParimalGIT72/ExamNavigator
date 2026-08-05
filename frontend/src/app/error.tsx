'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <Card className="py-10 px-6 shadow-md text-center space-y-4">
          <div className="p-3 bg-red-50 rounded-full w-fit mx-auto text-red-600">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Something Went Wrong</h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            {error.message || 'An unexpected application error occurred while processing your request.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button variant="primary" onClick={() => reset()} className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" /> Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
