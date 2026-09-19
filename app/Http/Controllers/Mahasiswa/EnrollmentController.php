<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Courses;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $student = $request->user()->student;

        abort_unless($student, 404);

        $search = $request->string('search')->trim()->toString();

        $enrollments = Enrollment::query()
            ->with('course:id,code,name,credits')
            ->where('student_id', $student->id)
            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('academic_year', 'like', "%{$search}%")
                        ->orWhere('semester', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhereHas('course', function ($courseQuery) use ($search) {
                            $courseQuery->where('code', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Mahasiswa/Enrollments/Index', [
            'enrollments' => $enrollments,
            'student' => $student->only(['id', 'nim', 'name']),
            'courses' => Courses::query()->orderBy('code')->get(['id', 'code', 'name', 'credits']),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $student = $request->user()->student;

        abort_unless($student, 404);

        $validated = $request->validate([
            'course_id' => [
                'required',
                'exists:courses,id',
                Rule::unique('enrollments')->where(fn ($query) => $query
                    ->where('student_id', $student->id)
                    ->where('academic_year', $request->input('academic_year'))
                    ->where('semester', $request->input('semester'))),
            ],
            'academic_year' => ['required', 'regex:/^\d{4}\/\d{4}$/'],
            'semester' => ['required', 'in:GANJIL,GENAP'],
        ]);

        Enrollment::create([
            'student_id' => $student->id,
            'course_id' => $validated['course_id'],
            'academic_year' => $validated['academic_year'],
            'semester' => $validated['semester'],
            'status' => 'DRAFT',
        ]);

        return back()->with('success', 'KRS berhasil ditambahkan sebagai DRAFT.');
    }
}
