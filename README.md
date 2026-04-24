Scraper Test CLI

CLI GUI terminal untuk otomatis testing scraper JavaScript (CJS/ESM) dan Python menggunakan AI + auto environment + auto reporting PDF + CDN upload.

---

Repository

https://github.com/akaanakbaik/test-scraper-ai/tree/main

---

Fitur Utama

- Auto detect bahasa scraper (JS CJS, JS ESM, Python)
- Auto generate test runner dengan AI
- Auto install dependency sesuai kebutuhan
- Auto retry jika terjadi error dependency
- AI fallback system (AI1 → AI3)
- Generate laporan lengkap dalam PDF
- Upload otomatis ke CDN (Kabox)
- Output berupa link CDN
- Interactive CLI GUI terminal
- Auto cleanup setelah selesai

---

Fitur Lanjutan (PRO)

Real-time Progress System

- Progress bar live untuk setiap tahap
- Bukan hanya spinner, tapi progress step-by-step
- Tracking:
  - AI processing
  - Install dependency
  - Test execution
  - PDF generation
  - Upload CDN

---

Debug Mode

Aktifkan debug mode:

scrapertest --debug

Fungsi:

- Menampilkan log full real-time
- Menampilkan stdout & stderr langsung
- Menampilkan proses internal
- Tidak disembunyikan oleh loading UI

---

Dependency Caching System

- Dependency tidak diinstall ulang jika sudah ada
- Cache tersimpan di:

workspace/cache/node_modules
workspace/cache/pip

- Install hanya jika:
  - Belum ada
  - Versi tidak cocok
  - Error dependency terdeteksi

---

Docker Sandbox (AUTO)

Tools otomatis menggunakan Docker untuk keamanan:

- Tidak perlu setup manual
- Otomatis detect Docker
- Jika belum ada:
  - Minta izin install
  - Setup otomatis

Sandbox:

- Isolated environment
- Tidak akses sistem utama
- Auto destroy setelah selesai

---

AI System

AI| Fungsi
AI1| Generate test runner
AI2| Generate report
AI3| Backup jika AI1/AI2 gagal

Fallback otomatis:

AI1 gagal → AI3 ambil alih
AI2 gagal → AI3 generate report

---

Requirement

- Node.js >= 20
- npm
- curl
- python3 (optional, auto install jika diperlukan)
- Docker (auto setup)

---

Instalasi

git clone https://github.com/akaanakbaik/test-scraper-ai
cd test-scraper-ai
npm run setup

---

Cara Pakai

Mode Paste

scrapertest

Paste kode scraper langsung.

---

Mode File

scrapertest --file scraper.js
scrapertest --file scraper.py

---

Mode Debug

scrapertest --debug

---

Output

Setelah selesai:

Final Report:
https://api.kabox.my.id/file/xxxx.pdf

---

Alur Sistem

1. Setup environment
2. Input scraper
3. Auto detect bahasa
4. Generate test runner via AI
5. Install dependency (cache-aware)
6. Jalankan test
7. Retry jika error
8. Generate report AI
9. Convert ke PDF
10. Upload ke CDN
11. Cleanup workspace

---

Struktur Project

app/
lib/
runtime/
system/
flow/
report/
ui/
workspace/
reports/

---

Keamanan

- Deteksi kode berbahaya
- Docker sandbox isolation
- Timeout setiap proses
- Tidak menjalankan langsung di host
- Workspace terpisah

---

Logging

Semua log tersimpan di:

workspace/logs/

---

Cache System

workspace/cache/

---

Cleanup

Setelah selesai:

- Hapus:
  - generated files
  - temp files
  - test node_modules
- Simpan:
  - logs
  - reports

---

Catatan

- Tidak ada sensor API key / token
- Semua output real sesuai hasil scraper
- Cocok untuk testing, debugging, dan development

---

Lisensi

Free use untuk testing dan development