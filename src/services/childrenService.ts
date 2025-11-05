import { supabase } from '../lib/supabase';
import type { Child } from '../store/childStore';

export interface CreateChildData {
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
}

export interface CompleteActivityData {
  activityId: string;
  duration: number;
  notes: string;
  photos: string[];
  observations: string[];
}

export interface AchievementData {
  id?: string;
  title: string;
  description: string;
  category: 'milestone' | 'streak' | 'skill' | 'creativity';
}

// Helper function to get current user ID
const getUserId = async (): Promise<string> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) {
    throw new Error('Not authenticated');
  }
  return session.user.id;
};

// Helper function to ensure user exists in users table
const ensureUserExists = async (userId: string): Promise<void> => {
  // Check if user exists in users table
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (!existingUser) {
    // User doesn't exist in users table, create them
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      throw new Error('Cannot find authenticated user');
    }

    const userMetadata = authUser.user_metadata || {};
    const name = userMetadata.full_name || userMetadata.name || authUser.email?.split('@')[0] || 'User';
    const email = authUser.email || '';
    const avatar = userMetadata.avatar_url || userMetadata.picture || '';
    const role = (userMetadata.role as 'parent' | 'educator' | 'therapist') || 'parent';

    // Insert user into users table
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        name,
        email,
        avatar: avatar || '',
        role,
        password: null // Password is optional for OAuth users
      });

    if (insertError) {
      // If insert fails due to conflict (user was created between check and insert), that's okay
      // Postgres error code 23505 is unique_violation
      if (!insertError.message.includes('duplicate') && insertError.code !== '23505') {
        throw new Error(`Failed to create user record: ${insertError.message}`);
      }
      // If it's a duplicate/conflict error, that means the user was created by the trigger
      // between our check and insert, which is fine - we can continue
    }
  }
};

// Helper function to convert database row (snake_case) to Child (camelCase)
const mapDbChildToChild = (dbChild: any, activityHistory: any[] = [], achievements: any[] = []): Child => {
  return {
    id: dbChild.id,
    name: dbChild.name,
    age: dbChild.age,
    avatar: dbChild.avatar || '',
    interests: dbChild.interests || [],
    sensoryNeeds: dbChild.sensory_needs || [],
    speechGoals: dbChild.speech_goals || [],
    otGoals: dbChild.ot_goals || [],
    developmentalProfile: dbChild.developmental_profile || {
      cognitive: 0,
      language: 0,
      social: 0,
      physical: 0,
      creative: 0
    },
    currentLevel: dbChild.current_level || {
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
    activityHistory: activityHistory.map((ah: any) => ({
      activityId: ah.activity_id,
      completedAt: new Date(ah.completed_at),
      duration: ah.duration,
      notes: ah.notes || '',
      photos: ah.photos || [],
      observations: ah.observations || []
    })),
    achievements: achievements.map((ach: any) => ({
      id: ach.achievement_id || ach.id,
      title: ach.title,
      description: ach.description,
      unlockedAt: new Date(ach.unlocked_at),
      category: ach.category
    })),
    totalPoints: dbChild.total_points || 0,
    currentStreak: dbChild.current_streak || 0
  };
};

// Helper function to convert Child data (camelCase) to database format (snake_case)
const mapChildToDb = (childData: any): any => {
  return {
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
      creative: 0
    },
    current_level: childData.currentLevel || {
      math: 0,
      reading: 0,
      writing: 0,
      science: 0
    },
    preferences: childData.preferences || {
      learningStyle: 'visual',
      energyLevel: 'medium',
      socialPreference: 'small-group'
    },
    total_points: childData.totalPoints || 0,
    current_streak: childData.currentStreak || 0
  };
};

