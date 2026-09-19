<?php

namespace Database\Seeders;

use App\Models\Courses;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $courses = [];

        for ($index = 1; $index <= 20; $index++) {
            $courses[] = [
                'code' => sprintf('IF%03d', $index),
                'name' => "Mata Kuliah Informatika {$index}",
                'credits' => $index % 2 === 0 ? 3 : 2,
            ];
        }

        foreach ($courses as $course) {
            Courses::updateOrCreate(['code' => $course['code']], $course);
        }
    }
}
