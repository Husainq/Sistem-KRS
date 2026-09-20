<?php

namespace Database\Seeders;

use App\Models\Courses;
use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $target = (int) env('ENROLLMENT_SEED_COUNT', 500);
        $chunkSize = 25_000;
        $studentCount = Student::count();
        $courseCount = Courses::count();

        if ($target < 1) {
            return;
        }

        if ($studentCount === 0 || $courseCount === 0) {
            throw new \RuntimeException('Buat minimal satu Student dan satu Course sebelum menjalankan EnrollmentSeeder.');
        }

        $yearCount = 9_999;
        $combinationCapacity = $studentCount * $courseCount * $yearCount * 2;

        if ($target > $combinationCapacity) {
            throw new \RuntimeException("Target {$target} melebihi kapasitas kombinasi unik {$combinationCapacity}. Tambahkan Student/Course atau naikkan rentang tahun.");
        }

        if (! in_array(DB::getDriverName(), ['mysql', 'pgsql'], true)) {
            throw new \RuntimeException('EnrollmentSeeder membutuhkan MySQL 8+ atau PostgreSQL untuk insert server-side berukuran besar.');
        }

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('SET SESSION CHARACTERISTICS AS TRANSACTION READ WRITE');
        }

        $created = 0;

        while ($created < $target) {
            $end = min($created + $chunkSize, $target) - 1;

            if (DB::getDriverName() === 'pgsql') {
                DB::statement(<<<'SQL'
                    WITH student_list AS (
                        SELECT id, row_number() OVER (ORDER BY id) - 1 AS item_index
                        FROM students
                    ), course_list AS (
                        SELECT id, row_number() OVER (ORDER BY id) - 1 AS item_index
                        FROM courses
                    ), generated AS (
                        SELECT sequence_number,
                               floor(sequence_number / (CAST(? AS bigint) * 19998))::bigint AS student_index,
                               floor(mod(sequence_number, CAST(? AS bigint) * 19998) / 19998)::bigint AS course_index,
                               floor(mod(sequence_number, 19998) / 2)::bigint AS year_index,
                               CASE WHEN mod(sequence_number, 2) = 0 THEN 'GANJIL' ELSE 'GENAP' END AS semester
                        FROM generate_series(?::bigint, ?::bigint) AS sequence_number
                    )
                    INSERT INTO enrollments (student_id, course_id, academic_year, semester, status, grade, created_at, updated_at)
                    SELECT students.id,
                           courses.id,
                           lpad(generated.year_index::text, 4, '0') || '/' || lpad((generated.year_index + 1)::text, 4, '0'),
                           generated.semester,
                           'APPROVED',
                           floor(random() * 41 + 60)::integer,
                           CURRENT_TIMESTAMP,
                           CURRENT_TIMESTAMP
                    FROM generated
                    JOIN student_list AS students ON students.item_index = generated.student_index
                    JOIN course_list AS courses ON courses.item_index = generated.course_index
                    ON CONFLICT (student_id, course_id, academic_year, semester) DO NOTHING
                SQL, [$courseCount, $courseCount, $created, $end]);
            } else {
                DB::statement(<<<'SQL'
                    INSERT INTO enrollments (student_id, course_id, academic_year, semester, status, grade, created_at, updated_at)
                    WITH digits AS (
                        SELECT 0 AS digit UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
                        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
                    ), number_list AS (
                        SELECT ones.digit + tens.digit * 10 + hundreds.digit * 100 + thousands.digit * 1000 + ten_thousands.digit * 10000 AS sequence_number
                        FROM digits AS ones
                        CROSS JOIN digits AS tens
                        CROSS JOIN digits AS hundreds
                        CROSS JOIN digits AS thousands
                        CROSS JOIN digits AS ten_thousands
                    ), student_list AS (
                        SELECT id, ROW_NUMBER() OVER (ORDER BY id) - 1 AS item_index
                        FROM students
                    ), course_list AS (
                        SELECT id, ROW_NUMBER() OVER (ORDER BY id) - 1 AS item_index
                        FROM courses
                    ), generated AS (
                        SELECT number_list.sequence_number + CAST(? AS UNSIGNED) AS sequence_number,
                               FLOOR((number_list.sequence_number + CAST(? AS UNSIGNED)) / (CAST(? AS UNSIGNED) * 19998)) AS student_index,
                               FLOOR(MOD(number_list.sequence_number + CAST(? AS UNSIGNED), CAST(? AS UNSIGNED) * 19998) / 19998) AS course_index,
                               FLOOR(MOD(number_list.sequence_number + CAST(? AS UNSIGNED), 19998) / 2) AS year_index,
                               CASE WHEN MOD(number_list.sequence_number + CAST(? AS UNSIGNED), 2) = 0 THEN 'GANJIL' ELSE 'GENAP' END AS semester
                        FROM number_list
                        WHERE number_list.sequence_number BETWEEN 0 AND ?
                    )
                    SELECT students.id,
                           courses.id,
                           CONCAT(LPAD(CAST(generated.year_index AS CHAR), 4, '0'), '/', LPAD(CAST(generated.year_index + 1 AS CHAR), 4, '0')),
                           generated.semester,
                           'APPROVED',
                           FLOOR(RAND() * 41 + 60),
                           CURRENT_TIMESTAMP,
                           CURRENT_TIMESTAMP
                    FROM generated
                    JOIN student_list AS students ON students.item_index = generated.student_index
                    JOIN course_list AS courses ON courses.item_index = generated.course_index
                    ON DUPLICATE KEY UPDATE academic_year = VALUES(academic_year)
                SQL, [$created, $created, $courseCount, $created, $courseCount, $created, $created, $end - $created]);
            }

            $created = $end + 1;

            if ($created % 100_000 === 0 || $created === $target) {
                $this->command?->info("Enrollment dibuat: {$created}/{$target}");
            }
        }
    }
}
