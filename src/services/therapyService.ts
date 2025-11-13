import { supabase } from '../lib/supabase';
import type { TherapySession, SpeechGoal, OTGoal } from '../store/therapyStore';

// Helper function to get current user ID
const getUserId = async (): Promise<string> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      throw new Error('Authentication error: ' + error.message);
    }
    if (!session?.user) {
      throw new Error('Not authenticated - please sign in');
    }
    return session.user.id;
  } catch (error: any) {
    console.error('Error in getUserId:', error);
    throw new Error('Authentication failed: ' + (error.message || 'Unknown error'));
  }
};

// Helper to transform therapy session from DB format
const transformTherapySession = (dbSession: any): TherapySession => {
  return {
    id: dbSession.id,
    childId: dbSession.child_id,
    type: dbSession.type,
    title: dbSession.title,
    description: dbSession.description,
    date: new Date(dbSession.date),
    duration: dbSession.duration,
    status: dbSession.status,
    goals: dbSession.goals || [],
    activities: dbSession.activities || [],
    notes: dbSession.notes || '',
    recordings: dbSession.recordings || [],
    assessmentData: dbSession.assessment_data || null,
    therapistId: dbSession.therapist_id,
    progress: dbSession.progress || {
      goalsAchieved: 0,
      totalGoals: 0,
      notes: ''
    }
  };
};

// Helper to transform speech goal from DB format
const transformSpeechGoal = async (dbGoal: any): Promise<SpeechGoal> => {
  // Fetch progress entries for this goal
  const { data: progressData } = await supabase
    .from('speech_goals_progress')
    .select('*')
    .eq('goal_id', dbGoal.id)
    .order('date', { ascending: true });

  return {
    id: dbGoal.id,
    childId: dbGoal.child_id,
    title: dbGoal.title,
    description: dbGoal.description,
    targetDate: new Date(dbGoal.target_date),
    category: dbGoal.category,
    currentLevel: dbGoal.current_level || 0,
    targetLevel: dbGoal.target_level,
    activities: dbGoal.activities || [],
    progress: (progressData || []).map((p: any) => ({
      date: new Date(p.date),
      level: p.level,
      notes: p.notes || ''
    }))
  };
};

// Helper to transform OT goal from DB format
const transformOTGoal = async (dbGoal: any): Promise<OTGoal> => {
  // Fetch progress entries for this goal
  const { data: progressData } = await supabase
    .from('ot_goals_progress')
    .select('*')
    .eq('goal_id', dbGoal.id)
    .order('date', { ascending: true });

  return {
    id: dbGoal.id,
    childId: dbGoal.child_id,
    title: dbGoal.title,
    description: dbGoal.description,
    targetDate: new Date(dbGoal.target_date),
    category: dbGoal.category,
    currentLevel: dbGoal.current_level || 0,
    targetLevel: dbGoal.target_level,
    activities: dbGoal.activities || [],
    progress: (progressData || []).map((p: any) => ({
      date: new Date(p.date),
      level: p.level,
      notes: p.notes || ''
    }))
  };
};

