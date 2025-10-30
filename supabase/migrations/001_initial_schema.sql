-- WholeChild Platform - Supabase Database Schema
-- This migration creates all necessary tables for the platform

-- Enable UUID extension (Supabase has this enabled by default, but we ensure it exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'educator', 'therapist')),
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Children table
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  avatar TEXT DEFAULT '',
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  sensory_needs TEXT[] DEFAULT ARRAY[]::TEXT[],
  speech_goals TEXT[] DEFAULT ARRAY[]::TEXT[],
  ot_goals TEXT[] DEFAULT ARRAY[]::TEXT[],
  developmental_profile JSONB DEFAULT '{"cognitive": 0, "language": 0, "social": 0, "physical": 0, "creative": 0}'::jsonb,
  current_level JSONB DEFAULT '{"math": 0, "reading": 0, "writing": 0, "science": 0}'::jsonb,
  preferences JSONB DEFAULT '{"learningStyle": "visual", "energyLevel": "medium", "socialPreference": "small-group"}'::jsonb,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_children_age ON children(age);

-- Activity History table (separate table for better querying)
CREATE TABLE IF NOT EXISTS activity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration INTEGER NOT NULL,
  notes TEXT DEFAULT '',
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  observations TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_history_child_id ON activity_history(child_id);
CREATE INDEX idx_activity_history_activity_id ON activity_history(activity_id);
CREATE INDEX idx_activity_history_completed_at ON activity_history(completed_at);

