<?php

namespace Tests\Feature;

use App\Models\Courses;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreateKrsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_student_course_and_enrollment_in_one_request(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->from('/admin/dashboard')
            ->post('/admin/krs', [
                'nim' => '20260001',
                'student_name' => 'Mahasiswa Baru',
                'student_email' => 'baru@example.com',
                'course_code' => 'IF999',
                'course_name' => 'Pengujian Sistem',
                'credits' => 3,
                'academic_year' => '2026/2027',
                'semester' => 'GANJIL',
                'status' => 'DRAFT',
            ])
            ->assertRedirect('/admin/dashboard')
            ->assertSessionHas('success');

        $student = Student::where('nim', '20260001')->firstOrFail();
        $course = Courses::where('code', 'IF999')->firstOrFail();

        $this->assertDatabaseHas('users', ['email' => 'baru@example.com', 'role' => 'mahasiswa']);
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'course_id' => $course->id,
            'academic_year' => '2026/2027',
            'semester' => 'GANJIL',
            'status' => 'DRAFT',
        ]);
        $this->assertSame(1, Enrollment::count());
    }

    public function test_duplicate_student_or_course_is_rejected_without_creating_enrollment(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $existingUser = User::factory()->create(['email' => 'existing@example.com']);
        Student::create([
            'user_id' => $existingUser->id,
            'nim' => '20260002',
            'name' => 'Existing Student',
            'email' => $existingUser->email,
        ]);
        Courses::create(['code' => 'IF998', 'name' => 'Existing Course', 'credits' => 3]);

        $this->from('/admin/dashboard')
            ->post('/admin/krs', [
                'nim' => '20260002',
                'student_name' => 'Mahasiswa Gagal',
                'student_email' => 'failed@example.com',
                'course_code' => 'IF998',
                'course_name' => 'Course Gagal',
                'credits' => 3,
                'academic_year' => '2026/2027',
                'semester' => 'GANJIL',
                'status' => 'DRAFT',
            ])
            ->assertRedirect('/admin/dashboard')
            ->assertSessionHasErrors(['nim', 'course_code']);

        $this->assertDatabaseMissing('users', ['email' => 'failed@example.com']);
        $this->assertSame(0, Enrollment::count());
    }
}
