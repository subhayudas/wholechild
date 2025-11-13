import { supabase } from '../lib/supabase';
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

// Helper function to transform database story to frontend format
const transformStory = (dbStory: any): LearningStory => {
  return {
    id: dbStory.id,
    childId: dbStory.child_id,
    title: dbStory.title,
    description: dbStory.description,
    date: dbStory.date ? (typeof dbStory.date === 'string' ? new Date(dbStory.date) : dbStory.date) : new Date(),
    activityId: dbStory.activity_id,
    media: dbStory.media || { photos: [], videos: [], audio: [] },
    observations: dbStory.observations || [],
    milestones: dbStory.milestones || [],
    nextSteps: dbStory.next_steps || [],
    developmentalAreas: dbStory.developmental_areas || [],
    methodologyTags: dbStory.methodology_tags || [],
    sharedWith: dbStory.shared_with || [],
    isPrivate: dbStory.is_private || false,
    reactions: dbStory.reactions || { hearts: 0, celebrations: 0, insights: 0 },
  };
};

// Helper to get current user ID
const getCurrentUserId = async (): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  return session.user.id;
};

// Helper to upload files to Supabase Storage
const uploadFiles = async (
  files: File[],
  type: 'photos' | 'videos' | 'audio',
  storyId: string
): Promise<string[]> => {
  if (!files || files.length === 0) {
    return [];
  }

  const userId = await getCurrentUserId();
  const bucketName = 'learning-story-media';
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${storyId}/${type}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error(`Error uploading ${type} file:`, error);
      continue; // Skip failed uploads but continue with others
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (urlData?.publicUrl) {
      uploadedUrls.push(urlData.publicUrl);
    }
  }

  return uploadedUrls;
};