export const childrenService = {
  // Get all children for the authenticated user
  getAll: async (): Promise<Child[]> => {
    const userId = await getUserId();
    await ensureUserExists(userId);
    
    // Fetch children
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (childrenError) {
      throw new Error(`Failed to fetch children: ${childrenError.message}`);
    }

    if (!children || children.length === 0) {
      return [];
    }

    // Fetch activity history for all children
    const childIds = children.map(c => c.id);
    const { data: activityHistory } = await supabase
      .from('activity_history')
      .select('*')
      .in('child_id', childIds)
      .order('completed_at', { ascending: false });

    // Fetch achievements for all children
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .in('child_id', childIds)
      .order('unlocked_at', { ascending: false });

    // Map all children with their related data
    return children.map(child => {
      const childActivityHistory = (activityHistory || []).filter(ah => ah.child_id === child.id);
      const childAchievements = (achievements || []).filter(ach => ach.child_id === child.id);
      return mapDbChildToChild(child, childActivityHistory, childAchievements);
    });
  },

  // Get single child by ID
  getById: async (id: string): Promise<Child> => {
    const userId = await getUserId();
    await ensureUserExists(userId);
    
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (childError || !child) {
      throw new Error(childError?.message || 'Child not found');
    }

    // Fetch activity history
    const { data: activityHistory } = await supabase
      .from('activity_history')
      .select('*')
      .eq('child_id', id)
      .order('completed_at', { ascending: false });

    // Fetch achievements
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('child_id', id)
      .order('unlocked_at', { ascending: false });

    return mapDbChildToChild(child, activityHistory || [], achievements || []);
  },

  // Create new child profile
  create: async (childData: CreateChildData): Promise<Child> => {
    const userId = await getUserId();
    await ensureUserExists(userId);
    
    const dbData = {
      ...mapChildToDb(childData),
      user_id: userId
    };

    const { data: child, error: createError } = await supabase
      .from('children')
      .insert(dbData)
      .select()
      .single();

    if (createError || !child) {
      throw new Error(createError?.message || 'Failed to create child profile');
    }

    // Return the child with empty arrays for related data
    return mapDbChildToChild(child, [], []);
  },

  // Update child profile
  update: async (id: string, updates: Partial<Child>): Promise<Child> => {
    const userId = await getUserId();
    await ensureUserExists(userId);
    
    // Convert updates to database format
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.age !== undefined) dbUpdates.age = updates.age;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.interests !== undefined) dbUpdates.interests = updates.interests;
    if (updates.sensoryNeeds !== undefined) dbUpdates.sensory_needs = updates.sensoryNeeds;
    if (updates.speechGoals !== undefined) dbUpdates.speech_goals = updates.speechGoals;
    if (updates.otGoals !== undefined) dbUpdates.ot_goals = updates.otGoals;
    if (updates.developmentalProfile !== undefined) dbUpdates.developmental_profile = updates.developmentalProfile;
    if (updates.currentLevel !== undefined) dbUpdates.current_level = updates.currentLevel;
    if (updates.preferences !== undefined) dbUpdates.preferences = updates.preferences;
    if (updates.totalPoints !== undefined) dbUpdates.total_points = updates.totalPoints;
    if (updates.currentStreak !== undefined) dbUpdates.current_streak = updates.currentStreak;

    const { data: child, error: updateError } = await supabase
      .from('children')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError || !child) {
      throw new Error(updateError?.message || 'Failed to update child profile');
    }

    // Fetch related data
    const { data: activityHistory } = await supabase
      .from('activity_history')
      .select('*')
      .eq('child_id', id)
      .order('completed_at', { ascending: false });

    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('child_id', id)
      .order('unlocked_at', { ascending: false });

    return mapDbChildToChild(child, activityHistory || [], achievements || []);
  },

  // Delete child profile
  delete: async (id: string): Promise<void> => {
    const userId = await getUserId();
    await ensureUserExists(userId);
    
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message || 'Failed to delete child profile');
    }
  },

  // Record activity completion
  completeActivity: async (childId: string, activityData: CompleteActivityData): Promise<Child> => {
    const userId = await getUserId();
    await ensureUserExists(userId);
    
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

    // Insert activity history
    const { error: historyError } = await supabase
      .from('activity_history')
      .insert({
        child_id: childId,
        activity_id: activityData.activityId,
        duration: activityData.duration,
        notes: activityData.notes || '',
        photos: activityData.photos || [],
        observations: activityData.observations || []
      });

    if (historyError) {
      throw new Error(historyError.message || 'Failed to record activity');
    }

    // Return updated child
    return childrenService.getById(childId);
  },

  // Add achievement to child
  addAchievement: async (childId: string, achievement: AchievementData): Promise<Child> => {
    const userId = await getUserId();
    await ensureUserExists(userId);
    
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

    // Insert achievement
    const { error: achievementError } = await supabase
      .from('achievements')
      .insert({
        child_id: childId,
        achievement_id: achievement.id || crypto.randomUUID(),
        title: achievement.title,
        description: achievement.description,
        category: achievement.category
      });

    if (achievementError) {
      throw new Error(achievementError.message || 'Failed to add achievement');
    }

    // Return updated child
    return childrenService.getById(childId);
  },
};



