import { ApiClient } from '@/lib/api-client';
import { IApiResponse, IAuthResponseData, IUser } from '@/types';

export class AuthService {
  public static async register(data: {
    fullName: string;
    email: string;
    password: string;
    targetExam?: string;
  }): Promise<IApiResponse<{ userId: string }>> {
    return await ApiClient.post<{ userId: string }>('/auth/register', data);
  }

  public static async login(data: {
    email: string;
    password: string;
  }): Promise<IApiResponse<IAuthResponseData>> {
    return await ApiClient.post<IAuthResponseData>('/auth/login', data);
  }

  public static async logout(): Promise<IApiResponse> {
    return await ApiClient.post('/auth/logout');
  }

  public static async getCurrentUser(): Promise<IApiResponse<{ user: IUser }>> {
    return await ApiClient.get<{ user: IUser }>('/auth/me');
  }

  public static async forgotPassword(email: string): Promise<IApiResponse<{ resetToken: string }>> {
    return await ApiClient.post<{ resetToken: string }>('/auth/forgot-password', { email });
  }

  public static async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<IApiResponse> {
    return await ApiClient.post('/auth/reset-password', data);
  }

  public static async verifyEmail(token: string): Promise<IApiResponse> {
    return await ApiClient.post('/auth/verify-email', { token });
  }

  public static async googleAuth(googleToken: string): Promise<IApiResponse<IAuthResponseData>> {
    return await ApiClient.post<IAuthResponseData>('/auth/google', { googleToken });
  }
}
