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
  isAIGenerated?: boolean;
  isFavorite?: boolean;
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

// Helper function to convert database activity to Activity format
// Note: activitiesService now handles transformation, but keeping this for backward compatibility
const mapActivityFromDB = (dbActivity: any): Activity => {
  // If already transformed by activitiesService, return as is
  if (dbActivity.ageRange && !dbActivity.age_range) {
    return dbActivity;
  }
  
  return {
    id: dbActivity._id || dbActivity.id,
    title: dbActivity.title,
    description: dbActivity.description,
    methodologies: dbActivity.methodologies || [],
    ageRange: dbActivity.ageRange || dbActivity.age_range || [3, 6],
    duration: dbActivity.duration || 30,
    materials: dbActivity.materials || [],
    instructions: dbActivity.instructions || [],
    learningObjectives: dbActivity.learningObjectives || dbActivity.learning_objectives || [],
    developmentalAreas: dbActivity.developmentalAreas || dbActivity.developmental_areas || [],
    speechTargets: dbActivity.speechTargets || dbActivity.speech_targets || [],
    otTargets: dbActivity.otTargets || dbActivity.ot_targets || [],
    difficulty: dbActivity.difficulty || 3,
    category: dbActivity.category || '',
    tags: dbActivity.tags || [],
    media: dbActivity.media || { images: [], videos: [], audio: [] },
    adaptations: dbActivity.adaptations || { sensory: [], motor: [], cognitive: [] },
    assessment: dbActivity.assessment || { observationPoints: [], milestones: [] },
    createdBy: dbActivity.createdBy || dbActivity.created_by || '',
    rating: dbActivity.rating || 0,
    reviews: dbActivity.reviews || 0,
    price: dbActivity.price,
    parentGuidance: dbActivity.parentGuidance || dbActivity.parent_guidance || {
      setupTips: [],
      encouragementPhrases: [],
      extensionIdeas: [],
      troubleshooting: []
    },
    isAIGenerated: dbActivity.isAIGenerated || dbActivity.is_ai_generated || false,
    isFavorite: dbActivity.isFavorite || dbActivity.is_favorite || false
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