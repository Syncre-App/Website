import { TimezoneService } from './timezone';
import type { ApiResponse } from './types';

const DEFAULT_BASE = 'https://api.syncre.xyz/v1';
const normalizeBase = (url: string) => url.replace(/\/+$/, '');

export const API_BASE_URL = normalizeBase(process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE);

interface ErrorResponse {
  message?: string;
  error?: string;
}

const buildHeaders = (token?: string, extra?: Record<string, string>) => {
  const headers: Record<string, string> = extra ? { ...extra } : {};
  TimezoneService.applyHeader(headers);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const parseResponse = async (response: Response): Promise<{ ok: boolean; status: number; data: unknown }> => {
  const result = {
    ok: response.ok,
    status: response.status,
    data: null as unknown,
  };

  try {
    result.data = await response.json();
  } catch {
    try {
      result.data = { message: await response.text() };
    } catch {
      result.data = { message: 'Unable to parse response body' };
    }
  }
  return result;
};

const request = async <T>(
  method: string,
  endpoint: string,
  { token, body, headers: override }: { token?: string; body?: unknown; headers?: Record<string, string> } = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = buildHeaders(token, override);
  let payload: BodyInit | undefined;

  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: payload,
    });

    const parsed = await parseResponse(response);
    const errorData = parsed.data as ErrorResponse | null;
    const errorMessage =
      errorData?.message ||
      errorData?.error ||
      (!parsed.ok ? `Request failed with status ${parsed.status}` : undefined);

    return {
      success: parsed.ok,
      statusCode: parsed.status,
      data: parsed.ok ? (parsed.data as T) : undefined,
      error: parsed.ok ? undefined : errorMessage,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    return {
      success: false,
      statusCode: 0,
      error: message,
    };
  }
};

export const apiClient = {
  get<T>(endpoint: string, token?: string) {
    return request<T>('GET', endpoint, { token });
  },
  post<T>(endpoint: string, body?: unknown, token?: string) {
    return request<T>('POST', endpoint, { token, body });
  },
  put<T>(endpoint: string, body?: unknown, token?: string) {
    return request<T>('PUT', endpoint, { token, body });
  },
  delete<T>(endpoint: string, token?: string) {
    return request<T>('DELETE', endpoint, { token });
  },
  upload<T>(endpoint: string, formData: FormData, token?: string) {
    return request<T>('POST', endpoint, { token, body: formData });
  },
};
