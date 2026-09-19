<?php

namespace Database\Seeders;

use App\Models\Courses;
use App\Models\Student;
use Illuminate\Database\QueryException;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $target = (int) env('ENROLLMENT_SEED_COUNT', 5_000_000);
        $chunkSize = 10_000;
        $studentIds = Student::query()->pluck('id')->all();
        $courseIds = Courses::query()->pluck('id')->all();

        if ($target < 1) {
            return;
        }

        if ($studentIds === [] || $courseIds === []) {
            throw new \RuntimeException('Buat minimal satu Student dan satu Course sebelum menjalankan EnrollmentSeeder.');
        }

        $combinationCapacity = count($studentIds) * count($courseIds) * 10 * 2;

        if ($target > $combinationCapacity) {
            throw new \RuntimeException("Target {$target} melebihi kapasitas kombinasi unik {$combinationCapacity}. Tambahkan Student/Course atau naikkan rentang tahun.");
        }

        $created = 0;
        $combination = 0;
        $timestamp = now();

        while ($created < $target) {
            $rows = [];

            while (count($rows) < $chunkSize && $created + count($rows) < $target) {
                $studentIndex = intdiv($combination, count($courseIds) * 20);
                $courseIndex = intdiv($combination % (count($courseIds) * 20), 20);
                $yearIndex = intdiv($combination % 20, 2);
                $semester = $combination % 2 === 0 ? 'GANJIL' : 'GENAP';

                $rows[] = [
                    'student_id' => $studentIds[$studentIndex],
                    'course_id' => $courseIds[$courseIndex],
                    'academic_year' => (string) (2020 + $yearIndex).'/'.(string) (2021 + $yearIndex),
                    'semester' => $semester,
                    'status' => 'APPROVED',
                    'grade' => random_int(60, 100),
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ];

                $combination++;
            }

            try {
                DB::table('enrollments')->insert($rows);
            } catch (QueryException $exception) {
                throw new \RuntimeException('Gagal mengisi data Enrollment. Pastikan migration dan unique constraint sudah dijalankan.', 0, $exception);
            }

            $created += count($rows);

            if ($created % 100_000 === 0 || $created === $target) {
                $this->command?->info("Enrollment dibuat: {$created}/{$target}");
            }
        }
    }
}
