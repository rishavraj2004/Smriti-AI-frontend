import { apiClient } from './client';
import { FamilyMemory, CreateMemoryPayload, UpdateMemoryPayload, ScrapbookResponse } from '../types/scrapbook';

export const scrapbookApi = {
  /**
   * Fetch all memories for the authenticated user (or caregiver's linked patient)
   * Includes automatic retry for Render cold starts (502 / 503)
   */
  async getMemories(patientId?: string): Promise<FamilyMemory[]> {
    const params = patientId ? { patientId } : undefined;
    try {
      const response = await apiClient.get<ScrapbookResponse>('/api/memories', { params });
      return response.data.memories || [];
    } catch (err: any) {
      // If server is cold-starting (502 / 503 / network timeout), retry once after a short delay
      if (err.status === 502 || err.status === 503 || err.message?.includes('502') || err.message?.includes('503')) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const retryRes = await apiClient.get<ScrapbookResponse>('/api/memories', { params });
          return retryRes.data.memories || [];
        } catch {
          // Graceful fallback to empty list
          return [];
        }
      }
      return [];
    }
  },

  /**
   * Fetch a single memory by ID
   */
  async getMemory(id: string): Promise<FamilyMemory | null> {
    try {
      const response = await apiClient.get<ScrapbookResponse>(`/api/memories/${id}`);
      return response.data.memory || null;
    } catch {
      return null;
    }
  },

  /**
   * Create a new family memory entry in MongoDB
   */
  async createMemory(payload: CreateMemoryPayload): Promise<FamilyMemory> {
    const response = await apiClient.post<ScrapbookResponse>('/api/memories', payload);
    if (!response.data.memory) {
      throw new Error(response.data.message || 'Failed to save family memory');
    }
    return response.data.memory;
  },

  /**
   * Update an existing family memory entry
   */
  async updateMemory(id: string, payload: UpdateMemoryPayload): Promise<FamilyMemory> {
    const response = await apiClient.patch<ScrapbookResponse>(`/api/memories/${id}`, payload);
    if (!response.data.memory) {
      throw new Error(response.data.message || 'Failed to update family memory');
    }
    return response.data.memory;
  },

  /**
   * Delete a memory from the scrapbook
   */
  async deleteMemory(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<ScrapbookResponse>(`/api/memories/${id}`);
      return response.data.success;
    } catch {
      return false;
    }
  },

  /**
   * Utility to echo or store media reference
   */
  async uploadMedia(dataUri: string, type: 'image' | 'audio' = 'image'): Promise<string> {
    const response = await apiClient.post<{ success: boolean; url: string }>('/api/memories/media', {
      dataUri,
      type,
    });
    return response.data.url;
  },
};
