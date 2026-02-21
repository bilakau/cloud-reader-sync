
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  avatar_url text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Comic ratings
CREATE TABLE public.comic_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comic_slug text NOT NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, comic_slug)
);
ALTER TABLE public.comic_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings" ON public.comic_ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert own rating" ON public.comic_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rating" ON public.comic_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rating" ON public.comic_ratings FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_comic_ratings_updated_at
  BEFORE UPDATE ON public.comic_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Comic reviews
CREATE TABLE public.comic_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comic_slug text NOT NULL,
  content text NOT NULL,
  likes_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, comic_slug)
);
ALTER TABLE public.comic_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.comic_reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own review" ON public.comic_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own review" ON public.comic_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own review" ON public.comic_reviews FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_comic_reviews_updated_at
  BEFORE UPDATE ON public.comic_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chapter comments (threaded)
CREATE TABLE public.chapter_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_slug text NOT NULL,
  parent_id uuid REFERENCES public.chapter_comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  likes_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chapter_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.chapter_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comment" ON public.chapter_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comment" ON public.chapter_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comment" ON public.chapter_comments FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_chapter_comments_chapter ON public.chapter_comments (chapter_slug);
CREATE INDEX idx_chapter_comments_parent ON public.chapter_comments (parent_id);

CREATE TRIGGER update_chapter_comments_updated_at
  BEFORE UPDATE ON public.chapter_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Comic subscriptions
CREATE TABLE public.comic_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comic_slug text NOT NULL,
  comic_title text NOT NULL,
  comic_image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, comic_slug)
);
ALTER TABLE public.comic_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.comic_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON public.comic_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscription" ON public.comic_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comic_slug text NOT NULL,
  comic_title text NOT NULL,
  chapter_slug text,
  chapter_title text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user ON public.notifications (user_id, is_read, created_at DESC);

-- Enable realtime for comments and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.chapter_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Fix existing bookmarks RLS policies (change RESTRICTIVE to PERMISSIVE)
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;

CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix existing reading_history RLS policies
DROP POLICY IF EXISTS "Users can view own history" ON public.reading_history;
DROP POLICY IF EXISTS "Users can insert own history" ON public.reading_history;
DROP POLICY IF EXISTS "Users can update own history" ON public.reading_history;
DROP POLICY IF EXISTS "Users can delete own history" ON public.reading_history;

CREATE POLICY "Users can view own history" ON public.reading_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON public.reading_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own history" ON public.reading_history FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own history" ON public.reading_history FOR DELETE TO authenticated USING (auth.uid() = user_id);
