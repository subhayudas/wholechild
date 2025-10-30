import { getSupabaseClient } from '../utils/supabase';

export interface ActivityHistory {
  id?: string;
  activityId: string;
  completedAt: string;
  duration: number;
  notes?: string;
  photos?: string[];
  observations?: string[];
}

export interface Achievement {
  id?: string;
  achievementId: string;
  title: string;
  description: string;
  unlockedAt: string;
  category: 'milestone' | 'streak' | 'skill' | 'creativity';
}

export interface Child {
  id: string;
  userId: string;
  name: string;
  age: number;
  avatar?: string;
  interests?: string[];
  sensoryNeeds?: string[];
  speechGoals?: string[];
  otGoals?: string[];
  developmentalProfile?: {
    cognitive: number;
    language: number;
    social: number;
    physical: number;
    creative: number;
  };
  currentLevel?: {
    math: number;
    reading: number;
    writing: number;
    science: number;
  };
  preferences?: {
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    energyLevel: 'low' | 'medium' | 'high';
    socialPreference: 'independent' | 'small-group' | 'large-group';
  };
  totalPoints?: number;
  currentStreak?: number;
  created_at?: string;
  updated_at?: string;
}

export const childService = {
  async findAll(userId: string): Promise<Child[]> {
    const { data, error } = await getSupabaseClient()
      .from('children')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch children: ${error.message}`);
    }

    return (data || []).map(transformChild);
  },

  async findById(id: string, userId: string): Promise<Child | null> {
    const { data, error } = await getSupabaseClient()
      .from('children')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return transformChild(data);
  },

  async create(childData: Omit<Child, 'id' | 'created_at' | 'updated_at'>): Promise<Child> {
    const { data, error } = await getSupabaseClient()
      .from('children')
      .insert({
        user_id: childData.userId,
        name: childData.name,
        age: childData.age,
        avatar: childData.avatar || '',
        interests: childData.interests || [],
        sensory_needs: childData.sensoryNeeds || [],
        speech_goals: childData.speechGoals || [],
        ot_goals: childData.otGoals || [],
        developmental_profile: childData.developmentalProfile || {
          cognitive: 0,
          language: 0,
          social: 0,
          physical: 0,
          creative: 0,
        },
        current_level: childData.currentLevel || {
          math: 0,
          reading: 0,
          writing: 0,
          science: 0,
        },
        preferences: childData.preferences || {
          learningStyle: 'visual',
          energyLevel: 'medium',
          socialPreference: 'small-group',
        },
        total_points: childData.totalPoints || 0,
        current_streak: childData.currentStreak || 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create child: ${error.message}`);
    }

    return transformChild(data);
  },

  async update(id: string, userId: string, updates: Partial<Child>): Promise<Child> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.age !== undefined) updateData.age = updates.age;
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
    if (updates.interests !== undefined) updateData.interests = updates.interests;
    if (updates.sensoryNeeds !== undefined) updateData.sensory_needs = updates.sensoryNeeds;
    if (updates.speechGoals !== undefined) updateData.speech_goals = updates.speechGoals;
    if (updates.otGoals !== undefined) updateData.ot_goals = updates.otGoals;
    if (updates.developmentalProfile !== undefined) updateData.developmental_profile = updates.developmentalProfile;
    if (updates.currentLevel !== undefined) updateData.current_level = updates.currentLevel;
    if (updates.preferences !== undefined) updateData.preferences = updates.preferences;
    if (updates.totalPoints !== undefined) updateData.total_points = updates.totalPoints;
    if (updates.currentStreak !== undefined) updateData.current_streak = updates.currentStreak;

    const { data, error } = await getSupabaseClient()
      .from('children')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update child: ${error.message}`);
    }

    return transformChild(data);
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('children')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete child: ${error.message}`);
    }
  },

  async addActivityHistory(
    childId: string,
    userId: string,
    activityHistory: Omit<ActivityHistory, 'id'>
  ): Promise<void> {
    // Verify child belongs to user
    const child = await this.findById(childId, userId);
    if (!child) {
      throw new Error('Child not found');
    }

    const { error } = await getSupabaseClient()
      .from('activity_history')
      .insert({
        child_id: childId,
        activity_id: activityHistory.activityId,
        completed_at: activityHistory.completedAt,
        duration: activityHistory.duration,
        notes: activityHistory.notes || '',
        photos: activityHistory.photos || [],
        observations: activityHistory.observations || [],
      });

    if (error) {
      throw new Error(`Failed to add activity history: ${error.message}`);
    }

    // Update points and streak
    await this.update(childId, userId, {
      totalPoints: (child.totalPoints || 0) + 25,
      currentStreak: (child.currentStreak || 0) + 1,
    });
  },

  async addAchievement(
    childId: string,
    userId: string,
    achievement: Omit<Achievement, 'id' | 'unlockedAt'>
  ): Promise<void> {
    // Verify child belongs to user
    const child = await this.findById(childId, userId);
    if (!child) {
      throw new Error('Child not found');
    }

    const { error } = await getSupabaseClient()
      .from('achievements')
      .insert({
        child_id: childId,
        achievement_id: achievement.achievementId || Date.now().toString(),
        title: achievement.title,
        description: achievement.description,
        category: achievement.category,
      });

    if (error) {
      throw new Error(`Failed to add achievement: ${error.message}`);
    }
  },

  async getActivityHistory(childId: string, userId: string): Promise<ActivityHistory[]> {
    const child = await this.findById(childId, userId);
    if (!child) {
      throw new Error('Child not found');
    }

    const { data, error } = await getSupabaseClient()
      .from('activity_history')
      .select('*')
      .eq('child_id', childId)
      .order('completed_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch activity history: ${error.message}`);
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      activityId: item.activity_id,
      completedAt: item.completed_at,
      duration: item.duration,
      notes: item.notes,
      photos: item.photos || [],
      observations: item.observations || [],
    }));
  },

  async getAchievements(childId: string, userId: string): Promise<Achievement[]> {
    const child = await this.findById(childId, userId);
    if (!child) {
      throw new Error('Child not found');
    }

    const { data, error } = await getSupabaseClient()
      .from('achievements')
      .select('*')
      .eq('child_id', childId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch achievements: ${error.message}`);
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      achievementId: item.achievement_id,
      title: item.title,
      description: item.description,
      unlockedAt: item.unlocked_at,
      category: item.category,
    }));
  },
};

function transformChild(data: any): Child {
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    age: data.age,
    avatar: data.avatar,
    interests: data.interests || [],
    sensoryNeeds: data.sensory_needs || [],
    speechGoals: data.speech_goals || [],
    otGoals: data.ot_goals || [],
    developmentalProfile: data.developmental_profile || {
      cognitive: 0,
      language: 0,
      social: 0,
      physical: 0,
      creative: 0,
    },
    currentLevel: data.current_level || {
      math: 0,
      reading: 0,
      writing: 0,
      science: 0,
    },
    preferences: data.preferences || {
      learningStyle: 'visual',
      energyLevel: 'medium',
      socialPreference: 'small-group',
    },
    totalPoints: data.total_points || 0,
    currentStreak: data.current_streak || 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}



