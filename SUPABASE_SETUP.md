# Supabase Database Setup Guide

This guide will help you set up the Supabase database for the WholeChild platform.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Access to your Supabase project dashboard

## Step 1: Create Supabase Project

1. Log in to your Supabase dashboard
2. Create a new project (or use existing one)
3. Note down your project URL and API keys

## Step 2: Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the migration

This will create all necessary tables:
- `users`
- `children`
- `activities`
- `learning_stories`
- `therapy_sessions`
- `speech_goals`
- `ot_goals`
- `activity_history`
- `achievements`
- `ot_goals_progress`
- `speech_goals_progress`

## Step 3: Configure Environment Variables

### Backend (.env file in `backend/` directory)

```env
SUPABASE_URL=https://ikizvjetwrwqdngnexmk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlraXp2amV0d3J3cWRuZ25leG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjQxNjIsImV4cCI6MjA3NzMwMDE2Mn0.0633i3lpU6nWCNlQ-JaPNb_XODUdjZPMTZmiOZWt_AA
SUPABASE_SERVICE_KEY=your-service-role-key-here
JWT_SECRET=your-jwt-secret-key
PORT=3001
NODE_ENV=development
```

**Note:** To get your `SUPABASE_SERVICE_KEY`:
1. Go to Project Settings → API
2. Copy the `service_role` key (keep this secret!)

### Frontend (.env file in root directory)

```env
VITE_SUPABASE_URL=https://ikizvjetwrwqdngnexmk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlraXp2amV0d3J3cWRuZ25leG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjQxNjIsImV4cCI6MjA3NzMwMDE2Mn0.0633i3lpU6nWCNlQ-JaPNb_XODUdjZPMTZmiOZWt_AA
```

## Step 4: Verify Installation

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Check the health endpoint:
   ```bash
   curl http://localhost:3001/health/database
   ```

   You should see:
   ```json
   {
     "healthy": true,
     "timestamp": "..."
   }
   ```

## Database Schema Overview

The database schema includes:

- **users**: User accounts (parents, educators, therapists)
- **children**: Child profiles linked to users
- **activities**: Learning activities
- **learning_stories**: Documentation of child learning experiences
- **therapy_sessions**: Speech and OT therapy sessions
- **speech_goals**: Speech therapy goals
- **ot_goals**: Occupational therapy goals
- **activity_history**: Records of completed activities
- **achievements**: Child achievements and milestones
- **progress tables**: Progress tracking for therapy goals

## Row Level Security (RLS)

The database uses Row Level Security policies to ensure:
- Users can only access their own data
- Children data is only accessible by their parent/user
- All related data follows the same access patterns

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and keys are correct
- Check that the migration has been run successfully
- Ensure your environment variables are loaded correctly

### RLS Policy Issues
- Make sure you're using the service role key for backend operations
- Check that user authentication is working correctly

### Migration Errors
- Ensure you have the necessary permissions in your Supabase project
- Check that all extensions (uuid-ossp) are enabled

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/overview)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)



