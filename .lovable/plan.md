## FmcComic — Aplikasi Baca Komik Modern 🎨📚

Rebuild total website komik kamu dari vanilla HTML/JS ke React modern dengan fitur cloud sync, auth, dan PWA.

---

### 1. Setup Dasar & Tema

- Setup dark theme dengan warna  Dark theme utama dengan aksen Abu abu/hitam gradient atau warna putih backgroundnya sesuaikan 
- Pasang icon web dari URL yang diberikan sebagai favicon
- Setup PWA agar website bisa diinstall di HP (Add to Home Screen)

### 2. Integrasi API Baru (Komikindo)

- Buat service layer untuk semua endpoint API baru (`sankavollerei.com/comic/komikindo/`):
  - **Home/Latest** (`/latest/{page}`) — Update terbaru dengan pagination
  - **Search** (`/search/{query}/{page}`) — Pencarian komik
  - **Library** (`/library?page={page}`) — Daftar semua komik
  - **Detail** (`/detail/{slug}`) — Info komik, sinopsis, daftar chapter
  - **Chapter Reader** (`/chapter/{slug}`) — Gambar-gambar chapter untuk dibaca
- Semua request melalui edge function sebagai proxy untuk menghindari CORS

### 3. Halaman-Halaman Utama

- **Beranda**: Carousel komik populer + grid rilis terbaru + komik populer (sidebar)
- **Ongoing & Completed**: Grid komik dengan filter status dan pagination
- **Search & Filter**: Pencarian judul, filter genre, tipe (Manga/Manhwa/Manhua), status
- **Detail Komik**: Cover besar, info (rating, status, tipe), sinopsis expandable, daftar chapter dengan search, tombol bookmark & lanjut baca
- **Chapter Reader**: Mode baca vertikal dengan gambar full-width, navigasi prev/next chapter, dropdown pilih chapter, tap untuk hide/show UI, progress bar scroll
- **Riwayat Baca**: Daftar komik yang pernah dibaca (synced)
- **Bookmark/Favorit**: Koleksi komik yang disimpan (synced)

### 4. Login & Register (Lovable Cloud + Supabase Auth)

- Halaman **Register**: Daftar dengan email & password (tanpa verifikasi OTP)
- Halaman **Login**: Masuk dengan email & password
- Auto-login setelah register
- Tombol profil/logout di navbar

### 5. Cloud Sync — History & Bookmark

- Setelah login, riwayat baca dan bookmark tersimpan di database Supabase
- Ganti device → login → data kembali otomatis
- Jika belum login, data tetap tersimpan di localStorage (offline-first)
- Saat login pertama kali, merge data localStorage ke cloud

### 6. UI/UX Premium

- **Navbar desktop** dengan logo, menu navigasi, search, bookmark
- **Bottom navigation mobile** (Home, Hot, Tamat, Riwayat)
- **Card hover effects** dengan animasi smooth
- **Badge tipe komik** (Manga=biru, Manhwa=hijau, Manhua=pink)
- **Skeleton loading** shimmer saat memuat data
- **Progress bar** di atas saat membaca chapter
- **Glassmorphism** panels untuk navbar dan UI elements
- **Responsive design** optimal untuk mobile & desktop
- **Smooth transitions** dan animasi fade-in

### 7. PWA Support

- Service worker untuk offline caching
- Manifest file dengan icon dan nama app "FmcComic"
- Halaman `/install` untuk panduan install di HP
- Bisa diinstall dari browser ke home screen

---

**Teknologi**: React + TypeScript + Tailwind CSS + Supabase (Auth + Database) + PWA + Edge Functions (API proxy)