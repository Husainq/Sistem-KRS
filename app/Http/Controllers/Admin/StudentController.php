<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $students = Student::with('user')
            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('nim', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return inertia('Admin/Mahasiswa/Index', [
            'mahasiswa' => $students,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nim' => ['required', 'regex:/^[0-9]{8,12}$/', 'unique:students,nim'],
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'mahasiswa',
        ]);

        $student = Student::create([
            'user_id' => $user->id,
            'nim' => $validated['nim'],
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        return to_route('admin.mahasiswa.index')->with('success', 'Mahasiswa dibuat.');
    }

    public function destroy(Student $student)
    {
        // delete associated user account as well
        $user = $student->user;
        $student->delete();

        if ($user) {
            $user->delete();
        }

        return back()->with('success', 'Mahasiswa dihapus.');
    }

    public function edit(Student $student)
    {
        return inertia('Admin/Mahasiswa/Edit', [
            'student' => $student->load('user'),
        ]);
    }

    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'nim' => ['required', 'regex:/^[0-9]{8,12}$/', 'unique:students,nim,'.$student->id],
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'unique:users,email,'.$student->user_id],
        ]);

        $student->update([
            'nim' => $validated['nim'],
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if ($student->user) {
            $student->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);
        }

        return to_route('admin.mahasiswa.index')->with('success', 'Mahasiswa diperbarui.');
    }
}
