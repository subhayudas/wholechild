import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { activitiesService } from '../services/activitiesService';
import toast from 'react-hot-toast';

export interface Activity {
  id: string;
  title: string;
  description: string;
  methodologies: ('montessori' | 'reggio' | 'waldorf' | 'highscope' | 'bankstreet' | 'play-based' | 'inquiry-based')[];
  ageRange: [number, number];
  duration: number;
  materials: string[];
  instructions: string[];
  learningObjectives: string[];
  developmentalAreas: string[];
  speechTargets?: string[];
  otTargets?: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  category: string;
  tags: string[];
  media: {
    images: string[];
    videos: string[];
    audio: string[];
  };
  adaptations: {
    sensory: string[];
    motor: string[];
    cognitive: string[];
  };
  assessment: {
    observationPoints: string[];
    milestones: string[];
  };
  createdBy: string;
  rating: number;
  reviews: number;
  price?: number;
  parentGuidance: {
    setupTips: string[];
    encouragementPhrases: string[];
    extensionIdeas: string[];
    troubleshooting: string[];
  };
}

interface ActivityState {
  activities: Activity[];
  favoriteActivities: string[];
  completedActivities: string[];
  currentActivity: Activity | null;
  isLoading: boolean;
  error: string | null;
  fetchActivities: (filters?: any) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id'>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  markCompleted: (id: string, childId: string) => void;
  setCurrentActivity: (activity: Activity | null) => void;
  getRecommendedActivities: (childId: string) => Promise<Activity[]>;
  getActivityById: (id: string) => Activity | undefined;
  getAIGeneratedActivities: () => Activity[];
}

// Helper function to convert MongoDB document to Activity format
const mapActivityFromDB = (dbActivity: any): Activity => {
  return {
    id: dbActivity._id || dbActivity.id,
    title: dbActivity.title,
    description: dbActivity.description,
    methodologies: dbActivity.methodologies || [],
    ageRange: dbActivity.ageRange || [3, 6],
    duration: dbActivity.duration || 30,
    materials: dbActivity.materials || [],
    instructions: dbActivity.instructions || [],
    learningObjectives: dbActivity.learningObjectives || [],
    developmentalAreas: dbActivity.developmentalAreas || [],
    speechTargets: dbActivity.speechTargets || [],
    otTargets: dbActivity.otTargets || [],
    difficulty: dbActivity.difficulty || 3,
    category: dbActivity.category || '',
    tags: dbActivity.tags || [],
    media: dbActivity.media || { images: [], videos: [], audio: [] },
    adaptations: dbActivity.adaptations || { sensory: [], motor: [], cognitive: [] },
    assessment: dbActivity.assessment || { observationPoints: [], milestones: [] },
    createdBy: dbActivity.createdBy || '',
    rating: dbActivity.rating || 0,
    reviews: dbActivity.reviews || 0,
    price: dbActivity.price,
    parentGuidance: dbActivity.parentGuidance || {
      setupTips: [],
      encouragementPhrases: [],
      extensionIdeas: [],
      troubleshooting: []
    }
  };
};

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],
      isLoading: false,
      error: null,

      fetchActivities: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          const activities = await activitiesService.getAll(filters);
          const mappedActivities = activities.map(mapActivityFromDB);
          set({ activities: mappedActivities, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.msg || error.message || 'Failed to fetch activities';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },
      favoriteActivities: [],
      completedActivities: [],
      currentActivity: null,
      
      addActivity: async (activity) => {
        set({ isLoading: true, error: null });
        try {
          const newActivity = await activitiesService.create(activity);
          const mappedActivity = mapActivityFromDB(newActivity);
        set((state) => ({ 
            activities: [...state.activities, mappedActivity],
            isLoading: false
          }));
          toast.success('Activity saved successfully!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.msg || error.message || 'Failed to save activity';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      updateActivity: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedActivity = await activitiesService.update(id, updates);
          const mappedActivity = mapActivityFromDB(updatedActivity);
        set((state) => ({
          activities: state.activities.map(activity => 
              activity.id === id ? mappedActivity : activity
            ),
            isLoading: false
          }));
          toast.success('Activity updated successfully!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.msg || error.message || 'Failed to update activity';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      deleteActivity: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await activitiesService.delete(id);
        set((state) => ({
            activities: state.activities.filter(activity => activity.id !== id),
            isLoading: false
          }));
          toast.success('Activity deleted successfully!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.msg || error.message || 'Failed to delete activity';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      toggleFavorite: async (id) => {
        try {
          const updatedActivity = await activitiesService.toggleFavorite(id);
          const mappedActivity = mapActivityFromDB(updatedActivity);
        set((state) => ({
            favoriteActivities: mappedActivity.isFavorite
              ? state.favoriteActivities.includes(id)
                ? state.favoriteActivities
            : [...state.favoriteActivities, id]
              : state.favoriteActivities.filter(fav => fav !== id),
            activities: state.activities.map(activity => 
              activity.id === id ? mappedActivity : activity
            )
        }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.msg || error.message || 'Failed to toggle favorite';
          toast.error(errorMessage);
          throw error;
        }
      },
      
      markCompleted: (id, childId) => {
        set((state) => ({
          completedActivities: [...state.completedActivities, `${childId}-${id}`]
        }));
      },
      
      setCurrentActivity: (activity) => {
        set({ currentActivity: activity });
      },
      
      getRecommendedActivities: async (childId) => {
        try {
          const activities = await activitiesService.getRecommended(childId);
          return activities.map(mapActivityFromDB);
        } catch (error: any) {
          console.error('Failed to fetch recommended activities:', error);
          return [];
        }
      },

      getActivityById: (id) => {
        return get().activities.find(activity => activity.id === id);
      },

      getAIGeneratedActivities: () => {
        return get().activities.filter(activity => activity.tags.includes('ai-generated'));
      }
    }),
    {
      name: 'wholechild-activities',
      storage: createJSONStorage(() => localStorage),
    }
  )
);