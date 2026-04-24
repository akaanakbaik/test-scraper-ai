# Scraper Test CLI

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