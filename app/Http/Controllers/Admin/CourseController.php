<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Courses;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $courses = Courses::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return inertia('Admin/Courses/Index', [
            'courses' => $courses,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'regex:/^[A-Z]{2,4}[0-9]{3}$/', 'unique:courses,code'],
            'name' => ['required', 'string', 'min:3', 'max:120'],
            'credits' => ['required', 'integer', 'min:1', 'max:6'],
        ]);

        Courses::create($validated);

        return back()->with('success', 'Mata kuliah ditambahkan.');
    }

    public function destroy(Courses $course)
    {
        $course->delete();

        return back()->with('success', 'Mata kuliah dihapus.');
    }

    public function edit(Courses $course)
    {
        return inertia('Admin/Courses/Edit', [
            'course' => $course,
        ]);
    }

    public function update(Request $request, Courses $course)
    {
        $validated = $request->validate([
            'code' => ['required', 'regex:/^[A-Z]{2,4}[0-9]{3}$/', 'unique:courses,code,'.$course->id],
            'name' => ['required', 'string', 'min:3', 'max:120'],
            'credits' => ['required', 'integer', 'min:1', 'max:6'],
        ]);

        $course->update($validated);

        return to_route('admin.courses.index')->with('success', 'Mata kuliah diperbarui.');
    }
}
