import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  addChild: (child: Omit<Child, 'id' | 'activityHistory' | 'achievements' | 'totalPoints' | 'currentStreak'>) => void;
  updateChild: (id: string, updates: Partial<Child>) => void;
  setActiveChild: (child: Child) => void;
  getChildById: (id: string) => Child | undefined;
  completeActivity: (childId: string, activityData: {
    activityId: string;
    duration: number;
    notes: string;
    photos: string[];
    observations: string[];
  }) => void;
  addAchievement: (childId: string, achievement: Omit<Child['achievements'][0], 'unlockedAt'>) => void;
  updatePoints: (childId: string, points: number) => void;
  updateStreak: (childId: string) => void;
}

export const useChildStore = create<ChildState>()(
  persist(
    (set, get) => ({
      children: [
        {
          id: '1',
          name: 'Emma',
          age: 4,
          avatar: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=150',
          interests: ['art', 'music', 'nature', 'building'],
          sensoryNeeds: ['movement breaks', 'quiet spaces', 'tactile input'],
          speechGoals: ['articulation /r/ sounds', 'vocabulary expansion', 'story retelling'],
          otGoals: ['fine motor skills', 'bilateral coordination', 'sensory regulation'],
          developmentalProfile: {
            cognitive: 85,
            language: 78,
            social: 92,
            physical: 88,
            creative: 95
          },
          currentLevel: {
            math: 3,
            reading: 2,
            writing: 2,
            science: 4
          },
          preferences: {
            learningStyle: 'visual',
            energyLevel: 'high',
            socialPreference: 'small-group'
          },
          activityHistory: [
            {
              activityId: '1',
              completedAt: new Date('2025-01-15'),
              duration: 25,
              notes: 'Emma showed great focus and really enjoyed the color sorting. She started making patterns on her own!',
              photos: ['https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg'],
              observations: [
                'Used pincer grasp consistently',
                'Self-corrected when colors were mixed',
                'Showed sustained attention for full activity'
              ]
            }
          ],
          achievements: [
            {
              id: 'first-activity',
              title: 'First Steps',
              description: 'Completed your first guided activity!',
              unlockedAt: new Date('2025-01-15'),
              category: 'milestone'
            }
          ],
          totalPoints: 150,
          currentStreak: 3
        }
      ],
      activeChild: null,
      
      addChild: (child) => {
        const newChild: Child = { 
          ...child, 
          id: Date.now().toString(),
          activityHistory: [],
          achievements: [],
          totalPoints: 0,
          currentStreak: 0
        };
        set((state) => ({ 
          children: [...state.children, newChild],
          activeChild: state.activeChild || newChild
        }));
      },
      
      updateChild: (id, updates) => {
        set((state) => ({
          children: state.children.map(child => 
            child.id === id ? { ...child, ...updates } : child
          ),
          activeChild: state.activeChild?.id === id 
            ? { ...state.activeChild, ...updates }
            : state.activeChild
        }));
      },
      
      setActiveChild: (child) => {
        set({ activeChild: child });
      },
      
      getChildById: (id) => {
        return get().children.find(child => child.id === id);
      },

      completeActivity: (childId, activityData) => {
        set((state) => ({
          children: state.children.map(child => 
            child.id === childId 
              ? { 
                  ...child, 
                  activityHistory: [...child.activityHistory, {
                    ...activityData,
                    completedAt: new Date()
                  }],
                  totalPoints: child.totalPoints + 25, // Base points for completion
                  currentStreak: child.currentStreak + 1
                }
              : child
          ),
          activeChild: state.activeChild?.id === childId
            ? {
                ...state.activeChild,
                activityHistory: [...state.activeChild.activityHistory, {
                  ...activityData,
                  completedAt: new Date()
                }],
                totalPoints: state.activeChild.totalPoints + 25,
                currentStreak: state.activeChild.currentStreak + 1
              }
            : state.activeChild
        }));
      },

      addAchievement: (childId, achievement) => {
        const newAchievement = { ...achievement, unlockedAt: new Date() };
        set((state) => ({
          children: state.children.map(child => 
            child.id === childId 
              ? { ...child, achievements: [...child.achievements, newAchievement] }
              : child
          ),
          activeChild: state.activeChild?.id === childId
            ? { ...state.activeChild, achievements: [...state.activeChild.achievements, newAchievement] }
            : state.activeChild
        }));
      },

      updatePoints: (childId, points) => {
        set((state) => ({
          children: state.children.map(child => 
            child.id === childId 
              ? { ...child, totalPoints: child.totalPoints + points }
              : child
          ),
          activeChild: state.activeChild?.id === childId
            ? { ...state.activeChild, totalPoints: state.activeChild.totalPoints + points }
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
            ? { ...state.activeChild, currentStreak: state.activeChild.currentStreak + 1 }
            : state.activeChild
        }));
      }
    }),
    {
      name: 'wholechild-children',
      storage: createJSONStorage(() => localStorage),
    }
  )
);