-- ====================================================================
-- TripNest 2.0 — Supabase PostgreSQL Database & Auth Setup Schema
-- ====================================================================

-- 1. Create the User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure bio column exists if table was previously created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Enable Row Level Security (RLS) on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Define Security Policies for Profiles (Idempotent)
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "System trigger can insert profile" ON public.profiles;
CREATE POLICY "System trigger can insert profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- 4. Automatic Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, bio)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'fullName', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'bio'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 5. Journeys Table & Constraints
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.journeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
    destination TEXT NOT NULL CHECK (char_length(trim(destination)) > 0),
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cover_image_url TEXT,
    travel_type TEXT,
    budget NUMERIC(12,2) CHECK (budget IS NULL OR budget >= 0),
    travelers INTEGER DEFAULT 1 CHECK (travelers >= 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_dates CHECK (end_date >= start_date)
);

-- Enable RLS on Journeys
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;

-- 6. Journeys RLS Policies
DROP POLICY IF EXISTS "Authenticated users can view journeys" ON public.journeys;
CREATE POLICY "Authenticated users can view journeys"
ON public.journeys
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can create journeys for themselves" ON public.journeys;
CREATE POLICY "Users can create journeys for themselves"
ON public.journeys
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own journeys" ON public.journeys;
CREATE POLICY "Users can update own journeys"
ON public.journeys
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own journeys" ON public.journeys;
CREATE POLICY "Users can delete own journeys"
ON public.journeys
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 7. Automatic updated_at Trigger for Journeys
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_journeys_updated_at ON public.journeys;
CREATE TRIGGER set_journeys_updated_at
  BEFORE UPDATE ON public.journeys
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 8. Phase 4: Travel Social Platform Tables & Policies
-- ====================================================================

-- 8.1 POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    journey_id UUID REFERENCES public.journeys(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    destination TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view posts" ON public.posts;
CREATE POLICY "Authenticated users can view posts"
ON public.posts
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
CREATE POLICY "Users can create their own posts"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts"
ON public.posts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_posts_updated_at ON public.posts;
CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8.2 FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT chk_not_self_follow CHECK (follower_id <> following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view follows" ON public.follows;
CREATE POLICY "Authenticated users can view follows"
ON public.follows
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can follow as themselves" ON public.follows;
CREATE POLICY "Users can follow as themselves"
ON public.follows
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow as themselves" ON public.follows;
CREATE POLICY "Users can unfollow as themselves"
ON public.follows
FOR DELETE
TO authenticated
USING (auth.uid() = follower_id);

-- 8.3 LIKES TABLE
CREATE TABLE IF NOT EXISTS public.likes (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view likes" ON public.likes;
CREATE POLICY "Authenticated users can view likes"
ON public.likes
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can like as themselves" ON public.likes;
CREATE POLICY "Users can like as themselves"
ON public.likes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike as themselves" ON public.likes;
CREATE POLICY "Users can unlike as themselves"
ON public.likes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 8.4 COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.comments;
CREATE POLICY "Authenticated users can view comments"
ON public.comments
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can create comments as themselves" ON public.comments;
CREATE POLICY "Users can create comments as themselves"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments"
ON public.comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_comments_updated_at ON public.comments;
CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8.5 SAVED POSTS TABLE
CREATE TABLE IF NOT EXISTS public.saved_posts (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own saved posts" ON public.saved_posts;
CREATE POLICY "Users can view own saved posts"
ON public.saved_posts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save posts for themselves" ON public.saved_posts;
CREATE POLICY "Users can save posts for themselves"
ON public.saved_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave posts for themselves" ON public.saved_posts;
CREATE POLICY "Users can unsave posts for themselves"
ON public.saved_posts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 8.6 NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = actor_id);

DROP POLICY IF EXISTS "Users can update own notifications read status" ON public.notifications;
CREATE POLICY "Users can update own notifications read status"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);
