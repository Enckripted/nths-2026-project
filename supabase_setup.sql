-- Run this in the Supabase SQL Editor to wire up official authentication

-- 1. Drop the old custom `public.users` dummy table (if it exists)
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Drop the existing `public.data` table because it was likely created by default with a `bigint` ID instead of a `uuid`! We need it to be a UUID to match the real authentication system.
DROP TABLE IF EXISTS public.data CASCADE;

-- 3. Create the fresh `data` table explicitly mapped to Supabase's built-in `auth.users`
CREATE TABLE public.data (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile jsonb DEFAULT '{}'::jsonb NOT NULL,
  ingredients jsonb DEFAULT '[]'::jsonb NOT NULL,
  meal_plan jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
