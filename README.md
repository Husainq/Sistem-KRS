-- LIVE DEMO --
1. https://project-production-6a22.up.railway.app/login
2. gmail: admin@gmail.com
3. pass : password123

-- STACK -- 
1. Laravel 12
2. PHP 8.2
3. Inertia.js v2
4. React
5. Tailwind CSS
6. MySQL/Postgresql

-- CATATAN IMPLEMENTASI -- 
1. Create KRS membuat student, course, dan enrollment dalam satu DB::transaction.
2. Validasi backend mencakup format field, unique NIM, email, course code, dan foreign key.
3. EnrollmentSeeder mendukung pembuatan jutaan data menggunakan insert server-side per chunk.
4. Live search menggunakan tiga field terpisah: NIM, nama mahasiswa, dan kode mata kuliah.
5. Pagination menggunakan simplePaginate agar tidak menjalankan COUNT(*) pada jutaan data.
6. Filter pencarian menggunakan subquery ID dan index foreign key.
7. Export data menggunakan chunkById agar hemat memory.

-- BATASAN --
1. Aplikasi membutuhkan MySQL/Postgresql aktif.
2. Seeder 5 juta data membutuhkan waktu dan storage database yang cukup.

-- PENGUJIAN --

--TS-01: Setup & Seed 5 Juta Data--

Menjalankan seeder untuk menghasilkan 5.000.000 baris enrollments.  
<img width="621" height="861" alt="Screenshot 2026-09-20 102827" src="https://github.com/user-attachments/assets/0b56e364-1817-4153-a82f-e2509243819d" />

Menjalankan query count.
<img width="712" height="219" alt="Screenshot 2026-09-20 103601" src="https://github.com/user-attachments/assets/8b16a4e5-0e01-4992-a85a-d9f29f8d05a7" />

Aplikasi tetap bisa berjalan dan menampilkan data.
<img width="1917" height="927" alt="image" src="https://github.com/user-attachments/assets/02c1d213-c90d-439f-b9c0-59c00365cef8" />

----

--TS-02: Create (Insert ke 3 Tabel dalam 1 Transaksi)--

Inputan KRS
<img width="1919" height="907" alt="image" src="https://github.com/user-attachments/assets/c65f7fdd-7b40-4a54-aa36-1de660e6b4cb" />

Hasil data inputan
<img width="1919" height="883" alt="image" src="https://github.com/user-attachments/assets/3b045e7d-0b73-4d76-8299-1cb011d0aedd" />
<img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/0524bd58-be5f-4831-94f9-68d10b57f7ae" />
<img width="1917" height="936" alt="image" src="https://github.com/user-attachments/assets/8bef484a-0d09-4bb4-98a4-ddd2393d056c" />

----

--TS-03: Validasi Ketat (Frontend)--

<img width="633" height="822" alt="image" src="https://github.com/user-attachments/assets/f0b5472a-5d1b-4526-8c60-69740288eb37" />
<img width="587" height="826" alt="image" src="https://github.com/user-attachments/assets/0661d3e8-52e2-46f0-a1b0-674f171e0c63" />

----

--TS-04: Validasi Ketat (Backend)--

<img width="1095" height="607" alt="image" src="https://github.com/user-attachments/assets/d0a322ee-de21-4c80-b945-693c00f1b9b3" />

----

--TS-06: Sorting di Setiap Header Kolom (Server-Side)--

NIM Ascending
<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/235e62c1-001b-46d9-9a7f-ac99594f690b" />

NIM Descending
<img width="1919" height="919" alt="image" src="https://github.com/user-attachments/assets/f464239d-8e0c-4cbd-b7e0-592f6f271a6d" />

Nilai Ascending
<img width="1919" height="903" alt="image" src="https://github.com/user-attachments/assets/f3362419-8aa6-40fa-9a2d-3d3354f6c963" />

Nilai Descending
<img width="1919" height="523" alt="image" src="https://github.com/user-attachments/assets/73b34021-a6c9-4ed7-a023-8dd7c9378c6d" />

----

--TS-07: Quick Filter (Minimal 2)--

<img width="1919" height="913" alt="image" src="https://github.com/user-attachments/assets/aa71a255-5801-40fd-b2a5-97521b0539ba" />

----

--TS-08: Live Searching (Minimal 3 Kolom) dan TS-09: Advanced Filter Semua Kolom (Multi Filter)--

<img width="1919" height="950" alt="image" src="https://github.com/user-attachments/assets/63196363-f51e-4663-b0c7-93f9b8bff019" />
<img width="1919" height="936" alt="image" src="https://github.com/user-attachments/assets/0a9c7c84-99b9-43bf-93ff-363c6ac9887e" />

----

--TS-10: Advanced Query (AND/OR)--

OR
<img width="1919" height="935" alt="image" src="https://github.com/user-attachments/assets/d2e4cb76-dc55-476f-a448-f013e3fcbbe7" />

AND
<img width="1919" height="933" alt="image" src="https://github.com/user-attachments/assets/4b84dabf-4317-41c5-96c0-ee02b451abb4" />

----

--TS-11: Update--

Before
<img width="1919" height="935" alt="image" src="https://github.com/user-attachments/assets/c80b06eb-497a-42a6-b3ec-742d2a962a7a" />

After
<img width="1919" height="934" alt="image" src="https://github.com/user-attachments/assets/9d90b2d1-b636-463d-83d4-09e47598890a" />
<img width="1918" height="931" alt="image" src="https://github.com/user-attachments/assets/671f5cb3-8af3-48b3-b0fb-41ab3367407d" />

----

--TS-12: Delete--

Before
<img width="1918" height="931" alt="image" src="https://github.com/user-attachments/assets/671f5cb3-8af3-48b3-b0fb-41ab3367407d" />

After
<img width="1918" height="955" alt="image" src="https://github.com/user-attachments/assets/7d0c7c54-c0d3-4cdb-a75a-21b3262c7d00" />
<img width="1919" height="932" alt="image" src="https://github.com/user-attachments/assets/9e742bcd-39f6-48ce-9c82-00cf6de668d8" />

----

--TS-13: Export 5 Juta Data (CSV/Excel)--

<img width="349" height="148" alt="image" src="https://github.com/user-attachments/assets/232356cc-bff2-4987-963e-529e6f38b353" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/0bb39c0f-3c49-4bdb-b004-ea3ae702590c" />

----



