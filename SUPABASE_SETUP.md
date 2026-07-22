# Supabase Database Setup & Schema Instructions

To set up your Supabase project for this website, follow these simple steps:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Go to **SQL Editor** in the left menu.
3. Paste and run the following SQL script to create the necessary tables and permissions:

```sql
-- 1. Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  level TEXT,
  rating NUMERIC DEFAULT 5.0,
  review_count NUMERIC DEFAULT 0,
  duration TEXT,
  lessons_count NUMERIC DEFAULT 0,
  price NUMERIC DEFAULT 0,
  thumbnail TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  instructor JSONB DEFAULT '{}'::jsonb,
  syllabus JSONB DEFAULT '[]'::jsonb,
  promo_video_url TEXT,
  details_description TEXT,
  coming_soon_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create users_progress table
CREATE TABLE IF NOT EXISTS public.users_progress (
  id TEXT PRIMARY KEY,
  uid TEXT,
  email TEXT,
  display_name TEXT,
  phone_number TEXT,
  enrolled_courses JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create configs table (for custom logos, image settings, etc.)
CREATE TABLE IF NOT EXISTS public.configs (
  id TEXT PRIMARY KEY,
  data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configs ENABLE ROW LEVEL SECURITY;

-- 5. Create Row Level Security Policies for full read/write access
CREATE POLICY "Allow public read and write courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read and write users_progress" ON public.users_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read and write configs" ON public.configs FOR ALL USING (true) WITH CHECK (true);
```

4. Go to **Project Settings > API** in your Supabase dashboard to find your **Project URL** and **anon / public key**.
5. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your environment settings.
