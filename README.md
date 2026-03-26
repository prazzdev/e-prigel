# 💸 CATAT.KAS v1

**CATAT.KAS** adalah aplikasi manajemen keuangan pribadi (Personal Finance) berbasis mobile yang dibangun dengan **React Native (Expo)**. Aplikasi ini mengusung desain **Neobrutalism** yang berani, kontras, dan minimalis, dirancang khusus untuk pencatatan transaksi yang cepat, aman, dan informatif.

---

## 🚀 Fitur Utama

* **Multi-Wallet Management:** Kelola berbagai sumber dana (Cash, Bank, E-Wallet) dalam satu tempat dengan warna yang bisa dipersonalisasi.
* **Monthly Budgeting:** Tetapkan batas pengeluaran per kategori. Pantau pemakaian anggaran melalui *progress bar* interaktif di beranda.
* **Visual Analytics:** Analisis tren pengeluaran mingguan dengan *Bar Chart* dan distribusi pengeluaran per kategori dengan *Pie Chart*.
* **Cloud Sync (Supabase):** Cadangkan dan pulihkan data transaksi Anda secara aman ke cloud agar tidak hilang saat berganti perangkat.
* **Biometric Security:** Amankan data finansial sensitif dengan pengunci aplikasi menggunakan Sidik Jari (Fingerprint) atau pengenalan wajah (FaceID).
* **Export to CSV:** Ekspor seluruh riwayat transaksi ke format CSV untuk keperluan pelaporan atau rekapitulasi di Excel/Spreadsheet.
* **Local-First Database:** Menggunakan SQLite untuk penyimpanan lokal yang cepat dan tetap bisa digunakan tanpa koneksi internet.

---

## 🛠️ Stack Teknologi

* **Framework:** [Expo](https://expo.dev/) (React Native)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand)
* **Database Lokal:** [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
* **Backend & Auth:** [Supabase](https://supabase.com/)
* **UI Components:** Lucide React Native & React Native Gifted Charts
* **Security:** `expo-local-authentication`
* **Font:** Plus Jakarta Sans

---

## 📦 Instalasi

1.  **Clone Repository**
    ```bash
    git clone [https://github.com/username/catat-kas.git](https://github.com/username/catat-kas.git)
    cd catat-kas
    ```

2.  **Instal Dependensi**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment**
    Buat file `.env` di root folder dan masukkan kredensial Supabase Anda:
    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Jalankan Aplikasi**
    ```bash
    npx expo start
    ```

---

## 📐 Skema Database

Aplikasi ini menggunakan skema SQLite otomatis yang mendukung migrasi. Tabel utama meliputi:
* `accounts`: Menyimpan data dompet dan saldo.
* `categories`: Menyimpan kategori transaksi beserta nominal anggaran (*budget*).
* `transactions`: Menyimpan seluruh log arus kas masuk dan keluar.

---

## 🛡️ Keamanan Data

Seluruh data transaksi disimpan di penyimpanan lokal perangkat secara default. Fitur biometrik memastikan bahwa hanya pemilik perangkat yang dapat mengakses isi saldo dan riwayat transaksi. Untuk fitur sinkronisasi, data dikirim ke Supabase menggunakan enkripsi standar industri.

---

## 📜 Lisensi

Proyek ini dibuat untuk tujuan pembelajaran dan manajemen pribadi. Silakan gunakan dan modifikasi sesuai kebutuhan.

---

> Built with ⚡ by **PRAZZ.ID**