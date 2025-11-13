import { getSupabaseClient } from '../utils/supabase';
import { createChildLogger } from '../utils/logger';

export interface LearningStory {
  id: string;
  userId: string;
  childId: string;
  title: string;
  description: string;
  date?: string;
  activityId?: string;
  media?: {
    photos?: string[];
    videos?: string[];
    audio?: string[];
  };
  observations?: string[];
  milestones?: string[];
  nextSteps?: string[];
  developmentalAreas?: string[];
  methodologyTags?: string[];
  sharedWith?: string[];
  isPrivate?: boolean;
  reactions?: {
    hearts?: number;
    celebrations?: number;
    insights?: number;
  };
  created_at?: string;
  updated_at?: string;
}

export const learningStoryService = {
  async findAll(childId: string, userId: string): Promise<LearningStory[]> {
    const { data, error } = await getSupabaseClient()
      .from('learning_stories')
      .select('*')
      .eq('child_id', childId)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch learning stories: ${error.message}`);
    }

    return (data || []).map(transformLearningStory);
  },

  async findById(id: string, userId: string): Promise<LearningStory | null> {
    const { data, error } = await getSupabaseClient()
      .from('learning_stories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return transformLearningStory(data);
  },

  async create(storyData: Omit<LearningStory, 'id' | 'created_at' | 'updated_at'>): Promise<LearningStory> {
    // Validate required fields
    if (!storyData.userId) {
      throw new Error('User ID is required to create learning story');
    }
    if (!storyData.childId) {
      throw new Error('Child ID is required to create learning story');
    }
    if (!storyData.title) {
      throw new Error('Title is required to create learning story');
    }

    const insertData = {
      user_id: storyData.userId,
      child_id: storyData.childId,
      title: storyData.title,
      description: storyData.description,
      date: storyData.date || new Date().toISOString(),
      activity_id: storyData.activityId || null,
      media: storyData.media || { photos: [], videos: [], audio: [] },
      observations: storyData.observations || [],
      milestones: storyData.milestones || [],
      next_steps: storyData.nextSteps || [],
      developmental_areas: storyData.developmentalAreas || [],
      methodology_tags: storyData.methodologyTags || [],
      shared_with: storyData.sharedWith || [],
      is_private: storyData.isPrivate || false,
      reactions: storyData.reactions || { hearts: 0, celebrations: 0, insights: 0 },
    };

    const { data, error } = await getSupabaseClient()
      .from('learning_stories')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      const logger = createChildLogger({ service: 'learningStoryService' });
      logger.error({
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: storyData.userId,
        childId: storyData.childId,
        title: storyData.title,
      }, 'Learning story creation error');
      throw new Error(`Failed to create learning story: ${error.message}${error.details ? ` - ${error.details}` : ''}${error.hint ? ` (${error.hint})` : ''}`);
    }

    if (!data) {
      throw new Error('Learning story created but no data returned');
    }

    return transformLearningStory(data);
  },

  async update(id: string, userId: string, updates: Partial<LearningStory>): Promise<LearningStory> {
    const updateData: any = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.activityId !== undefined) updateData.activity_id = updates.activityId;
    if (updates.media !== undefined) updateData.media = updates.media;
    if (updates.observations !== undefined) updateData.observations = updates.observations;
    if (updates.milestones !== undefined) updateData.milestones = updates.milestones;
    if (updates.nextSteps !== undefined) updateData.next_steps = updates.nextSteps;
    if (updates.developmentalAreas !== undefined) updateData.developmental_areas = updates.developmentalAreas;
    if (updates.methodologyTags !== undefined) updateData.methodology_tags = updates.methodologyTags;
    if (updates.sharedWith !== undefined) updateData.shared_with = updates.sharedWith;
    if (updates.isPrivate !== undefined) updateData.is_private = updates.isPrivate;
    if (updates.reactions !== undefined) updateData.reactions = updates.reactions;

    const { data, error } = await getSupabaseClient()
      .from('learning_stories')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update learning story: ${error.message}`);
    }

    return transformLearningStory(data);
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('learning_stories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete learning story: ${error.message}`);
    }
  },

  async addReaction(id: string, userId: string, type: 'hearts' | 'celebrations' | 'insights'): Promise<LearningStory> {
    const story = await this.findById(id, userId);
    if (!story) {
      throw new Error('Learning story not found');
    }

    const reactions = story.reactions || { hearts: 0, celebrations: 0, insights: 0 };
    reactions[type] = (reactions[type] || 0) + 1;

    return this.update(id, userId, { reactions });
  },
};

function transformLearningStory(data: any): LearningStory {
  return {
    id: data.id,
    userId: data.user_id,
    childId: data.child_id,
    title: data.title,
    description: data.description,
    date: data.date,
    activityId: data.activity_id,
    media: data.media || { photos: [], videos: [], audio: [] },
    observations: data.observations || [],
    milestones: data.milestones || [],
    nextSteps: data.next_steps || [],
    developmentalAreas: data.developmental_areas || [],
    methodologyTags: data.methodology_tags || [],
    sharedWith: data.shared_with || [],
    isPrivate: data.is_private || false,
    reactions: data.reactions || { hearts: 0, celebrations: 0, insights: 0 },
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}



