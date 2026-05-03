# 📦 Tutorial Migrasi Database: Lovable Cloud → Supabase Sendiri

Panduan lengkap memindahkan database dari Lovable Cloud ke akun **Supabase pribadi** Anda. Cocok untuk dipakai saat Anda membuat proyek Lovable baru dengan Cloud dinonaktifkan, atau saat ingin mandiri sepenuhnya.

> ⚠️ **Catatan penting**: Data autentikasi (`auth.users`) **tidak bisa** dipindahkan. Semua user harus mendaftar ulang.

---

## Daftar Isi

1. [Persiapan](#1-persiapan)
2. [Buat Project Supabase Baru](#2-buat-project-supabase-baru)
3. [Setup Schema (otomatis lewat SQL)](#3-setup-schema-otomatis-lewat-sql)
4. [Konfigurasi Authentication](#4-konfigurasi-authentication)
5. [Export Data dari Lovable Cloud](#5-export-data-dari-lovable-cloud)
6. [Import Data ke Supabase Baru](#6-import-data-ke-supabase-baru)
7. [Hubungkan Aplikasi ke Database Baru](#7-hubungkan-aplikasi-ke-database-baru)
8. [Deploy Edge Functions](#8-deploy-edge-functions)
9. [Setup Storage (jika dipakai)](#9-setup-storage-jika-dipakai)
10. [Verifikasi & Testing](#10-verifikasi--testing)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Persiapan

Yang perlu Anda siapkan:
- Akun [supabase.com](https://supabase.com) (gratis)
- File `database.md` di proyek ini (berisi schema lengkap)
- File `MIGRATION.md` (file ini)
- Akses ke Lovable Cloud project saat ini untuk export data

---

## 2. Buat Project Supabase Baru

1. Login ke [supabase.com/dashboard](https://supabase.com/dashboard)
2. Klik **"New Project"**
3. Isi:
   - **Name**: nama bebas, mis. `komik-app`
   - **Database Password**: **simpan baik-baik**, dipakai jika butuh akses DB langsung
   - **Region**: pilih yang terdekat (Singapore untuk Indonesia)
   - **Plan**: Free tier sudah cukup
4. Tunggu ±2 menit sampai project siap.
5. Setelah ready, catat 3 nilai dari **Settings → API**:
   - **Project URL** (`https://xxxxx.supabase.co`)
   - **anon / public key**
   - **Project Ref / Project ID** (bagian `xxxxx` dari URL)

---

## 3. Setup Schema (otomatis lewat SQL)

Buka **SQL Editor** di Supabase dashboard → **New query**, lalu jalankan blok-blok berikut **berurutan**.

### 3.1 Buat helper functions

```sql
-- Auto-update kolom updated_at
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

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Auto-create profile saat user daftar
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

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
```

### 3.2 Salin seluruh isi `database.md`

Buka file **`database.md`** di proyek ini, salin **semua blok `CREATE TABLE`, `CREATE INDEX`, `ALTER TABLE ... ENABLE RLS`, dan `CREATE POLICY`** untuk 8 tabel, lalu paste & jalankan di SQL Editor.

> 💡 Untuk RLS yang sudah diperketat (versi terbaru), pakai blok di bawah ini menggantikan policy default.

### 3.3 Pasang RLS yang sudah diperketat

```sql
-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- bookmarks
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- reading_history
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own history" ON public.reading_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON public.reading_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own history" ON public.reading_history FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own history" ON public.reading_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- comic_subscriptions
ALTER TABLE public.comic_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON public.comic_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON public.comic_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscription" ON public.comic_subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- comic_ratings
ALTER TABLE public.comic_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view ratings" ON public.comic_ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert own rating" ON public.comic_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rating" ON public.comic_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own rating" ON public.comic_ratings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- comic_reviews
ALTER TABLE public.comic_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.comic_reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own review" ON public.comic_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own review" ON public.comic_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own review" ON public.comic_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- chapter_comments
ALTER TABLE public.chapter_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comments" ON public.chapter_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comment" ON public.chapter_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comment" ON public.chapter_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comment" ON public.chapter_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
-- INSERT sengaja tanpa policy → hanya server (service_role) yang boleh insert
```

### 3.4 Pasang triggers

```sql
-- Auto-create profile saat user daftar
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers
CREATE TRIGGER update_profiles_updated_at         BEFORE UPDATE ON public.profiles         FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reading_history_updated_at  BEFORE UPDATE ON public.reading_history  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comic_ratings_updated_at    BEFORE UPDATE ON public.comic_ratings    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comic_reviews_updated_at    BEFORE UPDATE ON public.comic_reviews    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chapter_comments_updated_at BEFORE UPDATE ON public.chapter_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### 3.5 Aktifkan Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.chapter_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

---

## 4. Konfigurasi Authentication

Di Supabase dashboard:

1. **Authentication → Providers → Email**
   - Aktifkan **Email**
   - **Disable "Confirm email"** untuk testing cepat (aktifkan kembali di production)

2. **Authentication → URL Configuration**
   - **Site URL**: URL aplikasi Anda (mis. `https://app-anda.lovable.app` atau `http://localhost:5173`)
   - **Redirect URLs**: tambahkan semua URL yang dipakai, termasuk `http://localhost:5173/**`

3. **Authentication → Policies → Password**
   - ✅ Aktifkan **"Leaked password protection"** (memblokir password yang pernah bocor di HaveIBeenPwned)
   - Set **Minimum password length** ke 8 atau lebih

4. **(Opsional) Google OAuth**
   - **Authentication → Providers → Google** → masukkan Client ID & Secret dari Google Cloud Console.

---

## 5. Export Data dari Lovable Cloud

### Cara A: Lewat dashboard Cloud (mudah, per tabel)

1. Di Lovable, buka **Cloud → Database → Tables**
2. Untuk setiap tabel, klik tombol **Export → CSV**
3. Simpan semua file CSV di satu folder

### Cara B: Lewat SQL Editor (massal)

Di **SQL Editor** Lovable Cloud, jalankan untuk tiap tabel:

```sql
SELECT * FROM public.bookmarks;
-- Klik tombol "Download CSV" di hasil query
```

Ulangi untuk: `profiles`, `bookmarks`, `reading_history`, `comic_subscriptions`, `comic_ratings`, `comic_reviews`, `chapter_comments`, `notifications`.

---

## 6. Import Data ke Supabase Baru

> ⚠️ **Urutan penting**: import `profiles` paling akhir, karena `user_id` mereferensikan `auth.users` yang belum ada user-nya. Untuk migrasi pertama kali (user belum ada), **lewati impor data per-user** — biarkan user mendaftar ulang dan data baru terbentuk.

Jika tetap ingin impor (mis. sudah recreate users dengan UID yang sama):

1. Di Supabase dashboard → **Table Editor** → pilih tabel
2. Klik **Insert → Import data from CSV**
3. Upload file CSV, mapping kolom otomatis
4. Klik **Import**

Urutan disarankan:
1. `profiles`
2. `bookmarks`, `reading_history`, `comic_subscriptions`
3. `comic_ratings`, `comic_reviews`
4. `chapter_comments` (parent dulu, baru replies)
5. `notifications`

---

## 7. Hubungkan Aplikasi ke Database Baru

Di proyek Lovable baru (dengan Cloud disabled), beritahu AI:

> "Hubungkan ke Supabase saya dengan kredensial berikut:
> - URL: `https://xxxxx.supabase.co`
> - anon key: `eyJ...`
> - project ID: `xxxxx`"

AI akan otomatis:
- Update file `.env`
- Generate `src/integrations/supabase/client.ts`
- Generate `src/integrations/supabase/types.ts`

Atau manual — buat file `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=xxxxx
```

---

## 8. Deploy Edge Functions

Proyek ini punya 1 edge function: **`comic-proxy`** (di `supabase/functions/comic-proxy/index.ts`).

### Install Supabase CLI

```bash
npm install -g supabase
# atau: brew install supabase/tap/supabase
```

### Login & link project

```bash
supabase login
supabase link --project-ref xxxxx     # ganti xxxxx dengan project ref Anda
```

### Deploy

```bash
supabase functions deploy comic-proxy --no-verify-jwt
```

### Set secrets (jika dipakai)

```bash
supabase secrets set NAMA_SECRET=value
```

---

## 9. Setup Storage (jika dipakai)

Proyek ini **belum** menggunakan Storage. Jika nanti butuh:

```sql
-- Contoh: bucket avatar publik
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatar publik" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "User upload avatar sendiri" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 10. Verifikasi & Testing

Checklist setelah migrasi:

- [ ] Daftar user baru → cek apakah row otomatis muncul di `profiles` (trigger `on_auth_user_created` berjalan)
- [ ] Login → cek apakah session tersimpan
- [ ] Tambah bookmark → cek apakah hanya muncul untuk user pemilik
- [ ] Comment di chapter → cek realtime update bekerja (buka 2 tab)
- [ ] Cek **Database → Logs** dan **Auth → Logs** untuk error
- [ ] Jalankan **Database → Database Linter** dan pastikan tidak ada warning critical

### Test RLS via SQL

```sql
-- Sebagai user A, coba update row milik user B → harus GAGAL
UPDATE public.bookmarks SET title = 'hack' WHERE user_id != auth.uid();
-- Hasil: 0 rows affected (RLS bekerja)
```

---

## 11. Troubleshooting

| Masalah | Penyebab | Solusi |
|---|---|---|
| `new row violates row-level security policy` | User belum login atau `user_id` tidak di-set | Pastikan login & insert pakai `user_id: user.id` |
| `infinite recursion detected in policy` | Policy memanggil tabel yang sama | Pakai `SECURITY DEFINER` function |
| Realtime tidak jalan | Tabel belum di-publish | Jalankan `ALTER PUBLICATION supabase_realtime ADD TABLE …` |
| Trigger `on_auth_user_created` tidak jalan | Trigger di-create di schema `public`, bukan di `auth.users` | Pastikan `AFTER INSERT ON auth.users` |
| Email confirm tidak masuk | SMTP belum di-setup | Disable email confirm sementara, atau setup SMTP custom |
| Edge function 401 | JWT verification aktif | Deploy dengan `--no-verify-jwt` jika public |

---

## ✅ Selesai

Database Anda sekarang berjalan di Supabase pribadi. Semua future development bisa dilanjutkan di Lovable proyek baru (tanpa Cloud) dengan AI yang otomatis menulis SQL, edge function, dan kode aplikasi untuk Anda — Anda hanya cukup approve setiap migration.
