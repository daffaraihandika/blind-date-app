export type Gender = 'female' | 'male' | 'other';

export interface LoginFormValues {
  identifier: string; // Email or Phone
  password: string;
  rememberMe: boolean;
}

export interface SignupFormValues {
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  birthDate: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export interface UserProfilePreview {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  city: string;
  bio: string;
  interests: string[];
  selfieVerified: boolean;
  avatarUrl: string;
  photos: string[];
  isPro: boolean;
}