-- Achievements table (separate table for better querying)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  category TEXT NOT NULL CHECK (category IN ('milestone', 'streak', 'skill', 'creativity')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_achievements_child_id ON achievements(child_id);
CREATE INDEX idx_achievements_category ON achievements(category);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  methodologies TEXT[] DEFAULT ARRAY[]::TEXT[],
  age_range INTEGER[] NOT NULL CHECK (array_length(age_range, 1) = 2 AND age_range[1] < age_range[2]),
  duration INTEGER NOT NULL,
  materials TEXT[] DEFAULT ARRAY[]::TEXT[],
  instructions TEXT[] DEFAULT ARRAY[]::TEXT[],
  learning_objectives TEXT[] DEFAULT ARRAY[]::TEXT[],
  developmental_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  speech_targets TEXT[] DEFAULT ARRAY[]::TEXT[],
  ot_targets TEXT[] DEFAULT ARRAY[]::TEXT[],
  difficulty INTEGER DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  media JSONB DEFAULT '{"images": [], "videos": [], "audio": []}'::jsonb,
  adaptations JSONB DEFAULT '{"sensory": [], "motor": [], "cognitive": []}'::jsonb,
  assessment JSONB DEFAULT '{"observationPoints": [], "milestones": []}'::jsonb,
  created_by TEXT NOT NULL,
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews INTEGER DEFAULT 0,
  price NUMERIC(10,2) DEFAULT 0,
  parent_guidance JSONB DEFAULT '{"setupTips": [], "encouragementPhrases": [], "extensionIdeas": [], "troubleshooting": []}'::jsonb,
  is_ai_generated BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activities_difficulty ON activities(difficulty);
CREATE INDEX idx_activities_is_favorite ON activities(is_favorite);
CREATE INDEX idx_activities_created_at ON activities(created_at);
-- GIN index for array searches
CREATE INDEX idx_activities_methodologies ON activities USING GIN(methodologies);
CREATE INDEX idx_activities_tags ON activities USING GIN(tags);

-- Learning Stories table
CREATE TABLE IF NOT EXISTS learning_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  media JSONB DEFAULT '{"photos": [], "videos": [], "audio": []}'::jsonb,
  observations TEXT[] DEFAULT ARRAY[]::TEXT[],
  milestones TEXT[] DEFAULT ARRAY[]::TEXT[],
  next_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
  developmental_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  methodology_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  shared_with TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_private BOOLEAN DEFAULT false,
  reactions JSONB DEFAULT '{"hearts": 0, "celebrations": 0, "insights": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_stories_user_id ON learning_stories(user_id);
CREATE INDEX idx_learning_stories_child_id ON learning_stories(child_id);
CREATE INDEX idx_learning_stories_activity_id ON learning_stories(activity_id);
CREATE INDEX idx_learning_stories_date ON learning_stories(date);

-- Therapy Sessions table
CREATE TABLE IF NOT EXISTS therapy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('speech', 'ot')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  duration INTEGER NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
  goals TEXT[] DEFAULT ARRAY[]::TEXT[],
  activities TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT DEFAULT '',
  recordings TEXT[] DEFAULT ARRAY[]::TEXT[],
  assessment_data JSONB DEFAULT NULL,
  therapist_id TEXT NOT NULL,
  progress JSONB DEFAULT '{"goalsAchieved": 0, "totalGoals": 0, "notes": ""}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_therapy_sessions_user_id ON therapy_sessions(user_id);
CREATE INDEX idx_therapy_sessions_child_id ON therapy_sessions(child_id);
CREATE INDEX idx_therapy_sessions_type ON therapy_sessions(type);
CREATE INDEX idx_therapy_sessions_status ON therapy_sessions(status);
CREATE INDEX idx_therapy_sessions_date ON therapy_sessions(date);

-- OT Goals table
CREATE TABLE IF NOT EXISTS ot_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_date TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fine-motor', 'gross-motor', 'sensory', 'cognitive', 'daily-living')),
  current_level INTEGER DEFAULT 0,
  target_level INTEGER NOT NULL,
  activities TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ot_goals_user_id ON ot_goals(user_id);
CREATE INDEX idx_ot_goals_child_id ON ot_goals(child_id);
CREATE INDEX idx_ot_goals_category ON ot_goals(category);
CREATE INDEX idx_ot_goals_target_date ON ot_goals(target_date);

-- OT Goals Progress table
CREATE TABLE IF NOT EXISTS ot_goals_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES ot_goals(id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT NOW(),
  level INTEGER NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ot_goals_progress_goal_id ON ot_goals_progress(goal_id);
CREATE INDEX idx_ot_goals_progress_date ON ot_goals_progress(date);

-- Speech Goals table
CREATE TABLE IF NOT EXISTS speech_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_date TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('articulation', 'language', 'fluency', 'voice', 'social')),
  current_level INTEGER DEFAULT 0,
  target_level INTEGER NOT NULL,
  activities TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_speech_goals_user_id ON speech_goals(user_id);
CREATE INDEX idx_speech_goals_child_id ON speech_goals(child_id);
CREATE INDEX idx_speech_goals_category ON speech_goals(category);
CREATE INDEX idx_speech_goals_target_date ON speech_goals(target_date);

-- Speech Goals Progress table
CREATE TABLE IF NOT EXISTS speech_goals_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES speech_goals(id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT NOW(),
  level INTEGER NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_speech_goals_progress_goal_id ON speech_goals_progress(goal_id);
CREATE INDEX idx_speech_goals_progress_date ON speech_goals_progress(date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_stories_updated_at BEFORE UPDATE ON learning_stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapy_sessions_updated_at BEFORE UPDATE ON therapy_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ot_goals_updated_at BEFORE UPDATE ON ot_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_speech_goals_updated_at BEFORE UPDATE ON speech_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE speech_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_goals_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE speech_goals_progress ENABLE ROW LEVEL SECURITY;

-- Users: Users can read/update their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Children: Users can only access their own children
CREATE POLICY "Users can view own children" ON children
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert own children" ON children
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own children" ON children
    FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own children" ON children
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- Activities: Users can only access their own activities
CREATE POLICY "Users can view own activities" ON activities
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert own activities" ON activities
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own activities" ON activities
    FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own activities" ON activities
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- Learning Stories: Users can only access their own stories
CREATE POLICY "Users can view own learning stories" ON learning_stories
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert own learning stories" ON learning_stories
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own learning stories" ON learning_stories
    FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own learning stories" ON learning_stories
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- Therapy Sessions: Users can only access their own sessions
CREATE POLICY "Users can view own therapy sessions" ON therapy_sessions
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert own therapy sessions" ON therapy_sessions
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own therapy sessions" ON therapy_sessions
    FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own therapy sessions" ON therapy_sessions
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- OT Goals: Users can only access their own goals
CREATE POLICY "Users can view own OT goals" ON ot_goals
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert own OT goals" ON ot_goals
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own OT goals" ON ot_goals
    FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own OT goals" ON ot_goals
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- Speech Goals: Users can only access their own goals
CREATE POLICY "Users can view own speech goals" ON speech_goals
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert own speech goals" ON speech_goals
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own speech goals" ON speech_goals
    FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own speech goals" ON speech_goals
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- Activity History: Users can only access their children's history
CREATE POLICY "Users can view own children's activity history" ON activity_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM children 
            WHERE children.id = activity_history.child_id 
            AND children.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own children's activity history" ON activity_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM children 
            WHERE children.id = activity_history.child_id 
            AND children.user_id::text = auth.uid()::text
        )
    );

-- Achievements: Users can only access their children's achievements
CREATE POLICY "Users can view own children's achievements" ON achievements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM children 
            WHERE children.id = achievements.child_id 
            AND children.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own children's achievements" ON achievements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM children 
            WHERE children.id = achievements.child_id 
            AND children.user_id::text = auth.uid()::text
        )
    );

-- Progress tables follow same pattern
CREATE POLICY "Users can view own OT goals progress" ON ot_goals_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ot_goals 
            WHERE ot_goals.id = ot_goals_progress.goal_id 
            AND ot_goals.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own OT goals progress" ON ot_goals_progress
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ot_goals 
            WHERE ot_goals.id = ot_goals_progress.goal_id 
            AND ot_goals.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can view own speech goals progress" ON speech_goals_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM speech_goals 
            WHERE speech_goals.id = speech_goals_progress.goal_id 
            AND speech_goals.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own speech goals progress" ON speech_goals_progress
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM speech_goals 
            WHERE speech_goals.id = speech_goals_progress.goal_id 
            AND speech_goals.user_id::text = auth.uid()::text
        )
    );

