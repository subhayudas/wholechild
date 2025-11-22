-- Milestones table for tracking developmental milestones
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  area TEXT NOT NULL CHECK (area IN ('cognitive', 'language', 'social', 'physical', 'creative')),
  target_age INTEGER NOT NULL, -- in months
  achieved BOOLEAN DEFAULT false,
  achieved_date TIMESTAMPTZ,
  target_date TIMESTAMPTZ,
  importance TEXT NOT NULL CHECK (importance IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_milestones_child_id ON milestones(child_id);
CREATE INDEX idx_milestones_area ON milestones(area);
CREATE INDEX idx_milestones_achieved ON milestones(achieved);

-- Enable RLS
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access milestones for their own children
CREATE POLICY "Users can view own children's milestones" ON milestones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM children 
            WHERE children.id = milestones.child_id 
            AND children.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own children's milestones" ON milestones
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM children 
            WHERE children.id = milestones.child_id 
            AND children.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own children's milestones" ON milestones
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM children 
            WHERE children.id = milestones.child_id 
            AND children.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete own children's milestones" ON milestones
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM children 
            WHERE children.id = milestones.child_id 
            AND children.user_id::text = auth.uid()::text
        )
    );

-- Trigger to update updated_at
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

