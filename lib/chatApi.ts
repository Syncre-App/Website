import { apiClient } from './apiClient';
import { mapChatSummary, mapServerMessage } from './chatMappers';
import type { ApiResponse, ChatMessage, ChatSummary } from './types';

interface ChatListResponse {
  chats: ChatSummary[];
}

interface RawChatListResponse {
  chats: unknown[];
}

interface RawMessageResponse {
  messages: unknown[];
  hasMore: boolean;
  nextCursor: string | null;
  timezone?: string;
}

interface MessageResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor: string | null;
  timezone?: string;
}

interface UnreadSummary {
  total: number;
  chats: Record<string, number>;
}

export const chatApi = {
  async listChats(token: string): Promise<ApiResponse<ChatListResponse>> {
    const response = await apiClient.get<RawChatListResponse>('/chat', token);
    if (!response.success || !response.data) {
      return { ...response, data: undefined };
    }
    return {
      ...response,
      data: {
        chats: response.data.chats.map((entry) => mapChatSummary(entry)),
      },
    };
  },
  async getChat(chatId: string, token: string): Promise<ApiResponse<{ chat: ChatSummary }>> {
    const response = await apiClient.get<{ chat: unknown }>(`/chat/${chatId}`, token);
    if (!response.success || !response.data) {
      return { ...response, data: undefined };
    }
    return {
      ...response,
      data: {
        chat: mapChatSummary(response.data.chat),
      },
    };
  },
  async getMessages(
    chatId: string,
    params: { before?: string; limit?: number; deviceId?: string | null } = {},
    token: string
  ): Promise<ApiResponse<MessageResponse>> {
    const search = new URLSearchParams();
    if (params.before) {
      search.set('before', params.before);
    }
    if (params.limit) {
      search.set('limit', String(params.limit));
    }
    if (params.deviceId) {
      search.set('deviceId', params.deviceId);
    }
    const query = search.toString();
    const response = await apiClient.get<RawMessageResponse>(
      `/chat/${chatId}/messages${query ? `?${query}` : ''}`,
      token
    );
    if (!response.success || !response.data) {
      return { ...response, data: undefined };
    }
    return {
      ...response,
      data: {
        messages: response.data.messages.map((entry) => mapServerMessage(entry)),
        hasMore: Boolean(response.data.hasMore),
        nextCursor: response.data.nextCursor ?? null,
        timezone: response.data.timezone,
      },
    };
  },
  unreadSummary(token: string): Promise<ApiResponse<UnreadSummary>> {
    return apiClient.get<UnreadSummary>('/chat/unread/summary', token);
  },
  markSeen(chatId: string, token: string) {
    return apiClient.post<{ updated: number }>(`/chat/${chatId}/seen`, {}, token);
  },
};
