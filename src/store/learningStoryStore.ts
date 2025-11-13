import { create } from 'zustand';
import { learningStoriesService, CreateStoryData } from '../services/learningStoriesService';
import toast from 'react-hot-toast';

export interface LearningStory {
  id: string;
  childId: string;
  title: string;
  description: string;
  date: Date | string;
  activityId?: string;
  media: {
    photos: string[];
    videos: string[];
    audio: string[];
  };
  observations: string[];
  milestones: string[];
  nextSteps: string[];
  developmentalAreas: string[];
  methodologyTags: string[];
  sharedWith: string[];
  isPrivate: boolean;
  reactions: {
    hearts: number;
    celebrations: number;
    insights: number;
  };
}

interface LearningStoryState {
  stories: LearningStory[];
  isLoading: boolean;
  error: string | null;
  fetchStories: (childId: string) => Promise<void>;
  fetchAllStories: (childIds: string[]) => Promise<void>;
  addStory: (story: CreateStoryData, files?: {
    photos?: File[];
    videos?: File[];
    audio?: File[];
  }) => Promise<void>;
  updateStory: (id: string, updates: Partial<LearningStory>, files?: {
    photos?: File[];
    videos?: File[];
    audio?: File[];
  }) => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
  getStoriesForChild: (childId: string) => LearningStory[];
  addReaction: (storyId: string, type: 'hearts' | 'celebrations' | 'insights') => Promise<void>;
}

// Helper to transform date strings to Date objects
const transformStory = (story: any): LearningStory => {
  return {
    ...story,
    date: story.date ? (typeof story.date === 'string' ? new Date(story.date) : story.date) : new Date(),
  };
};

export const useLearningStoryStore = create<LearningStoryState>((set, get) => ({
  stories: [],
  isLoading: false,
  error: null,
  
  fetchStories: async (childId: string) => {
    set({ isLoading: true, error: null });
    try {
      const stories = await learningStoriesService.getByChildId(childId);
      const transformedStories = stories.map(transformStory);
      set((state) => {
        // Replace stories for this child, keep others
        const otherStories = state.stories.filter(s => s.childId !== childId);
        // Remove duplicates
        const allStories = [...otherStories, ...transformedStories];
        const uniqueStories = Array.from(
          new Map(allStories.map(story => [story.id, story])).values()
        );
        return {
          stories: uniqueStories,
          isLoading: false
        };
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch learning stories';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  fetchAllStories: async (childIds: string[]) => {
    if (childIds.length === 0) {
      set({ stories: [], isLoading: false });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const allPromises = childIds.map(id => learningStoriesService.getByChildId(id));
      const results = await Promise.all(allPromises);
      const allStories = results.flat().map(transformStory);
      // Remove duplicates based on ID
      const uniqueStories = Array.from(
        new Map(allStories.map(story => [story.id, story])).values()
      );
      set({ stories: uniqueStories, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch learning stories';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  addStory: async (story, files) => {
    set({ isLoading: true, error: null });
    try {
      const newStory = await learningStoriesService.create(story, files);
      const transformedStory = transformStory(newStory);
      set((state) => ({
        stories: [transformedStory, ...state.stories],
        isLoading: false
      }));
      toast.success('Learning story created successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create learning story';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  updateStory: async (id, updates, files) => {
    set({ isLoading: true, error: null });
    try {
      const updatedStory = await learningStoriesService.update(id, updates, files);
      const transformedStory = transformStory(updatedStory);
      set((state) => ({
        stories: state.stories.map(story => 
          story.id === id ? transformedStory : story
        ),
        isLoading: false
      }));
      toast.success('Learning story updated successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update learning story';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  deleteStory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await learningStoriesService.delete(id);
      set((state) => ({
        stories: state.stories.filter(story => story.id !== id),
        isLoading: false
      }));
      toast.success('Learning story deleted successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete learning story';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  getStoriesForChild: (childId) => {
    return get().stories.filter(story => story.childId === childId);
  },
  
  addReaction: async (storyId, type) => {
    try {
      const updatedStory = await learningStoriesService.addReaction(storyId, type);
      const transformedStory = transformStory(updatedStory);
      set((state) => ({
        stories: state.stories.map(story => 
          story.id === storyId ? transformedStory : story
        )
      }));
      toast.success('Reaction added!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add reaction';
      throw error;
    }
  }
}));