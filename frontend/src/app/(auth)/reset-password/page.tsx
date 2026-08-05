'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Key, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { useResetPasswordMutation } from '@/hooks/useAuth';

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const resetPasswordMutation = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) return;
    resetPasswordMutation.mutate(
      { token, newPassword: data.newPassword },
      {
        onSuccess: () => {
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        },
      }
    );
  };

  if (!token) {
    return (
      <Card className="py-8 px-4 sm:px-10 shadow-md">
        <Alert
          variant="error"
          title="Missing Reset Token"
          message="Password reset token is missing from the URL. Please check your reset link or request a new one."
        />
        <div className="mt-6 text-center text-sm">
          <Link href="/forgot-password" className="font-medium text-brand-600 hover:text-brand-500 underline underline-offset-2">
            Request new reset link
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="py-8 px-4 sm:px-10 shadow-md">
      {resetPasswordMutation.isError && (
        <div className="mb-4">
          <Alert variant="error" message={resetPasswordMutation.error.message || 'Failed to reset password.'} />
        </div>
      )}

      {resetPasswordMutation.isSuccess && (
        <div className="mb-4">
          <Alert
            variant="success"
            title="Password Reset Successful!"
            message="Your password has been reset. Redirecting to login..."
          />
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" variant="primary" className="w-full" isLoading={resetPasswordMutation.isPending}>
          <Key className="h-4 w-4 mr-2" /> Reset Password
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link href="/" className="inline-flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1">
            <GraduationCap className="h-10 w-10 text-brand-600" />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">ExamNavigator</span>
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">Set new password</h1>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Suspense
            fallback={
              <Card className="py-8 px-4 sm:px-10 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
                  <p className="text-slate-600">Loading reset session...</p>
                </div>
              </Card>
            }
          >
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </PublicRoute>
  );
}
