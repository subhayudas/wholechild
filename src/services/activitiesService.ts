import { supabase } from '../lib/supabase';
import type { Activity } from '../store/activityStore';

export interface ActivityFilters {
  category?: string;
  difficulty?: number;
  methodologies?: string[];
  search?: string;
  favorites?: boolean;
}

// Helper function to transform database activity to frontend format
const transformActivity = (dbActivity: any): Activity => {
  return {
    id: dbActivity.id,
    title: dbActivity.title,
    description: dbActivity.description,
    methodologies: dbActivity.methodologies || [],
    ageRange: dbActivity.age_range || [3, 6],
    duration: dbActivity.duration || 30,
    materials: dbActivity.materials || [],
    instructions: dbActivity.instructions || [],
    learningObjectives: dbActivity.learning_objectives || [],
    developmentalAreas: dbActivity.developmental_areas || [],
    speechTargets: dbActivity.speech_targets || [],
    otTargets: dbActivity.ot_targets || [],
    difficulty: dbActivity.difficulty || 3,
    category: dbActivity.category || '',
    tags: dbActivity.tags || [],
    media: dbActivity.media || { images: [], videos: [], audio: [] },
    adaptations: dbActivity.adaptations || { sensory: [], motor: [], cognitive: [] },
    assessment: dbActivity.assessment || { observationPoints: [], milestones: [] },
    createdBy: dbActivity.created_by || '',
    rating: dbActivity.rating || 0,
    reviews: dbActivity.reviews || 0,
    price: dbActivity.price,
    parentGuidance: dbActivity.parent_guidance || {
      setupTips: [],
      encouragementPhrases: [],
      extensionIdeas: [],
      troubleshooting: []
    },
    isAIGenerated: dbActivity.is_ai_generated || false,
    isFavorite: dbActivity.is_favorite || false,
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

export const activitiesService = {
  // Get all activities with optional filters
  getAll: async (filters?: ActivityFilters): Promise<Activity[]> => {
    const userId = await getCurrentUserId();
    
    let query = supabase
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

  // Get recommended activities for a child
  getRecommended: async (childId: string): Promise<Activity[]> => {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      throw new Error(`Failed to fetch recommended activities: ${error.message}`);
    }

    return (data || []).map(transformActivity);
  },

  // Get single activity by ID
  getById: async (id: string): Promise<Activity> => {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch activity: ${error.message}`);
    }

    if (!data) {
      throw new Error('Activity not found');
    }

    return transformActivity(data);
  },

  // Create/save activity
  create: async (activityData: Omit<Activity, 'id'>): Promise<Activity> => {
    const userId = await getCurrentUserId();

    // Validate required fields
    if (!activityData.title) {
      throw new Error('Title is required');
    }
    if (!activityData.category) {
      throw new Error('Category is required');
    }

    const insertData = {
      user_id: userId,
      title: activityData.title,
      description: activityData.description || '',
      methodologies: activityData.methodologies || [],
      age_range: activityData.ageRange || [3, 6],
      duration: activityData.duration || 30,
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
      created_by: activityData.createdBy || 'User',
      rating: activityData.rating || 0,
      reviews: activityData.reviews || 0,
      price: activityData.price || 0,
      parent_guidance: activityData.parentGuidance || {
        setupTips: [],
        encouragementPhrases: [],
        extensionIdeas: [],
        troubleshooting: []
      },
      is_ai_generated: activityData.isAIGenerated || false,
      is_favorite: activityData.isFavorite || false,
    };

    const { data, error } = await supabase
      .from('activities')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create activity: ${error.message}`);
    }

    if (!data) {
      throw new Error('Activity created but no data returned');
    }

    return transformActivity(data);
  },

  // Update activity
  update: async (id: string, updates: Partial<Activity>): Promise<Activity> => {
    const userId = await getCurrentUserId();

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

    const { data, error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update activity: ${error.message}`);
    }

    if (!data) {
      throw new Error('Activity not found');
    }

    return transformActivity(data);
  },

  // Delete activity
  delete: async (id: string): Promise<void> => {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete activity: ${error.message}`);
    }
  },

  // Toggle favorite status
  toggleFavorite: async (id: string): Promise<Activity> => {
    const userId = await getCurrentUserId();

    // First get the current activity
    const { data: currentActivity, error: fetchError } = await supabase
      .from('activities')
      .select('is_favorite')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentActivity) {
      throw new Error('Activity not found');
    }

    // Toggle favorite status
    const { data, error } = await supabase
      .from('activities')
      .update({ is_favorite: !currentActivity.is_favorite })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle favorite: ${error.message}`);
    }

    if (!data) {
      throw new Error('Activity not found');
    }

    return transformActivity(data);
  },
};
