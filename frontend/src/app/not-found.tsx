import React from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <Link href="/" className="inline-flex items-center space-x-2">
          <GraduationCap className="h-10 w-10 text-brand-600" />
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">ExamNavigator</span>
        </Link>

        <Card className="py-10 px-6 shadow-md text-center space-y-4">
          <div className="p-3 bg-brand-50 rounded-full w-fit mx-auto text-brand-600">
            <FileQuestion className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
          <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            The page or module you are looking for doesn't exist, has been moved, or is under development.
          </p>

          <div className="pt-4">
            <Link href="/dashboard">
              <Button variant="primary" className="w-full flex items-center justify-center">
                <ArrowLeft className="h-4 w-4 mr-2" /> Return to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
