-- Add gender field to children table
ALTER TABLE children 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say'));

-- Create index for gender field
CREATE INDEX IF NOT EXISTS idx_children_gender ON children(gender);

