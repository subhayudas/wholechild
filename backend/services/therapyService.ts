import { getSupabaseClient } from '../utils/supabase';

export interface TherapySession {
  id: string;
  userId: string;
  childId: string;
  type: 'speech' | 'ot';
  title: string;
  description: string;
  date?: string;
  duration: number;
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  goals?: string[];
  activities?: string[];
  notes?: string;
  recordings?: string[];
  assessmentData?: any;
  therapistId: string;
  progress?: {
    goalsAchieved?: number;
    totalGoals?: number;
    notes?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface SpeechGoal {
  id: string;
  userId: string;
  childId: string;
  title: string;
  description: string;
  targetDate: string;
  category: 'articulation' | 'language' | 'fluency' | 'voice' | 'social';
  currentLevel?: number;
  targetLevel: number;
  activities?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface OTGoal {
  id: string;
  userId: string;
  childId: string;
  title: string;
  description: string;
  targetDate: string;
  category: 'fine-motor' | 'gross-motor' | 'sensory' | 'cognitive' | 'daily-living';
  currentLevel?: number;
  targetLevel: number;
  activities?: string[];
  created_at?: string;
  updated_at?: string;
}

export const therapyService = {
  // Therapy Sessions
  async findAllSessions(childId: string, userId: string): Promise<TherapySession[]> {
    const { data, error } = await getSupabaseClient()
      .from('therapy_sessions')
      .select('*')
      .eq('child_id', childId)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch therapy sessions: ${error.message}`);
    }

    return (data || []).map(transformTherapySession);
  },

  async createSession(sessionData: Omit<TherapySession, 'id' | 'created_at' | 'updated_at'>): Promise<TherapySession> {
    const { data, error } = await getSupabaseClient()
      .from('therapy_sessions')
      .insert({
        user_id: sessionData.userId,
        child_id: sessionData.childId,
        type: sessionData.type,
        title: sessionData.title,
        description: sessionData.description,
        date: sessionData.date || new Date().toISOString(),
        duration: sessionData.duration,
        status: sessionData.status || 'scheduled',
        goals: sessionData.goals || [],
        activities: sessionData.activities || [],
        notes: sessionData.notes || '',
        recordings: sessionData.recordings || [],
        assessment_data: sessionData.assessmentData || null,
        therapist_id: sessionData.therapistId,
        progress: sessionData.progress || { goalsAchieved: 0, totalGoals: 0, notes: '' },
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create therapy session: ${error.message}`);
    }

    return transformTherapySession(data);
  },

  async updateSession(id: string, userId: string, updates: Partial<TherapySession>): Promise<TherapySession> {
    const updateData: any = {};

    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.goals !== undefined) updateData.goals = updates.goals;
    if (updates.activities !== undefined) updateData.activities = updates.activities;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.recordings !== undefined) updateData.recordings = updates.recordings;
    if (updates.assessmentData !== undefined) updateData.assessment_data = updates.assessmentData;
    if (updates.therapistId !== undefined) updateData.therapist_id = updates.therapistId;
    if (updates.progress !== undefined) updateData.progress = updates.progress;

    const { data, error } = await getSupabaseClient()
      .from('therapy_sessions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update therapy session: ${error.message}`);
    }

