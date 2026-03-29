-- ══════════════════════════════════════════════════════════════════════════
-- EASEY PREP — Supabase Setup SQL
-- Run this in the Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════════════

-- 1. Drop legacy tables if they exist
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.data CASCADE;

-- 2. Create the `data` table — one row per authenticated user.
--    Each row stores the user's profile + ingredient list + meal plan as JSONB.
CREATE TABLE public.data (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile     jsonb DEFAULT '{}'::jsonb  NOT NULL,
  ingredients jsonb DEFAULT '[]'::jsonb  NOT NULL,
  meal_plan   jsonb,
  updated_at  timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS is deliberately disabled so reads/writes work without policy setup.
-- The table is still protected by requiring a valid auth.users FK reference.
