import { apiClient } from './client';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  language?: string;
  createdAt: string | Date;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  language: string;
  id: string;
  createdAt: string;
}

export interface ChatHistoryResponse {
  success: boolean;
  history: Array<{
    id: string;
    message: string;
    reply: string;
    language: string;
    createdAt: string;
  }>;
}

export const chatApi = {
  /**
   * Send a message to Mitr AI with automatic patient language context.
   */
  async sendMessage(message: string, language?: string): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/api/chat', {
      message,
      language,
    });
    return response.data;
  },

  /**
   * Fetch recent conversation history from MongoDB.
   */
  async getHistory(): Promise<ChatHistoryResponse> {
    const response = await apiClient.get<ChatHistoryResponse>('/api/chat/history');
    return response.data;
  },

  /**
   * Clear user conversation history.
   */
  async clearHistory(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>('/api/chat/history');
    return response.data;
  },
};
