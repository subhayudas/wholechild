import api from './api';
import type { Child } from '../store/childStore';

export interface CreateChildData {
  name: string;
  age: number;
  avatar?: string;
  interests: string[];
  sensoryNeeds: string[];
  speechGoals: string[];
  otGoals: string[];
  developmentalProfile: {
    cognitive: number;
    language: number;
    social: number;
    physical: number;
    creative: number;
  };
  currentLevel: {
    math: number;
    reading: number;
    writing: number;
    science: number;
  };
  preferences: {
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    energyLevel: 'low' | 'medium' | 'high';
    socialPreference: 'independent' | 'small-group' | 'large-group';
  };
}

export interface CompleteActivityData {
  activityId: string;
  duration: number;
  notes: string;
  photos: string[];
  observations: string[];
}

export interface AchievementData {
  id?: string;
  title: string;
  description: string;
  category: 'milestone' | 'streak' | 'skill' | 'creativity';
}

export const childrenService = {
  // Get all children for the authenticated user
  getAll: async (): Promise<Child[]> => {
    const response = await api.get('/children');
    return response.data;
  },

  // Get single child by ID
  getById: async (id: string): Promise<Child> => {
    const response = await api.get(`/children/${id}`);
    return response.data;
  },

  // Create new child profile
  create: async (childData: CreateChildData): Promise<Child> => {
    const response = await api.post('/children', childData);
    return response.data;
  },

  // Update child profile
  update: async (id: string, updates: Partial<Child>): Promise<Child> => {
    const response = await api.put(`/children/${id}`, updates);
    return response.data;
  },

  // Delete child profile
  delete: async (id: string): Promise<void> => {
    await api.delete(`/children/${id}`);
  },

  // Record activity completion
  completeActivity: async (childId: string, activityData: CompleteActivityData): Promise<Child> => {
    const response = await api.post(`/children/${childId}/complete-activity`, activityData);
    return response.data;
  },

  // Add achievement to child
  addAchievement: async (childId: string, achievement: AchievementData): Promise<Child> => {
    const response = await api.post(`/children/${childId}/achievement`, achievement);
    return response.data;
  },
};



