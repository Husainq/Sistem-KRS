<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate([
            'email' => 'admin@example.com',
        ], [
            'name' => 'Admin User',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        for ($index = 1; $index <= 9; $index++) {
            $mahasiswa = User::updateOrCreate([
                'email' => "mahasiswa{$index}@example.com",
            ], [
                'name' => "Mahasiswa {$index}",
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'role' => 'mahasiswa',
            ]);

            Student::updateOrCreate([
                'user_id' => $mahasiswa->id,
            ], [
                'nim' => sprintf('2025%04d', $index),
                'name' => $mahasiswa->name,
                'email' => $mahasiswa->email,
            ]);
        }

        $this->call([
            CourseSeeder::class,
            EnrollmentSeeder::class,
        ]);
    }
}
