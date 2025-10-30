import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { childrenService } from '../services/childrenService';
import toast from 'react-hot-toast';

export interface Child {
  id: string;
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
  activityHistory: {
    activityId: string;
    completedAt: Date;
    duration: number;
    notes: string;
    photos: string[];
    observations: string[];
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    unlockedAt: Date;
    category: 'milestone' | 'streak' | 'skill' | 'creativity';
  }[];
  totalPoints: number;
  currentStreak: number;
}

interface ChildState {
  children: Child[];
  activeChild: Child | null;
  isLoading: boolean;
  error: string | null;
  fetchChildren: () => Promise<void>;
  addChild: (child: Omit<Child, 'id' | 'activityHistory' | 'achievements' | 'totalPoints' | 'currentStreak'>) => Promise<void>;
  updateChild: (id: string, updates: Partial<Child>) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
  setActiveChild: (child: Child | null) => void;
  getChildById: (id: string) => Child | undefined;
  completeActivity: (childId: string, activityData: {
    activityId: string;
    duration: number;
    notes: string;
    photos: string[];
    observations: string[];
  }) => Promise<void>;
  addAchievement: (childId: string, achievement: Omit<Child['achievements'][0], 'unlockedAt'>) => Promise<void>;
  updatePoints: (childId: string, points: number) => void;
  updateStreak: (childId: string) => void;
}

// Helper function to convert MongoDB document to Child format
const mapChildFromDB = (dbChild: any): Child => {
  return {
    id: dbChild._id || dbChild.id,
    name: dbChild.name,
    age: dbChild.age,
    avatar: dbChild.avatar,
    interests: dbChild.interests || [],
    sensoryNeeds: dbChild.sensoryNeeds || [],
    speechGoals: dbChild.speechGoals || [],
    otGoals: dbChild.otGoals || [],
    developmentalProfile: dbChild.developmentalProfile || {
      cognitive: 0,
      language: 0,
      social: 0,
      physical: 0,
      creative: 0
    },
    currentLevel: dbChild.currentLevel || {
      math: 0,
      reading: 0,
      writing: 0,
      science: 0
    },
    preferences: dbChild.preferences || {
      learningStyle: 'visual',
      energyLevel: 'medium',
      socialPreference: 'small-group'
    },
    activityHistory: (dbChild.activityHistory || []).map((ah: any) => ({
      ...ah,
      completedAt: ah.completedAt ? new Date(ah.completedAt) : new Date()
    })),
    achievements: (dbChild.achievements || []).map((ach: any) => ({
      ...ach,
      unlockedAt: ach.unlockedAt ? new Date(ach.unlockedAt) : new Date()
    })),
    totalPoints: dbChild.totalPoints || 0,
    currentStreak: dbChild.currentStreak || 0
  };
};

export const useChildStore = create<ChildState>()(
  persist(
    (set, get) => ({
      children: [],
      activeChild: null,
      isLoading: false,
      error: null,
      
      fetchChildren: async () => {
        set({ isLoading: true, error: null });
        try {
          const children = await childrenService.getAll();
          const mappedChildren = children.map(mapChildFromDB);
          set({ children: mappedChildren, isLoading: false });
          
          // Set first child as active if none selected
          const currentActive = get().activeChild;
          if (!currentActive && mappedChildren.length > 0) {
            set({ activeChild: mappedChildren[0] });
          } else if (currentActive) {
            // Update active child if it exists in the list
            const updatedActive = mappedChildren.find(c => c.id === currentActive.id);
            if (updatedActive) {
              set({ activeChild: updatedActive });
            }
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.msg || error.message || 'Failed to fetch children';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },
      
      addChild: async (child) => {
        set({ isLoading: true, error: null });
        try {
          const newChild = await childrenService.create(child);
          const mappedChild = mapChildFromDB(newChild);
          set((state) => ({ 
            children: [...state.children, mappedChild],
            activeChild: state.activeChild || mappedChild,
            isLoading: false
          }));
          toast.success('Child profile created successfully!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.msg || error.message || 'Failed to create child profile';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      updateChild: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedChild = await childrenService.update(id, updates);
          const mappedChild = mapChildFromDB(updatedChild);
          set((state) => ({
            children: state.children.map(child => 
              child.id === id ? mappedChild : child
            ),
            activeChild: state.activeChild?.id === id ? mappedChild : state.activeChild,
            isLoading: false
          }));
          toast.success('Child profile updated successfully!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.msg || error.message || 'Failed to update child profile';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteChild: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await childrenService.delete(id);
          set((state) => {
            const filtered = state.children.filter(child => child.id !== id);
            const newActive = state.activeChild?.id === id 
              ? (filtered.length > 0 ? filtered[0] : null)
              : state.activeChild;
            return {
              children: filtered,
              activeChild: newActive,
              isLoading: false
            };
          });
          toast.success('Child profile deleted successfully!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.msg || error.message || 'Failed to delete child profile';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      setActiveChild: (child) => {
        set({ activeChild: child });
      },
      
      getChildById: (id) => {
        return get().children.find(child => child.id === id);
      },

      completeActivity: async (childId, activityData) => {
        try {
          const updatedChild = await childrenService.completeActivity(childId, activityData);
          const mappedChild = mapChildFromDB(updatedChild);
          set((state) => ({
            children: state.children.map(child => 
              child.id === childId ? mappedChild : child
            ),
            activeChild: state.activeChild?.id === childId ? mappedChild : state.activeChild
          }));
          toast.success('Activity completed and recorded!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.msg || error.message || 'Failed to record activity completion';
          toast.error(errorMessage);
          throw error;
        }
      },

      addAchievement: async (childId, achievement) => {
        try {
          const updatedChild = await childrenService.addAchievement(childId, achievement);
          const mappedChild = mapChildFromDB(updatedChild);
          set((state) => ({
            children: state.children.map(child => 
              child.id === childId ? mappedChild : child
            ),
            activeChild: state.activeChild?.id === childId ? mappedChild : state.activeChild
          }));
          toast.success('Achievement added!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.msg || error.message || 'Failed to add achievement';
          toast.error(errorMessage);
          throw error;
        }
      },

      updatePoints: (childId, points) => {
        set((state) => ({
          children: state.children.map(child => 
            child.id === childId 
              ? { ...child, totalPoints: child.totalPoints + points }
              : child
          ),
          activeChild: state.activeChild?.id === childId
            ? { ...state.activeChild, totalPoints: (state.activeChild.totalPoints || 0) + points }
            : state.activeChild
        }));
      },

      updateStreak: (childId) => {
        set((state) => ({
          children: state.children.map(child => 
            child.id === childId 
              ? { ...child, currentStreak: child.currentStreak + 1 }
              : child
          ),
          activeChild: state.activeChild?.id === childId
            ? { ...state.activeChild, currentStreak: (state.activeChild.currentStreak || 0) + 1 }
            : state.activeChild
        }));
      }
    }),
    {
      name: 'wholechild-children',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        activeChild: state.activeChild
      }),
    }
  )
);