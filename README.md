# AduanPBT.ai 🏛️

**Suara Rakyat, Tindakan PBT.**

AduanPBT.ai adalah platform inovatif yang menggunakan kecerdasan buatan (AI) untuk membantu rakyat Malaysia membuat aduan atau memberi penghargaan kepada Pihak Berkuasa Tempatan (PBT) dengan lebih profesional dan efektif.

## ✨ Ciri-ciri Utama

- **Audit Visual Pintar**: Muat naik gambar kerosakan, dan AI akan menganalisis tahap kerosakan secara automatik.
- **Penjanaan Dokumen Rasmi**: Menghasilkan surat kiriman rasmi atau emel penghargaan yang mengikut format standard PBT.
- **Carian Pintar PBT**: Secara automatik mencari maklumat perhubungan (Emel, WhatsApp, Talian Hotline) agensi yang berkaitan.
- **Dwi-Mod Respons**: Berkeupayaan melaporkan kerosakan (Aduan) atau memuji penyelenggaraan yang baik (Penghargaan).
- **Eksport PDF**: Muat turun laporan sebagai fail PDF untuk tujuan arkib atau lampiran dokumen.

## 🛠️ Teknologi

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Animasi**: Framer Motion
- **Analisis AI**: Audit Visual & Pemprosesan Bahasa Alami (NLP)

## 🚀 Pemasangan & Pembangunan

### Prasyarat
- Node.js (v20 ke atas direkomendasikan)
- NPM atau Yarn

### Langkah Pemasangan
1. Klon repositori ini.
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Mulakan pelayan pembangunan:
   ```bash
   npm run dev
   ```

## 🐳 Deployment (Docker)

Laman web ini sedia untuk dideploy ke Google Cloud Run menggunakan Docker:

```bash
docker build -t aduanpbt-ai .
docker run -p 3000:3000 aduanpbt-ai
```

---
*Dibuat untuk memperkasakan komuniti melalui teknologi.*
