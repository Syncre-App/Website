// StorageService.ts - Browser storage wrapper
const AUTH_TOKEN_KEY = 'syncre_auth_token';
const USER_DATA_KEY = 'user_data';

class StorageServiceClass {
  async setAuthToken(token: string): Promise<void> {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  async getAuthToken(): Promise<string | null> {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  async setUserData(user: any): Promise<void> {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }

  async getUserData(): Promise<any | null> {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }

  async getDeviceId(): Promise<string> {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = 'web-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  async clearAll(): Promise<void> {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  }
}

export const StorageService = new StorageServiceClass();
