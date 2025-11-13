import { getSupabaseClient } from '../utils/supabase';
import { createChildLogger } from '../utils/logger';

export interface Activity {
  id: string;
  userId: string;
  title: string;
  description: string;
  methodologies?: string[];
  ageRange: number[];
  duration: number;
  materials?: string[];
  instructions?: string[];
  learningObjectives?: string[];
  developmentalAreas?: string[];
  speechTargets?: string[];
  otTargets?: string[];
  difficulty?: number;
  category: string;
  tags?: string[];
  media?: {
    images?: string[];
    videos?: string[];
    audio?: string[];
  };
  adaptations?: {
    sensory?: string[];
    motor?: string[];
    cognitive?: string[];
  };
  assessment?: {
    observationPoints?: string[];
    milestones?: string[];
  };
  createdBy: string;
  rating?: number;
  reviews?: number;
  price?: number;
  parentGuidance?: {
    setupTips?: string[];
    encouragementPhrases?: string[];
    extensionIdeas?: string[];
    troubleshooting?: string[];
  };
  isAIGenerated?: boolean;
  isFavorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const activityService = {
  async findAll(
    userId: string,
    filters?: {
      category?: string;
      difficulty?: number;
      methodologies?: string[];
      search?: string;
      favorites?: boolean;
    }
  ): Promise<Activity[]> {
    let query = getSupabaseClient()
      .from('activities')
      .select('*')
      .eq('user_id', userId);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters?.methodologies && filters.methodologies.length > 0) {
      query = query.contains('methodologies', filters.methodologies);
    }

    if (filters?.search) {
      // Supabase supports OR queries with filter syntax
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.favorites) {
      query = query.eq('is_favorite', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }

    return (data || []).map(transformActivity);
  },

  async findById(id: string, userId: string): Promise<Activity | null> {
    const { data, error } = await getSupabaseClient()
      .from('activities')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return transformActivity(data);
  },

  async create(activityData: Omit<Activity, 'id' | 'created_at' | 'updated_at'>): Promise<Activity> {
    // Validate required fields
    if (!activityData.userId) {
      throw new Error('User ID is required to create activity');
    }
    if (!activityData.title) {
      throw new Error('Title is required to create activity');
    }
    if (!activityData.category) {
      throw new Error('Category is required to create activity');
    }

    const insertData = {
      user_id: activityData.userId,
      title: activityData.title,
      description: activityData.description,
      methodologies: activityData.methodologies || [],
      age_range: activityData.ageRange,
      duration: activityData.duration,
      materials: activityData.materials || [],
      instructions: activityData.instructions || [],
      learning_objectives: activityData.learningObjectives || [],
      developmental_areas: activityData.developmentalAreas || [],
      speech_targets: activityData.speechTargets || [],
      ot_targets: activityData.otTargets || [],
      difficulty: activityData.difficulty || 3,
      category: activityData.category,
      tags: activityData.tags || [],
      media: activityData.media || { images: [], videos: [], audio: [] },
      adaptations: activityData.adaptations || { sensory: [], motor: [], cognitive: [] },
      assessment: activityData.assessment || { observationPoints: [], milestones: [] },
      created_by: activityData.createdBy,
      rating: activityData.rating || 0,
      reviews: activityData.reviews || 0,
      price: activityData.price || 0,
      parent_guidance: activityData.parentGuidance || {
        setupTips: [],
        encouragementPhrases: [],
        extensionIdeas: [],
        troubleshooting: [],
      },
      is_ai_generated: activityData.isAIGenerated || false,
      is_favorite: activityData.isFavorite || false,
    };

    const { data, error } = await getSupabaseClient()
      .from('activities')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      const logger = createChildLogger({ service: 'activityService' });
      logger.error({
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: activityData.userId,
        title: activityData.title,
      }, 'Activity creation error');
      throw new Error(`Failed to create activity: ${error.message}${error.details ? ` - ${error.details}` : ''}${error.hint ? ` (${error.hint})` : ''}`);
    }

    if (!data) {
      throw new Error('Activity created but no data returned');
    }

    return transformActivity(data);
  },

  async update(id: string, userId: string, updates: Partial<Activity>): Promise<Activity> {
    const updateData: any = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.methodologies !== undefined) updateData.methodologies = updates.methodologies;
    if (updates.ageRange !== undefined) updateData.age_range = updates.ageRange;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.materials !== undefined) updateData.materials = updates.materials;
    if (updates.instructions !== undefined) updateData.instructions = updates.instructions;
    if (updates.learningObjectives !== undefined) updateData.learning_objectives = updates.learningObjectives;
    if (updates.developmentalAreas !== undefined) updateData.developmental_areas = updates.developmentalAreas;
    if (updates.speechTargets !== undefined) updateData.speech_targets = updates.speechTargets;
    if (updates.otTargets !== undefined) updateData.ot_targets = updates.otTargets;
    if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.media !== undefined) updateData.media = updates.media;
    if (updates.adaptations !== undefined) updateData.adaptations = updates.adaptations;
    if (updates.assessment !== undefined) updateData.assessment = updates.assessment;
    if (updates.rating !== undefined) updateData.rating = updates.rating;
    if (updates.reviews !== undefined) updateData.reviews = updates.reviews;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.parentGuidance !== undefined) updateData.parent_guidance = updates.parentGuidance;
    if (updates.isAIGenerated !== undefined) updateData.is_ai_generated = updates.isAIGenerated;
    if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;

    const { data, error } = await getSupabaseClient()
      .from('activities')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update activity: ${error.message}`);
    }

    return transformActivity(data);
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('activities')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete activity: ${error.message}`);
    }
  },

  async toggleFavorite(id: string, userId: string): Promise<Activity> {
    const activity = await this.findById(id, userId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    return this.update(id, userId, { isFavorite: !activity.isFavorite });
  },

  async getRecommended(userId: string, limit: number = 6): Promise<Activity[]> {
    const { data, error } = await getSupabaseClient()
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recommended activities: ${error.message}`);
    }

    return (data || []).map(transformActivity);
  },
};

function transformActivity(data: any): Activity {
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    description: data.description,
    methodologies: data.methodologies || [],
    ageRange: data.age_range,
    duration: data.duration,
    materials: data.materials || [],
    instructions: data.instructions || [],
    learningObjectives: data.learning_objectives || [],
    developmentalAreas: data.developmental_areas || [],
    speechTargets: data.speech_targets || [],
    otTargets: data.ot_targets || [],
    difficulty: data.difficulty || 3,
    category: data.category,
    tags: data.tags || [],
    media: data.media || { images: [], videos: [], audio: [] },
    adaptations: data.adaptations || { sensory: [], motor: [], cognitive: [] },
    assessment: data.assessment || { observationPoints: [], milestones: [] },
    createdBy: data.created_by,
    rating: data.rating || 0,
    reviews: data.reviews || 0,
    price: data.price || 0,
    parentGuidance: data.parent_guidance || {
      setupTips: [],
      encouragementPhrases: [],
      extensionIdeas: [],
      troubleshooting: [],
    },
    isAIGenerated: data.is_ai_generated || false,
    isFavorite: data.is_favorite || false,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

