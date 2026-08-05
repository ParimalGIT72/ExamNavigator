'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { useRegisterMutation } from '@/hooks/useAuth';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  targetExam: z.enum(['JEE', 'NEET', 'MHT-CET', 'University', 'Other']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      targetExam: 'JEE',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      },
    });
  };

  return (
    <PublicRoute>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link href="/" className="inline-flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1">
            <GraduationCap className="h-10 w-10 text-brand-600" />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">ExamNavigator</span>
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">
            Already registered?{' '}
            <Link href="/login" className="font-medium text-brand-600 hover:text-brand-500 underline underline-offset-2">
              Log in to your account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="py-8 px-4 sm:px-10 shadow-md">
            {registerMutation.isError && (
              <div className="mb-4">
                <Alert variant="error" message={registerMutation.error.message || 'Registration failed.'} />
              </div>
            )}

            {registerMutation.isSuccess && (
              <div className="mb-4">
                <Alert
                  variant="success"
                  title="Account Created!"
                  message="Registration successful! Redirecting to login..."
                />
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                label="Full Name"
                type="text"
                placeholder="Alex Johnson"
                autoComplete="name"
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="alex@example.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium text-slate-700" htmlFor="targetExamSelect">Target Competitive Exam</label>
                <select
                  id="targetExamSelect"
                  aria-label="Target Competitive Exam"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  {...register('targetExam')}
                >
                  <option value="JEE">JEE (Engineering)</option>
                  <option value="NEET">NEET (Medical)</option>
                  <option value="MHT-CET">MHT-CET (State CET)</option>
                  <option value="University">University Examinations</option>
                  <option value="Other">Other Examination</option>
                </select>
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={registerMutation.isPending}>
                <UserPlus className="h-4 w-4 mr-2" /> Create Account
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </PublicRoute>
  );
}
