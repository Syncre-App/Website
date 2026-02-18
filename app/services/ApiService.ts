// ApiService.ts - HTTP client for Syncre API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.syncre.xyz/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

class ApiServiceClass {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  get baseUrlValue() {
    return this.baseUrl;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('syncre_auth_token');
    }
    return null;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) {
      headers['X-Timezone'] = timezone;
    }

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.buildHeaders(),
      });

      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? (data.message || data.error || `Request failed with status ${response.status}`) : undefined,
        statusCode: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        statusCode: 0,
      };
    }
  }

  async post<T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(body),
      });

      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? (data.message || data.error || `Request failed with status ${response.status}`) : undefined,
        statusCode: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        statusCode: 0,
      };
    }
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.buildHeaders(),
      });

      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? (data.message || data.error || `Request failed with status ${response.status}`) : undefined,
        statusCode: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        statusCode: 0,
      };
    }
  }

  async getStreaksForChats(chatIds: (string | number)[]): Promise<ApiResponse> {
    return this.post('/chat/streaks', { chatIds });
  }
}

export const ApiService = new ApiServiceClass();
