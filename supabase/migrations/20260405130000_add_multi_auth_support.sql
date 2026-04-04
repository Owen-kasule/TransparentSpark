/*
  # Add multi-auth support for admin users

  Allow admin users to authenticate via GitHub OAuth, Google OAuth, or Email Magic Link.
  
  Changes:
  - Make github_id nullable (email/Google users won't have one)
  - Add auth_provider column to track how user authenticated
  - Add unique index on email for email-based lookups
*/

-- Make github_id nullable for non-GitHub auth providers
ALTER TABLE admin_users ALTER COLUMN github_id DROP NOT NULL;

-- Add auth_provider column if it doesn't exist
DO $$ BEGIN
  ALTER TABLE admin_users ADD COLUMN auth_provider text DEFAULT 'github';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Create unique index on email for email-based auth lookups
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_unique ON admin_users (email)
  WHERE email IS NOT NULL AND email != '';
