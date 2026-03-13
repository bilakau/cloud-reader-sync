

# Fix: Gagal Memuat Gambar di Reader

## Masalah
Gambar komik di-load langsung dari URL eksternal (CDN pihak ketiga). Server CDN tersebut memblokir request dari domain kamu (`fmccomic.my.id`) karena **hotlink protection** — mereka cek header `Referer` dan menolak request yang bukan dari situs aslinya.

## Solusi: Image Proxy via Edge Function

Buat endpoint baru di edge function `comic-proxy` yang mem-proxy gambar. Alih-alih browser langsung fetch ke CDN eksternal, browser akan fetch melalui edge function kita yang mengirim request dengan `Referer` yang benar.

### Perubahan

**1. Update `supabase/functions/comic-proxy/index.ts`**
- Tambah parameter `image` — jika ada, proxy binary image alih-alih JSON API
- Fetch gambar dari URL asli dengan header `Referer` yang sesuai (situs komik asli)
- Return response sebagai binary image dengan content-type yang benar

```text
Client Request:
  /comic-proxy?image=https://cdn.example.com/page1.jpg
       │
       ▼
  Edge Function (with correct Referer header)
       │
       ▼
  CDN Server → returns image → piped back to client
```

**2. Update `src/pages/ReaderPage.tsx`**
- Ubah `img.url` menjadi URL yang melewati proxy:
  ```
  /functions/v1/comic-proxy?image={encoded_url}
  ```
- Tambah helper function untuk generate proxy URL
- Tambah retry logic: jika gambar gagal load, coba lagi 1x sebelum tampilkan error

### Detail Teknis

Edge function akan handle parameter `image`:
- Fetch URL gambar dengan header `Referer: https://www.sankavollerei.com/` dan `User-Agent` browser
- Stream response binary langsung ke client
- Set `Cache-Control` header agar browser cache gambar (mengurangi beban proxy)
- Return content-type asli dari upstream response

ReaderPage akan generate URL proxy:
```
https://{projectId}.supabase.co/functions/v1/comic-proxy?image={encodeURIComponent(img.url)}
```

