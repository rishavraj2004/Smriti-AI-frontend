import { apiClient } from './client';
import { FamilyMemory, CreateMemoryPayload, UpdateMemoryPayload, ScrapbookResponse } from '../types/scrapbook';

export const scrapbookApi = {
  /**
   * Fetch all memories for the authenticated user (or caregiver's linked patient)
   */
  async getMemories(patientId?: string): Promise<FamilyMemory[]> {
    const params = patientId ? { patientId } : undefined;
    const response = await apiClient.get<ScrapbookResponse>('/api/memories', { params });
    return response.data.memories || [];
  },

  /**
   * Fetch a single memory by ID
   */
  async getMemory(id: string): Promise<FamilyMemory | null> {
    const response = await apiClient.get<ScrapbookResponse>(`/api/memories/${id}`);
    return response.data.memory || null;
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
    const response = await apiClient.delete<ScrapbookResponse>(`/api/memories/${id}`);
    return response.data.success;
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
