import { supabase } from '../lib/supabase';

export interface Milestone {
  id: string;
  childId: string;
  title: string;
  description: string;
  area: 'cognitive' | 'language' | 'social' | 'physical' | 'creative';
  targetAge: number; // in months
  achieved: boolean;
  achievedDate?: Date | string;
  targetDate?: Date | string;
  importance: 'high' | 'medium' | 'low';
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateMilestoneData {
  childId: string;
  title: string;
  description: string;
  area: 'cognitive' | 'language' | 'social' | 'physical' | 'creative';
  targetAge: number;
  targetDate?: Date | string;
  importance: 'high' | 'medium' | 'low';
}

// Helper function to get current user ID
const getUserId = async (): Promise<string> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error('Authentication error: ' + error.message);
    }
    if (!session?.user) {
      throw new Error('Not authenticated - please sign in');
    }
    return session.user.id;
  } catch (error: any) {
    throw new Error('Authentication failed: ' + (error.message || 'Unknown error'));
  }
};

// Helper to convert database format to Milestone
const mapDbMilestoneToMilestone = (dbMilestone: any): Milestone => {
  return {
    id: dbMilestone.id,
    childId: dbMilestone.child_id,
    title: dbMilestone.title,
    description: dbMilestone.description,
    area: dbMilestone.area,
    targetAge: dbMilestone.target_age,
    achieved: dbMilestone.achieved || false,
    achievedDate: dbMilestone.achieved_date ? new Date(dbMilestone.achieved_date) : undefined,
    targetDate: dbMilestone.target_date ? new Date(dbMilestone.target_date) : undefined,
    importance: dbMilestone.importance,
    createdAt: dbMilestone.created_at ? new Date(dbMilestone.created_at) : undefined,
    updatedAt: dbMilestone.updated_at ? new Date(dbMilestone.updated_at) : undefined,
  };
};

export const milestonesService = {
  // Get all milestones for a child
  getByChildId: async (childId: string): Promise<Milestone[]> => {
    const userId = await getUserId();
    
    // Verify child belongs to user
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', childId)
      .eq('user_id', userId)
      .single();

    if (!child) {
      throw new Error('Child not found');
    }

    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('child_id', childId)
      .order('target_age', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch milestones: ${error.message}`);
    }

    return (milestones || []).map(mapDbMilestoneToMilestone);
  },

  // Create a new milestone
  create: async (milestoneData: CreateMilestoneData): Promise<Milestone> => {
    const userId = await getUserId();
    
    // Verify child belongs to user
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', milestoneData.childId)
      .eq('user_id', userId)
      .single();

    if (!child) {
      throw new Error('Child not found');
    }

    const dbData = {
      child_id: milestoneData.childId,
      title: milestoneData.title,
      description: milestoneData.description,
      area: milestoneData.area,
      target_age: milestoneData.targetAge,
      target_date: milestoneData.targetDate ? new Date(milestoneData.targetDate).toISOString() : null,
      importance: milestoneData.importance,
      achieved: false,
      achieved_date: null
    };

    const { data: milestone, error } = await supabase
      .from('milestones')
      .insert(dbData)
      .select()
      .single();

    if (error || !milestone) {
      throw new Error(error?.message || 'Failed to create milestone');
    }

    return mapDbMilestoneToMilestone(milestone);
  },

  // Update a milestone
  update: async (id: string, updates: Partial<Milestone>): Promise<Milestone> => {
    const userId = await getUserId();
    
    // Verify milestone belongs to user's child by checking child ownership
    const { data: milestone } = await supabase
      .from('milestones')
      .select('child_id')
      .eq('id', id)
      .single();

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    // Verify child belongs to user
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', milestone.child_id)
      .eq('user_id', userId)
      .single();

    if (!child) {
      throw new Error('Milestone not found or access denied');
    }

    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.area !== undefined) dbUpdates.area = updates.area;
    if (updates.targetAge !== undefined) dbUpdates.target_age = updates.targetAge;
    if (updates.achieved !== undefined) dbUpdates.achieved = updates.achieved;
    if (updates.achievedDate !== undefined) {
      dbUpdates.achieved_date = updates.achievedDate ? new Date(updates.achievedDate).toISOString() : null;
    }
    if (updates.targetDate !== undefined) {
      dbUpdates.target_date = updates.targetDate ? new Date(updates.targetDate).toISOString() : null;
    }
    if (updates.importance !== undefined) dbUpdates.importance = updates.importance;

    const { data: updatedMilestone, error } = await supabase
      .from('milestones')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedMilestone) {
      throw new Error(error?.message || 'Failed to update milestone');
    }

    return mapDbMilestoneToMilestone(updatedMilestone);
  },

  // Delete a milestone
  delete: async (id: string): Promise<void> => {
    const userId = await getUserId();
    
    // Verify milestone belongs to user's child
    const { data: milestone } = await supabase
      .from('milestones')
      .select('child_id')
      .eq('id', id)
      .single();

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    // Verify child belongs to user
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', milestone.child_id)
      .eq('user_id', userId)
      .single();

    if (!child) {
      throw new Error('Milestone not found or access denied');
    }

    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'Failed to delete milestone');
    }
  },

  // Mark milestone as achieved
  markAchieved: async (id: string, achievedDate?: Date): Promise<Milestone> => {
    return milestonesService.update(id, {
      achieved: true,
      achievedDate: achievedDate || new Date()
    });
  },
};

