-- Sync Supabase Auth users with custom users table
-- This migration:
-- 1. Updates the users table to sync with Supabase auth.users
-- 2. Makes password optional (since we're using OAuth)
-- 3. Creates a trigger to auto-create user records when someone signs up via Supabase Auth

-- Update users table to link with auth.users
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS users_id_fkey,
  ALTER COLUMN password DROP NOT NULL,
  ALTER COLUMN password SET DEFAULT NULL;

-- Make id reference auth.users.id
ALTER TABLE users 
  ALTER COLUMN id TYPE UUID;

-- Function to create user record in users table when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  user_avatar TEXT;
  user_role TEXT := 'parent'; -- Default role
BEGIN
  -- Extract user info from auth.users
  user_email := NEW.email;
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(user_email, '@', 1)
  );
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );
  
  -- Extract role if provided in metadata
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    user_role := NEW.raw_user_meta_data->>'role';
  END IF;

  -- Insert into users table
  INSERT INTO public.users (id, name, email, avatar, role)
  VALUES (
    NEW.id,
    user_name,
    user_email,
    COALESCE(user_avatar, ''),
    user_role
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    avatar = EXCLUDED.avatar,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run function when new auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update existing RLS policies to work with Supabase Auth
-- The existing policies already use auth.uid() which works with Supabase Auth

-- Also create a function to update user record when auth user is updated
CREATE OR REPLACE FUNCTION public.handle_user_update() 
RETURNS TRIGGER AS $$
BEGIN
  -- Update users table when auth.users is updated
  UPDATE public.users
  SET 
    name = COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      name
    ),
    email = NEW.email,
    avatar = COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      avatar
    ),
    updated_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email OR 
        OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION public.handle_user_update();