export const therapyService = {
  // Get all therapy sessions for a child
  getSessionsByChildId: async (childId: string): Promise<TherapySession[]> => {
    const userId = await getUserId();
    
    const { data, error } = await supabase
      .from('therapy_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('child_id', childId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching therapy sessions:', error);
      throw new Error('Failed to fetch therapy sessions: ' + error.message);
    }

    return (data || []).map(transformTherapySession);
  },

  // Get all therapy sessions for user
  getAllSessions: async (): Promise<TherapySession[]> => {
    const userId = await getUserId();
    
    const { data, error } = await supabase
      .from('therapy_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching therapy sessions:', error);
      throw new Error('Failed to fetch therapy sessions: ' + error.message);
    }

    return (data || []).map(transformTherapySession);
  },

  // Create a therapy session
  createSession: async (session: Omit<TherapySession, 'id'>): Promise<TherapySession> => {
    const userId = await getUserId();
    
    const { data, error } = await supabase
      .from('therapy_sessions')
      .insert({
        user_id: userId,
        child_id: session.childId,
        type: session.type,
        title: session.title,
        description: session.description,
        date: session.date.toISOString(),
        duration: session.duration,
        status: session.status,
        goals: session.goals,
        activities: session.activities,
        notes: session.notes,
        recordings: session.recordings || [],
        assessment_data: session.assessmentData || null,
        therapist_id: session.therapistId,
        progress: session.progress
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating therapy session:', error);
      throw new Error('Failed to create therapy session: ' + error.message);
    }

    return transformTherapySession(data);
  },

  // Update a therapy session
  updateSession: async (id: string, updates: Partial<TherapySession>): Promise<TherapySession> => {
    const userId = await getUserId();
    
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date !== undefined) updateData.date = updates.date instanceof Date ? updates.date.toISOString() : updates.date;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.goals !== undefined) updateData.goals = updates.goals;
    if (updates.activities !== undefined) updateData.activities = updates.activities;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.recordings !== undefined) updateData.recordings = updates.recordings;
    if (updates.assessmentData !== undefined) updateData.assessment_data = updates.assessmentData;
    if (updates.therapistId !== undefined) updateData.therapist_id = updates.therapistId;
    if (updates.progress !== undefined) updateData.progress = updates.progress;

    const { data, error } = await supabase
      .from('therapy_sessions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating therapy session:', error);
      throw new Error('Failed to update therapy session: ' + error.message);
    }

    return transformTherapySession(data);
  },

  // Delete a therapy session
  deleteSession: async (id: string): Promise<void> => {
    const userId = await getUserId();
    
    const { error } = await supabase
      .from('therapy_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting therapy session:', error);
      throw new Error('Failed to delete therapy session: ' + error.message);
    }
  },

  // Get all speech goals for a child
  getSpeechGoalsByChildId: async (childId: string): Promise<SpeechGoal[]> => {
    const userId = await getUserId();
    
    const { data, error } = await supabase
      .from('speech_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('child_id', childId)
      .order('target_date', { ascending: true });

    if (error) {
      console.error('Error fetching speech goals:', error);
      throw new Error('Failed to fetch speech goals: ' + error.message);
    }

    return Promise.all((data || []).map(transformSpeechGoal));
  },

  // Create a speech goal
  createSpeechGoal: async (goal: Omit<SpeechGoal, 'id' | 'progress'>): Promise<SpeechGoal> => {
    const userId = await getUserId();
    
    const { data, error } = await supabase
      .from('speech_goals')
      .insert({
        user_id: userId,
        child_id: goal.childId,
        title: goal.title,
        description: goal.description,
        target_date: goal.targetDate.toISOString(),
        category: goal.category,
        current_level: goal.currentLevel || 0,
        target_level: goal.targetLevel,
        activities: goal.activities || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating speech goal:', error);
      throw new Error('Failed to create speech goal: ' + error.message);
    }

    return transformSpeechGoal(data);
  },

  // Update a speech goal
  updateSpeechGoal: async (id: string, updates: Partial<SpeechGoal>): Promise<SpeechGoal> => {
    const userId = await getUserId();
    
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.targetDate !== undefined) updateData.target_date = updates.targetDate instanceof Date ? updates.targetDate.toISOString() : updates.targetDate;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.currentLevel !== undefined) updateData.current_level = updates.currentLevel;
    if (updates.targetLevel !== undefined) updateData.target_level = updates.targetLevel;
    if (updates.activities !== undefined) updateData.activities = updates.activities;

    const { data, error } = await supabase
      .from('speech_goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating speech goal:', error);
      throw new Error('Failed to update speech goal: ' + error.message);
    }

    // Add progress entry if provided
    if (updates.progress && updates.progress.length > 0) {
      const latestProgress = updates.progress[updates.progress.length - 1];
      await supabase
        .from('speech_goals_progress')
        .insert({
          goal_id: id,
          date: latestProgress.date instanceof Date ? latestProgress.date.toISOString() : latestProgress.date,
          level: latestProgress.level,
          notes: latestProgress.notes || ''
        });
    }

    return transformSpeechGoal(data);
  },

  // Get all OT goals for a child
  getOTGoalsByChildId: async (childId: string): Promise<OTGoal[]> => {
    const userId = await getUserId();
    
    const { data, error } = await supabase
      .from('ot_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('child_id', childId)
      .order('target_date', { ascending: true });

    if (error) {
      console.error('Error fetching OT goals:', error);
      throw new Error('Failed to fetch OT goals: ' + error.message);
    }

    return Promise.all((data || []).map(transformOTGoal));
  },

  // Create an OT goal
  createOTGoal: async (goal: Omit<OTGoal, 'id' | 'progress'>): Promise<OTGoal> => {
    const userId = await getUserId();
    
    const { data, error } = await supabase
      .from('ot_goals')
      .insert({
        user_id: userId,
        child_id: goal.childId,
        title: goal.title,
        description: goal.description,
        target_date: goal.targetDate.toISOString(),
        category: goal.category,
        current_level: goal.currentLevel || 0,
        target_level: goal.targetLevel,
        activities: goal.activities || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating OT goal:', error);
      throw new Error('Failed to create OT goal: ' + error.message);
    }

    return transformOTGoal(data);
  },

  // Update an OT goal
  updateOTGoal: async (id: string, updates: Partial<OTGoal>): Promise<OTGoal> => {
    const userId = await getUserId();
    
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.targetDate !== undefined) updateData.target_date = updates.targetDate instanceof Date ? updates.targetDate.toISOString() : updates.targetDate;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.currentLevel !== undefined) updateData.current_level = updates.currentLevel;
    if (updates.targetLevel !== undefined) updateData.target_level = updates.targetLevel;
    if (updates.activities !== undefined) updateData.activities = updates.activities;

    const { data, error } = await supabase
      .from('ot_goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating OT goal:', error);
      throw new Error('Failed to update OT goal: ' + error.message);
    }

    // Add progress entry if provided
    if (updates.progress && updates.progress.length > 0) {
      const latestProgress = updates.progress[updates.progress.length - 1];
      await supabase
        .from('ot_goals_progress')
        .insert({
          goal_id: id,
          date: latestProgress.date instanceof Date ? latestProgress.date.toISOString() : latestProgress.date,
          level: latestProgress.level,
          notes: latestProgress.notes || ''
        });
    }

    return transformOTGoal(data);
  },

  // Get progress data for analytics
  getProgressData: async (childId: string): Promise<{ speech: number; ot: number }> => {
    const sessions = await therapyService.getSessionsByChildId(childId);
    const completedSessions = sessions.filter(s => s.status === 'completed');
    
    const speechSessions = completedSessions.filter(s => s.type === 'speech');
    const otSessions = completedSessions.filter(s => s.type === 'ot');
    
    const speechProgress = speechSessions.length > 0 
      ? speechSessions.reduce((sum, s) => {
          const totalGoals = s.progress.totalGoals || 1;
          const goalsAchieved = s.progress.goalsAchieved || 0;
          return sum + (goalsAchieved / totalGoals * 100);
        }, 0) / speechSessions.length
      : 0;
      
    const otProgress = otSessions.length > 0
      ? otSessions.reduce((sum, s) => {
          const totalGoals = s.progress.totalGoals || 1;
          const goalsAchieved = s.progress.goalsAchieved || 0;
          return sum + (goalsAchieved / totalGoals * 100);
        }, 0) / otSessions.length
      : 0;
    
    return {
      speech: Math.round(speechProgress),
      ot: Math.round(otProgress)
    };
  }
};
