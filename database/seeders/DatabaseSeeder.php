<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create an admin account and a mahasiswa account for testing (idempotent)
        User::updateOrCreate([
            'email' => 'admin@example.com',
        ], [
            'name' => 'Admin User',
            'email_verified_at' => now(),
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $mahasiswa = User::updateOrCreate([
            'email' => 'mahasiswa@example.com',
        ], [
            'name' => 'Mahasiswa User',
            'email_verified_at' => now(),
            'password' => bcrypt('password'),
            'role' => 'mahasiswa',
        ]);

        Student::updateOrCreate([
            'user_id' => $mahasiswa->id,
        ], [
            'nim' => '20250001',
            'name' => $mahasiswa->name,
            'email' => $mahasiswa->email,
        ]);

        $this->call([
            CourseSeeder::class,
            EnrollmentSeeder::class,
        ]);
    }
}