export const learningStoriesService = {
  // Get all learning stories for a child
  getByChildId: async (childId: string): Promise<LearningStory[]> => {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('learning_stories')
      .select('*')
      .eq('child_id', childId)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch learning stories: ${error.message}`);
    }

    return (data || []).map(transformStory);
  },

  // Get single learning story by ID
  getById: async (id: string): Promise<LearningStory> => {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('learning_stories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch learning story: ${error.message}`);
    }

    if (!data) {
      throw new Error('Learning story not found');
    }

    return transformStory(data);
  },

  // Create learning story with file uploads
  create: async (storyData: CreateStoryData, files?: {
    photos?: File[];
    videos?: File[];
    audio?: File[];
  }): Promise<LearningStory> => {
    const userId = await getCurrentUserId();

    // Validate required fields
    if (!storyData.childId) {
      throw new Error('Child ID is required');
    }
    if (!storyData.title) {
      throw new Error('Title is required');
    }

    // First create the story to get the ID for file uploads
    const insertData = {
      user_id: userId,
      child_id: storyData.childId,
      title: storyData.title,
      description: storyData.description || '',
      date: storyData.date ? (storyData.date instanceof Date ? storyData.date.toISOString() : storyData.date) : new Date().toISOString(),
      activity_id: storyData.activityId || null,
      media: storyData.media || { photos: [], videos: [], audio: [] },
      observations: storyData.observations || [],
      milestones: storyData.milestones || [],
      next_steps: storyData.nextSteps || [],
      developmental_areas: storyData.developmentalAreas || [],
      methodology_tags: storyData.methodologyTags || [],
      shared_with: storyData.sharedWith || [],
      is_private: storyData.isPrivate || false,
      reactions: { hearts: 0, celebrations: 0, insights: 0 },
    };

    const { data: createdStory, error: createError } = await supabase
      .from('learning_stories')
      .insert(insertData)
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create learning story: ${createError.message}`);
    }

    if (!createdStory) {
      throw new Error('Learning story created but no data returned');
    }

    // Upload files if provided
    let uploadedMedia = {
      photos: [...(storyData.media?.photos || [])],
      videos: [...(storyData.media?.videos || [])],
      audio: [...(storyData.media?.audio || [])],
    };

    if (files) {
      if (files.photos && files.photos.length > 0) {
        const photoUrls = await uploadFiles(files.photos, 'photos', createdStory.id);
        uploadedMedia.photos = [...uploadedMedia.photos, ...photoUrls];
      }
      if (files.videos && files.videos.length > 0) {
        const videoUrls = await uploadFiles(files.videos, 'videos', createdStory.id);
        uploadedMedia.videos = [...uploadedMedia.videos, ...videoUrls];
      }
      if (files.audio && files.audio.length > 0) {
        const audioUrls = await uploadFiles(files.audio, 'audio', createdStory.id);
        uploadedMedia.audio = [...uploadedMedia.audio, ...audioUrls];
      }

      // Update the story with uploaded media URLs
      if (files.photos?.length || files.videos?.length || files.audio?.length) {
        const { data: updatedStory, error: updateError } = await supabase
          .from('learning_stories')
          .update({ media: uploadedMedia })
          .eq('id', createdStory.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating story with media URLs:', updateError);
          // Don't throw - the story was created, just media URLs failed
        } else if (updatedStory) {
          return transformStory(updatedStory);
        }
      }
    }

    return transformStory(createdStory);
  },

  // Update learning story
  update: async (id: string, updates: Partial<LearningStory>, files?: {
    photos?: File[];
    videos?: File[];
    audio?: File[];
  }): Promise<LearningStory> => {
    const userId = await getCurrentUserId();

    // Get current story to merge media
    const { data: currentStory, error: fetchError } = await supabase
      .from('learning_stories')
      .select('media')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentStory) {
      throw new Error('Learning story not found');
    }

    const updateData: any = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date !== undefined) {
      updateData.date = updates.date instanceof Date ? updates.date.toISOString() : updates.date;
    }
    if (updates.activityId !== undefined) updateData.activity_id = updates.activityId;
    if (updates.observations !== undefined) updateData.observations = updates.observations;
    if (updates.milestones !== undefined) updateData.milestones = updates.milestones;
    if (updates.nextSteps !== undefined) updateData.next_steps = updates.nextSteps;
    if (updates.developmentalAreas !== undefined) updateData.developmental_areas = updates.developmentalAreas;
    if (updates.methodologyTags !== undefined) updateData.methodology_tags = updates.methodologyTags;
    if (updates.sharedWith !== undefined) updateData.shared_with = updates.sharedWith;
    if (updates.isPrivate !== undefined) updateData.is_private = updates.isPrivate;
    if (updates.reactions !== undefined) updateData.reactions = updates.reactions;

    // Handle file uploads
    if (files && (files.photos?.length || files.videos?.length || files.audio?.length)) {
      const currentMedia = currentStory.media || { photos: [], videos: [], audio: [] };
      const newMedia = { ...currentMedia };

      if (files.photos && files.photos.length > 0) {
        const photoUrls = await uploadFiles(files.photos, 'photos', id);
        newMedia.photos = [...(newMedia.photos || []), ...photoUrls];
      }
      if (files.videos && files.videos.length > 0) {
        const videoUrls = await uploadFiles(files.videos, 'videos', id);
        newMedia.videos = [...(newMedia.videos || []), ...videoUrls];
      }
      if (files.audio && files.audio.length > 0) {
        const audioUrls = await uploadFiles(files.audio, 'audio', id);
        newMedia.audio = [...(newMedia.audio || []), ...audioUrls];
      }

      updateData.media = newMedia;
    } else if (updates.media !== undefined) {
      updateData.media = updates.media;
    }

    const { data, error } = await supabase
      .from('learning_stories')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update learning story: ${error.message}`);
    }

    if (!data) {
      throw new Error('Learning story not found');
    }

    return transformStory(data);
  },

  // Delete learning story
  delete: async (id: string): Promise<void> => {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from('learning_stories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete learning story: ${error.message}`);
    }
  },

  // Add reaction to learning story
  addReaction: async (id: string, type: 'hearts' | 'celebrations' | 'insights'): Promise<LearningStory> => {
    const userId = await getCurrentUserId();

    // Get current story
    const { data: currentStory, error: fetchError } = await supabase
      .from('learning_stories')
      .select('reactions')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentStory) {
      throw new Error('Learning story not found');
    }

    const reactions = currentStory.reactions || { hearts: 0, celebrations: 0, insights: 0 };
    reactions[type] = (reactions[type] || 0) + 1;

    const { data, error } = await supabase
      .from('learning_stories')
      .update({ reactions })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add reaction: ${error.message}`);
    }

    if (!data) {
      throw new Error('Learning story not found');
    }

    return transformStory(data);
  },
};