    return transformTherapySession(data);
  },

  async deleteSession(id: string, userId: string): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('therapy_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete therapy session: ${error.message}`);
    }
  },

  // Speech Goals
  async findAllSpeechGoals(childId: string, userId: string): Promise<SpeechGoal[]> {
    const { data, error } = await getSupabaseClient()
      .from('speech_goals')
      .select('*')
      .eq('child_id', childId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch speech goals: ${error.message}`);
    }

    return (data || []).map(transformSpeechGoal);
  },

  async createSpeechGoal(goalData: Omit<SpeechGoal, 'id' | 'created_at' | 'updated_at'>): Promise<SpeechGoal> {
    const { data, error } = await getSupabaseClient()
      .from('speech_goals')
      .insert({
        user_id: goalData.userId,
        child_id: goalData.childId,
        title: goalData.title,
        description: goalData.description,
        target_date: goalData.targetDate,
        category: goalData.category,
        current_level: goalData.currentLevel || 0,
        target_level: goalData.targetLevel,
        activities: goalData.activities || [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create speech goal: ${error.message}`);
    }

    return transformSpeechGoal(data);
  },

  async updateSpeechGoal(id: string, userId: string, updates: Partial<SpeechGoal>): Promise<SpeechGoal> {
    const updateData: any = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.targetDate !== undefined) updateData.target_date = updates.targetDate;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.currentLevel !== undefined) updateData.current_level = updates.currentLevel;
    if (updates.targetLevel !== undefined) updateData.target_level = updates.targetLevel;
    if (updates.activities !== undefined) updateData.activities = updates.activities;

    const { data, error } = await getSupabaseClient()
      .from('speech_goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update speech goal: ${error.message}`);
    }

    return transformSpeechGoal(data);
  },

  async deleteSpeechGoal(id: string, userId: string): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('speech_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete speech goal: ${error.message}`);
    }
  },

  // OT Goals
  async findAllOTGoals(childId: string, userId: string): Promise<OTGoal[]> {
    const { data, error } = await getSupabaseClient()
      .from('ot_goals')
      .select('*')
      .eq('child_id', childId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch OT goals: ${error.message}`);
    }

    return (data || []).map(transformOTGoal);
  },

  async createOTGoal(goalData: Omit<OTGoal, 'id' | 'created_at' | 'updated_at'>): Promise<OTGoal> {
    const { data, error } = await getSupabaseClient()
      .from('ot_goals')
      .insert({
        user_id: goalData.userId,
        child_id: goalData.childId,
        title: goalData.title,
        description: goalData.description,
        target_date: goalData.targetDate,
        category: goalData.category,
        current_level: goalData.currentLevel || 0,
        target_level: goalData.targetLevel,
        activities: goalData.activities || [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create OT goal: ${error.message}`);
    }

    return transformOTGoal(data);
  },

  async updateOTGoal(id: string, userId: string, updates: Partial<OTGoal>): Promise<OTGoal> {
    const updateData: any = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.targetDate !== undefined) updateData.target_date = updates.targetDate;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.currentLevel !== undefined) updateData.current_level = updates.currentLevel;
    if (updates.targetLevel !== undefined) updateData.target_level = updates.targetLevel;
    if (updates.activities !== undefined) updateData.activities = updates.activities;

    const { data, error } = await getSupabaseClient()
      .from('ot_goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update OT goal: ${error.message}`);
    }

    return transformOTGoal(data);
  },

  async deleteOTGoal(id: string, userId: string): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('ot_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete OT goal: ${error.message}`);
    }
  },
};

function transformTherapySession(data: any): TherapySession {
  return {
    id: data.id,
    userId: data.user_id,
    childId: data.child_id,
    type: data.type,
    title: data.title,
    description: data.description,
    date: data.date,
    duration: data.duration,
    status: data.status,
    goals: data.goals || [],
    activities: data.activities || [],
    notes: data.notes,
    recordings: data.recordings || [],
    assessmentData: data.assessment_data,
    therapistId: data.therapist_id,
    progress: data.progress || { goalsAchieved: 0, totalGoals: 0, notes: '' },
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

function transformSpeechGoal(data: any): SpeechGoal {
  return {
    id: data.id,
    userId: data.user_id,
    childId: data.child_id,
    title: data.title,
    description: data.description,
    targetDate: data.target_date,
    category: data.category,
    currentLevel: data.current_level || 0,
    targetLevel: data.target_level,
    activities: data.activities || [],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

function transformOTGoal(data: any): OTGoal {
  return {
    id: data.id,
    userId: data.user_id,
    childId: data.child_id,
    title: data.title,
    description: data.description,
    targetDate: data.target_date,
    category: data.category,
    currentLevel: data.current_level || 0,
    targetLevel: data.target_level,
    activities: data.activities || [],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}



