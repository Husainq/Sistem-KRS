<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $student = $request->user()->student;

        abort_unless($student, 404);

        $enrollments = Enrollment::query()
            ->with('course:id,code,name,credits')
            ->where('student_id', $student->id);

        return Inertia::render('Mahasiswa/Dashboard', [
            'student' => $student->only(['id', 'nim', 'name']),
            'summary' => [
                'totalCredits' => (int) (clone $enrollments)->join('courses', 'courses.id', '=', 'enrollments.course_id')->sum('courses.credits'),
                'totalEnrollments' => (clone $enrollments)->count(),
                'draftCount' => (clone $enrollments)->where('status', 'DRAFT')->count(),
            ],
            'recentEnrollments' => $enrollments->latest()->limit(5)->get(),
        ]);
    }
}
