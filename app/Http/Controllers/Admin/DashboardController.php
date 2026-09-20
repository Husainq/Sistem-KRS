<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Courses;
use App\Models\Enrollment;
use App\Models\Student;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'summary' => [
                'students' => Student::count(),
                'courses' => Courses::count(),
                'enrollments' => Enrollment::count(),
                'pendingEnrollments' => Enrollment::where('status', 'DRAFT')->count(),
            ],
            'statusCounts' => [
                'draft' => Enrollment::where('status', 'DRAFT')->count(),
                'submitted' => Enrollment::where('status', 'SUBMITTED')->count(),
                'approved' => Enrollment::where('status', 'APPROVED')->count(),
                'rejected' => Enrollment::where('status', 'REJECTED')->count(),
            ],
            'recentEnrollments' => Enrollment::with(['student:id,nim,name', 'course:id,code,name'])
                ->latest()
                ->limit(8)
                ->get(),
            'success' => session('success'),
        ]);
    }
}
