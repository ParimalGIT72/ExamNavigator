export interface IUser {
  id: string;
  fullName: string;
  email: string;
  role: 'Student' | 'Admin';
  accountStatus: 'Active' | 'Suspended';
  emailVerified: boolean;
  profileId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  errors?: unknown[];
}
