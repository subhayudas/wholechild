import api from './api';
import type { Activity } from '../store/activityStore';

export interface ActivityFilters {
  category?: string;
  difficulty?: number;
  methodologies?: string[];
  search?: string;
  favorites?: boolean;
}

export const activitiesService = {
  // Get all activities with optional filters
  getAll: async (filters?: ActivityFilters): Promise<Activity[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty.toString());
    if (filters?.methodologies) params.append('methodologies', filters.methodologies.join(','));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.favorites) params.append('favorites', 'true');

    const response = await api.get(`/activities?${params.toString()}`);
    return response.data;
  },

  // Get recommended activities for a child
  getRecommended: async (childId: string): Promise<Activity[]> => {
    const response = await api.get(`/activities/recommended/${childId}`);
    return response.data;
  },

  // Get single activity by ID
  getById: async (id: string): Promise<Activity> => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },

  // Create/save activity
  create: async (activityData: Omit<Activity, 'id'>): Promise<Activity> => {
    const response = await api.post('/activities', activityData);
    return response.data;
  },

  // Update activity
  update: async (id: string, updates: Partial<Activity>): Promise<Activity> => {
    const response = await api.put(`/activities/${id}`, updates);
    return response.data;
  },

  // Delete activity
  delete: async (id: string): Promise<void> => {
    await api.delete(`/activities/${id}`);
  },

  // Toggle favorite status
  toggleFavorite: async (id: string): Promise<Activity> => {
    const response = await api.post(`/activities/${id}/favorite`);
    return response.data;
  },
};









