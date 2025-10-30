import api from './api';
import type { TherapySession, SpeechGoal, OTGoal } from '../store/therapyStore';

export const therapyService = {
  // ========================================
  // Therapy Sessions
  // ========================================

  // Get all therapy sessions for a child
  getSessions: async (childId: string): Promise<TherapySession[]> => {
    const response = await api.get(`/therapy/sessions/${childId}`);
    return response.data;
  },

  // Create therapy session
  createSession: async (sessionData: Omit<TherapySession, 'id'>): Promise<TherapySession> => {
    const response = await api.post('/therapy/sessions', sessionData);
    return response.data;
  },

  // Update therapy session
  updateSession: async (id: string, updates: Partial<TherapySession>): Promise<TherapySession> => {
    const response = await api.put(`/therapy/sessions/${id}`, updates);
    return response.data;
  },

  // Delete therapy session
  deleteSession: async (id: string): Promise<void> => {
    await api.delete(`/therapy/sessions/${id}`);
  },

  // ========================================
  // Therapy Goals
  // ========================================

  // Get all goals for a child
  getGoals: async (childId: string): Promise<{ speech: SpeechGoal[]; ot: OTGoal[] }> => {
    const response = await api.get(`/therapy/goals/${childId}`);
    return response.data;
  },

  // Create speech goal
  createSpeechGoal: async (goalData: Omit<SpeechGoal, 'id'>): Promise<SpeechGoal> => {
    const response = await api.post('/therapy/goals/speech', goalData);
    return response.data;
  },

  // Create OT goal
  createOTGoal: async (goalData: Omit<OTGoal, 'id'>): Promise<OTGoal> => {
    const response = await api.post('/therapy/goals/ot', goalData);
    return response.data;
  },

  // Update speech goal
  updateSpeechGoal: async (id: string, updates: Partial<SpeechGoal>): Promise<SpeechGoal> => {
    const response = await api.put(`/therapy/goals/speech/${id}`, updates);
    return response.data;
  },

  // Update OT goal
  updateOTGoal: async (id: string, updates: Partial<OTGoal>): Promise<OTGoal> => {
    const response = await api.put(`/therapy/goals/ot/${id}`, updates);
    return response.data;
  },

  // Delete speech goal
  deleteSpeechGoal: async (id: string): Promise<void> => {
    await api.delete(`/therapy/goals/speech/${id}`);
  },

  // Delete OT goal
  deleteOTGoal: async (id: string): Promise<void> => {
    await api.delete(`/therapy/goals/ot/${id}`);
  },
};



