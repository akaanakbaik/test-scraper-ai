CLI GUI terminal untuk otomatis testing scraper JavaScript (CJS/ESM) dan Python dengan bantuan AI.

---

## Fitur

- Auto detect bahasa scraper
- Support JS CJS, JS ESM, Python
- Auto generate test runner via AI
- Auto install dependency
- Auto retry jika error dependency
- AI fallback system (AI1 → AI3)
- Generate laporan PDF lengkap
- Upload PDF ke CDN
- Output berupa link langsung
- Interactive CLI UI
- Auto cleanup workspace

---

## Requirement

- Node.js >= 20
- npm
- curl
- python3 (optional, otomatis jika diperlukan)

---

## Instalasi

```bash
git clone https://github.com/username/scraper-test-cli
cd scraper-test-cli
npm run setup


---

Cara Pakai

Mode paste

scrapertest

Paste kode scraper langsung.


---

Mode file

scrapertest --file scraper.js
scrapertest --file scraper.py


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


5. Install dependency


6. Jalankan test


7. Retry jika error


8. Generate report AI


9. Convert ke PDF


10. Upload ke CDN


11. Cleanup workspace




---

AI System

AI	Fungsi

AI1	Generate test runner
AI2	Generate report
AI3	Backup jika AI1/AI2 gagal



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

Deteksi kode berbahaya

Tidak menjalankan sebagai root

Timeout proses

Workspace terisolasi



---

Catatan

Semua log disimpan di workspace/logs

Semua report disimpan di reports

Cleanup otomatis setelah selesai



---

Lisensi

Free use untuk testing dan development

---