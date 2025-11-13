import api from './api';
import type { LearningStory } from '../store/learningStoryStore';

export interface CreateStoryData {
  childId: string;
  title: string;
  description: string;
  date?: Date;
  activityId?: string;
  media?: {
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
}

export const learningStoriesService = {
  // Get all learning stories for a child
  getByChildId: async (childId: string): Promise<LearningStory[]> => {
    const response = await api.get(`/learning-stories/${childId}`);
    return response.data;
  },

  // Get single learning story by ID
  getById: async (id: string): Promise<LearningStory> => {
    const response = await api.get(`/learning-stories/single/${id}`);
    return response.data;
  },

  // Create learning story with file uploads
  create: async (storyData: CreateStoryData, files?: {
    photos?: File[];
    videos?: File[];
    audio?: File[];
  }): Promise<LearningStory> => {
    const formData = new FormData();

    // Append all story data as JSON string
    const dataToSend = {
      ...storyData,
      date: storyData.date ? (storyData.date instanceof Date ? storyData.date.toISOString() : storyData.date) : new Date().toISOString(),
    };
    formData.append('data', JSON.stringify(dataToSend));

    // Append files if provided
    if (files?.photos) {
      files.photos.forEach(photo => formData.append('photos', photo));
    }
    if (files?.videos) {
      files.videos.forEach(video => formData.append('videos', video));
    }
    if (files?.audio) {
      files.audio.forEach(audio => formData.append('audio', audio));
    }

    // If files are provided, use FormData, otherwise use JSON
    if (files && (files.photos?.length || files.videos?.length || files.audio?.length)) {
      const response = await api.post('/learning-stories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Send as JSON if no files
      const jsonData = {
        ...storyData,
        date: storyData.date ? (storyData.date instanceof Date ? storyData.date.toISOString() : storyData.date) : new Date().toISOString(),
      };
      const response = await api.post('/learning-stories', jsonData);
      return response.data;
    }
  },

  // Update learning story
  update: async (id: string, updates: Partial<LearningStory>, files?: {
    photos?: File[];
    videos?: File[];
    audio?: File[];
  }): Promise<LearningStory> => {
    if (files && (files.photos?.length || files.videos?.length || files.audio?.length)) {
      // If files are being uploaded, use FormData
      const formData = new FormData();
      formData.append('data', JSON.stringify(updates));

      if (files.photos) {
        files.photos.forEach(photo => formData.append('photos', photo));
      }
      if (files.videos) {
        files.videos.forEach(video => formData.append('videos', video));
      }
      if (files.audio) {
        files.audio.forEach(audio => formData.append('audio', audio));
      }

      const response = await api.put(`/learning-stories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Otherwise, use JSON
      const response = await api.put(`/learning-stories/${id}`, updates);
      return response.data;
    }
  },

  // Delete learning story
  delete: async (id: string): Promise<void> => {
    await api.delete(`/learning-stories/${id}`);
  },

  // Add reaction to learning story
  addReaction: async (id: string, type: 'hearts' | 'celebrations' | 'insights'): Promise<LearningStory> => {
    const response = await api.post(`/learning-stories/${id}/reaction`, { type });
    return response.data;
  },
};

