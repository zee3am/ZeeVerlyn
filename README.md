# ZeeVerlyn

Website personal yang dibuat dengan React dan Vite.

## Persiapan Supabase

1. Salin `.env.example` menjadi `.env` di root project.
2. Isi:
   - `VITE_SUPABASE_URL=https://<your-project-id>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=<your-anon-key>`
3. Jangan commit file `.env` ke Git.

## Konfigurasi Vercel

1. Buka dashboard Vercel proyek kamu.
2. Tambahkan Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy ulang aplikasi setelah menyimpan environment variables.

## Gambar Statis

Aplikasi menggunakan path gambar statis dari `public/images/` seperti:

- `public/images/timeline/first-met.jpg`
- `public/images/timeline/first-date.jpg`
- `public/images/timeline/jadian.jpg`
- `public/images/timeline/first-trip.jpg`
- `public/images/gallery/photo-1.jpg`
- `public/images/gallery/photo-2.jpg`
- `public/images/gallery/photo-3.jpg`
- `public/images/playlist/cover-1.jpg`
- `public/images/playlist/cover-2.jpg`
- `public/images/avatars/zidane.png`
- `public/images/avatars/verlita.png`

Jika kamu menggunakan gambar sendiri, letakkan file-file tersebut di folder `public/images/...` sesuai path.

## Deploy ulang

Setelah env Supabase terpasang dan file gambar tersedia, jalankan:

```bash
npm run build
npm run preview
```

Lalu push ke Git dan deploy ulang di Vercel.

## Catatan

- Jika masih muncul `Mode demo: Supabase belum terhubung!`, artinya `VITE_SUPABASE_URL` atau `VITE_SUPABASE_ANON_KEY` belum terpasang dengan benar.
- Jika masih muncul error 404 untuk gambar, pastikan file sudah ada di folder `public/images/` dan pathnya sesuai.
