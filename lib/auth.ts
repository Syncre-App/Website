import { apiClient } from './apiClient';
import { storage } from './storage';
import type { ApiResponse, UserProfile } from './types';

const TOKEN_KEY = 'syncre_auth_token';

interface LoginPayload {
  token: string;
  user: UserProfile;
}

export const authApi = {
  getStoredToken(): string | null {
    return storage.getItem(TOKEN_KEY);
  },
  persistToken(token: string) {
    storage.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    storage.removeItem(TOKEN_KEY);
  },
  login(email: string, password: string): Promise<ApiResponse<LoginPayload>> {
    return apiClient.post<LoginPayload>('/auth/login', { email, password });
  },
  fetchProfile(token: string): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>('/user/me', token);
  },
};
