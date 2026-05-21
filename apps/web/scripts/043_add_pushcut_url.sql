-- Migration to add pushcut_url to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pushcut_url TEXT;
