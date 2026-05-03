
-- =========================================================
-- Tighten RLS: add WITH CHECK to UPDATE, scope writes to `authenticated`
-- =========================================================

-- ---------- profiles ----------
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------- bookmarks ----------
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;

CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ---------- reading_history ----------
DROP POLICY IF EXISTS "Users can view own history" ON public.reading_history;
DROP POLICY IF EXISTS "Users can insert own history" ON public.reading_history;
DROP POLICY IF EXISTS "Users can update own history" ON public.reading_history;
DROP POLICY IF EXISTS "Users can delete own history" ON public.reading_history;

CREATE POLICY "Users can view own history"
  ON public.reading_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON public.reading_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history"
  ON public.reading_history FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON public.reading_history FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ---------- comic_subscriptions ----------
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.comic_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.comic_subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscription" ON public.comic_subscriptions;

CREATE POLICY "Users can view own subscriptions"
  ON public.comic_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.comic_subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscription"
  ON public.comic_subscriptions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ---------- comic_ratings ----------
DROP POLICY IF EXISTS "Users can insert own rating" ON public.comic_ratings;
DROP POLICY IF EXISTS "Users can update own rating" ON public.comic_ratings;
DROP POLICY IF EXISTS "Users can delete own rating" ON public.comic_ratings;

CREATE POLICY "Users can insert own rating"
  ON public.comic_ratings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rating"
  ON public.comic_ratings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own rating"
  ON public.comic_ratings FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ---------- comic_reviews ----------
DROP POLICY IF EXISTS "Users can insert own review" ON public.comic_reviews;
DROP POLICY IF EXISTS "Users can update own review" ON public.comic_reviews;
DROP POLICY IF EXISTS "Users can delete own review" ON public.comic_reviews;

CREATE POLICY "Users can insert own review"
  ON public.comic_reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own review"
  ON public.comic_reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own review"
  ON public.comic_reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ---------- chapter_comments ----------
DROP POLICY IF EXISTS "Users can insert own comment" ON public.chapter_comments;
DROP POLICY IF EXISTS "Users can update own comment" ON public.chapter_comments;
DROP POLICY IF EXISTS "Users can delete own comment" ON public.chapter_comments;

CREATE POLICY "Users can insert own comment"
  ON public.chapter_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comment"
  ON public.chapter_comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment"
  ON public.chapter_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ---------- notifications ----------
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Hanya boleh update kolom tertentu (mis. is_read); tetap pastikan user_id tidak diubah
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
