-- Add INSERT policy for users table
-- This allows users to create their own record in the users table
-- This is needed as a fallback if the trigger doesn't work or if user signed up before trigger was created

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);


