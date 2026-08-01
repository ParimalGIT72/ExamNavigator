export interface IUser {
  id: string;
  fullName: string;
  email: string;
  role: 'Student' | 'Admin';
  accountStatus: 'Active' | 'Suspended';
  emailVerified: boolean;
  targetExam?: 'JEE' | 'NEET' | 'MHT-CET' | 'University' | 'Other';
  profileId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserProfile {
  id?: string;
  userId: string;
  profileImage?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'PreferNotToSay';
  dateOfBirth?: string;
  phoneNumber?: string;
  targetExam: 'JEE' | 'NEET' | 'MHT-CET' | 'University' | 'Other';
  targetYear?: number;
  preferredSubjects?: string[];
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  errors?: unknown[];
}

export interface IAuthResponseData {
  token: string;
  refreshToken?: string;
  user: IUser;
}
