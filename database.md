# Database Schema

Dokumentasi lengkap skema database (PostgreSQL / Supabase) untuk proyek ini. Semua SQL di bawah dapat dijalankan ulang untuk membangun ulang struktur database dari nol pada instance Supabase baru.

---

## Daftar Tabel

1. [profiles](#1-profiles)
2. [bookmarks](#2-bookmarks)
3. [reading_history](#3-reading_history)
4. [comic_subscriptions](#4-comic_subscriptions)
5. [comic_ratings](#5-comic_ratings)
6. [comic_reviews](#6-comic_reviews)
7. [chapter_comments](#7-chapter_comments)
8. [notifications](#8-notifications)

Plus: [Functions](#functions), [Triggers](#triggers), [Realtime](#realtime).

---

## 1. profiles

```sql
CREATE TABLE public.profiles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username   text,
  avatar_url text,
  bio        text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 2. bookmarks

```sql
CREATE TABLE public.bookmarks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comic_slug text NOT NULL,
  title      text NOT NULL,
  image      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, comic_slug)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 3. reading_history

```sql
CREATE TABLE public.reading_history (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comic_slug          text NOT NULL,
  title               text NOT NULL,
  image               text,
  last_chapter_slug   text,
  last_chapter_title  text,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, comic_slug)
);

ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
  ON public.reading_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON public.reading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history"
  ON public.reading_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON public.reading_history FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_reading_history_updated_at
  BEFORE UPDATE ON public.reading_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 4. comic_subscriptions

```sql
CREATE TABLE public.comic_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comic_slug  text NOT NULL,
  comic_title text NOT NULL,
  comic_image text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, comic_slug)
);

ALTER TABLE public.comic_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.comic_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.comic_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscription"
  ON public.comic_subscriptions FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 5. comic_ratings

```sql
CREATE TABLE public.comic_ratings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comic_slug text NOT NULL,
  rating     smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, comic_slug)
);

ALTER TABLE public.comic_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
  ON public.comic_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own rating"
  ON public.comic_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rating"
  ON public.comic_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rating"
  ON public.comic_ratings FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_comic_ratings_updated_at
  BEFORE UPDATE ON public.comic_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 6. comic_reviews

```sql
CREATE TABLE public.comic_reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comic_slug  text NOT NULL,
  content     text NOT NULL,
  likes_count integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, comic_slug)
);

ALTER TABLE public.comic_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON public.comic_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own review"
  ON public.comic_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own review"
  ON public.comic_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own review"
  ON public.comic_reviews FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_comic_reviews_updated_at
  BEFORE UPDATE ON public.comic_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 7. chapter_comments

```sql
CREATE TABLE public.chapter_comments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_slug text NOT NULL,
  parent_id    uuid REFERENCES public.chapter_comments(id) ON DELETE CASCADE,
  content      text NOT NULL,
  likes_count  integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chapter_comments_chapter ON public.chapter_comments (chapter_slug);
CREATE INDEX idx_chapter_comments_parent  ON public.chapter_comments (parent_id);

ALTER TABLE public.chapter_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON public.chapter_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own comment"
  ON public.chapter_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comment"
  ON public.chapter_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment"
  ON public.chapter_comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_chapter_comments_updated_at
  BEFORE UPDATE ON public.chapter_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chapter_comments;
```

---

## 8. notifications

```sql
CREATE TABLE public.notifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comic_slug    text NOT NULL,
  comic_title   text NOT NULL,
  chapter_slug  text,
  chapter_title text,
  message       text NOT NULL,
  is_read       boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user
  ON public.notifications (user_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

> Catatan: Tabel `notifications` tidak punya policy INSERT untuk klien. Insert dilakukan oleh server (Edge Function / service role) menggunakan `SUPABASE_SERVICE_ROLE_KEY` yang bypass RLS.

---

## Functions

### `update_updated_at_column()`

Helper trigger function untuk auto-update kolom `updated_at`.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

### `handle_new_user()`

Auto-create row di `profiles` saat user baru mendaftar di `auth.users`.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;
```

---

## Triggers

```sql
-- Auto-create profile saat user baru daftar
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers (sudah dideklarasi di tiap tabel di atas)
-- - update_profiles_updated_at
-- - update_reading_history_updated_at
-- - update_comic_ratings_updated_at
-- - update_comic_reviews_updated_at
-- - update_chapter_comments_updated_at
```

---

## Realtime

Tabel berikut sudah ditambahkan ke publication `supabase_realtime`:

- `public.chapter_comments`
- `public.notifications`

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.chapter_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

---

## Urutan Eksekusi (Setup dari Nol)

1. Buat function `update_updated_at_column()` dan `handle_new_user()`.
2. Jalankan `CREATE TABLE` untuk semua 8 tabel di atas.
3. Jalankan semua `CREATE POLICY`, `CREATE INDEX`, `CREATE TRIGGER`.
4. Tambahkan trigger `on_auth_user_created` pada `auth.users`.
5. Tambahkan tabel ke publication `supabase_realtime`.

Setelah itu database siap dipakai oleh aplikasi.
