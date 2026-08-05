'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { useForgotPasswordMutation } from '@/hooks/useAuth';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data.email);
  };

  return (
    <PublicRoute>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link href="/" className="inline-flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1">
            <GraduationCap className="h-10 w-10 text-brand-600" />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">ExamNavigator</span>
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">Forgot password?</h1>
          <p className="mt-2 text-sm text-slate-600">Enter your registered email address to receive reset instructions.</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="py-8 px-4 sm:px-10 shadow-md">
            {forgotPasswordMutation.isError && (
              <div className="mb-4">
                <Alert variant="error" message={forgotPasswordMutation.error.message || 'Failed to request password reset.'} />
              </div>
            )}

            {forgotPasswordMutation.isSuccess && (
              <div className="mb-4">
                <Alert
                  variant="success"
                  title="Instructions Sent!"
                  message="Password reset instructions have been sent to your email address."
                />
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                label="Email Address"
                type="email"
                placeholder="student@example.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <Button type="submit" variant="primary" className="w-full" isLoading={forgotPasswordMutation.isPending}>
                <Mail className="h-4 w-4 mr-2" /> Send Reset Link
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link href="/login" className="font-medium text-brand-600 hover:text-brand-500 underline underline-offset-2">
                Return to login
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PublicRoute>
  );
}
