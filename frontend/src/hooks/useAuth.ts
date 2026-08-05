import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { IAuthResponseData, IUser } from '@/types';

export const useLoginMutation = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await AuthService.login(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed.');
      }
      return response.data;
    },
    onSuccess: (data: IAuthResponseData) => {
      setAuth(data.user, data.token);
      if (data.user.role === 'Admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    },
  });
};

export const useGoogleLoginMutation = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (googleToken: string) => {
      const response = await AuthService.googleAuth(googleToken);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Google authentication failed.');
      }
      return response.data;
    },
    onSuccess: (data: IAuthResponseData) => {
      setAuth(data.user, data.token);
      if (data.user.role === 'Admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (data: {
      fullName: string;
      email: string;
      password: string;
      targetExam?: string;
    }) => {
      const response = await AuthService.register(data);
      if (!response.success) {
        throw new Error(response.message || 'Registration failed.');
      }
      return response;
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await AuthService.forgotPassword(email);
      if (!response.success) {
        throw new Error(response.message || 'Failed to request password reset.');
      }
      return response;
    },
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const response = await AuthService.resetPassword(data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to reset password.');
      }
      return response;
    },
  });
};

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await AuthService.verifyEmail(token);
      if (!response.success) {
        throw new Error(response.message || 'Email verification failed.');
      }
      return response;
    },
  });
};

export const useLogoutMutation = () => {
  const router = useRouter();
  const logoutStore = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await AuthService.logout();
      } catch (error) {
        // Ignore logout network errors and clear client session regardless
      }
    },
    onSettled: () => {
      logoutStore();
      queryClient.clear();
      router.push('/login');
    },
  });
};

export const useCurrentUserQuery = () => {
  const { token, user, setAuth, logout } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser', token],
    queryFn: async () => {
      if (!token) return null;
      const response = await AuthService.getCurrentUser();
      if (response.success && response.data?.user) {
        setAuth(response.data.user, token);
        return response.data.user;
      } else {
        logout();
        throw new Error(response.message || 'Failed to rehydrate session');
      }
    },
    enabled: !!token && !user,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
