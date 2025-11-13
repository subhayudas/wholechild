import { create } from 'zustand';
import { therapyService } from '../services/therapyService';
import toast from 'react-hot-toast';

export interface TherapySession {
  id: string;
  childId: string;
  type: 'speech' | 'ot';
  title: string;
  description: string;
  date: Date;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  goals: string[];
  activities: string[];
  notes: string;
  recordings?: string[];
  assessmentData?: any;
  therapistId: string;
  progress: {
    goalsAchieved: number;
    totalGoals: number;
    notes: string;
  };
}

export interface SpeechGoal {
  id: string;
  childId: string;
  title: string;
  description: string;
  targetDate: Date;
  category: 'articulation' | 'language' | 'fluency' | 'voice' | 'social';
  currentLevel: number;
  targetLevel: number;
  activities: string[];
  progress: {
    date: Date;
    level: number;
    notes: string;
  }[];
}

export interface OTGoal {
  id: string;
  childId: string;
  title: string;
  description: string;
  targetDate: Date;
  category: 'fine-motor' | 'gross-motor' | 'sensory' | 'cognitive' | 'daily-living';
  currentLevel: number;
  targetLevel: number;
  activities: string[];
  progress: {
    date: Date;
    level: number;
    notes: string;
  }[];
}

export interface Assessment {
  id: string;
  childId: string;
  type: 'speech' | 'ot';
  title: string;
  date: Date;
  assessor: string;
  results: any;
  recommendations: string[];
  nextAssessmentDate?: Date;
}

interface TherapyState {
  sessions: TherapySession[];
  speechGoals: SpeechGoal[];
  otGoals: OTGoal[];
  assessments: Assessment[];
  isLoading: boolean;
  error: string | null;
  fetchSessions: (childId?: string) => Promise<void>;
  fetchSpeechGoals: (childId: string) => Promise<void>;
  fetchOTGoals: (childId: string) => Promise<void>;
  addSession: (session: Omit<TherapySession, 'id'>) => Promise<void>;
  updateSession: (id: string, updates: Partial<TherapySession>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  addSpeechGoal: (goal: Omit<SpeechGoal, 'id' | 'progress'>) => Promise<void>;
  updateSpeechGoal: (id: string, updates: Partial<SpeechGoal>) => Promise<void>;
  addOTGoal: (goal: Omit<OTGoal, 'id' | 'progress'>) => Promise<void>;
  updateOTGoal: (id: string, updates: Partial<OTGoal>) => Promise<void>;
  addAssessment: (assessment: Omit<Assessment, 'id'>) => void;
  getSessionsForChild: (childId: string) => TherapySession[];
  getProgressData: (childId: string) => Promise<{ speech: number; ot: number }>;
}

export const useTherapyStore = create<TherapyState>((set, get) => ({
  sessions: [],
  speechGoals: [],
  otGoals: [],
  assessments: [],
  isLoading: false,
  error: null,
  
  fetchSessions: async (childId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const sessions = childId 
        ? await therapyService.getSessionsByChildId(childId)
        : await therapyService.getAllSessions();
      set({ sessions, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch therapy sessions';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching therapy sessions:', error);
    }
  },
  
  fetchSpeechGoals: async (childId: string) => {
    set({ isLoading: true, error: null });
    try {
      const goals = await therapyService.getSpeechGoalsByChildId(childId);
      set({ speechGoals: goals, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch speech goals';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching speech goals:', error);
    }
  },
  
  fetchOTGoals: async (childId: string) => {
    set({ isLoading: true, error: null });
    try {
      const goals = await therapyService.getOTGoalsByChildId(childId);
      set({ otGoals: goals, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch OT goals';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching OT goals:', error);
    }
  },
  
  addSession: async (session) => {
    set({ isLoading: true, error: null });
    try {
      const newSession = await therapyService.createSession(session);
      set((state) => ({ 
        sessions: [newSession, ...state.sessions],
        isLoading: false
      }));
      toast.success('Therapy session created successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create therapy session';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },
  
  updateSession: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedSession = await therapyService.updateSession(id, updates);
      set((state) => ({
        sessions: state.sessions.map(session => 
          session.id === id ? updatedSession : session
        ),
        isLoading: false
      }));
      toast.success('Therapy session updated successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update therapy session';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },
  
  deleteSession: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await therapyService.deleteSession(id);
      set((state) => ({
        sessions: state.sessions.filter(session => session.id !== id),
        isLoading: false
      }));
      toast.success('Therapy session deleted successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete therapy session';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },
  
  addSpeechGoal: async (goal) => {
    set({ isLoading: true, error: null });
    try {
      const newGoal = await therapyService.createSpeechGoal(goal);
      set((state) => ({ 
        speechGoals: [...state.speechGoals, newGoal],
        isLoading: false
      }));
      toast.success('Speech goal created successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create speech goal';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },
  
  updateSpeechGoal: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedGoal = await therapyService.updateSpeechGoal(id, updates);
      set((state) => ({
        speechGoals: state.speechGoals.map(goal => 
          goal.id === id ? updatedGoal : goal
        ),
        isLoading: false
      }));
      toast.success('Speech goal updated successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update speech goal';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },
  
  addOTGoal: async (goal) => {
    set({ isLoading: true, error: null });
    try {
      const newGoal = await therapyService.createOTGoal(goal);
      set((state) => ({ 
        otGoals: [...state.otGoals, newGoal],
        isLoading: false
      }));
      toast.success('OT goal created successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create OT goal';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },
  
  updateOTGoal: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedGoal = await therapyService.updateOTGoal(id, updates);
      set((state) => ({
        otGoals: state.otGoals.map(goal => 
          goal.id === id ? updatedGoal : goal
        ),
        isLoading: false
      }));
      toast.success('OT goal updated successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update OT goal';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },
  
  addAssessment: (assessment) => {
    const newAssessment = { ...assessment, id: Date.now().toString() };
    set((state) => ({ assessments: [...state.assessments, newAssessment] }));
  },
  
  getSessionsForChild: (childId) => {
    return get().sessions.filter(session => session.childId === childId);
  },
  
  getProgressData: async (childId) => {
    try {
      return await therapyService.getProgressData(childId);
    } catch (error: any) {
      console.error('Error getting progress data:', error);
      return { speech: 0, ot: 0 };
    }
  }
}));