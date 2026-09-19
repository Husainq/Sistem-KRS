<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MahasiswaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $mahasiswa = Student::with('user')
            ->when($search, function ($query, $search) {
                $query->where('nim', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString() // PENTING: Supaya parameter search tidak hilang saat klik Next/Prev di pagination
            ->through(fn ($m) => [
                'id' => $m->id,
                'nim' => $m->nim,
                'name' => $m->user->name ?? '-',
                'email' => $m->user->email ?? '-',
            ]);

        return Inertia::render('Admin/Mahasiswa/Index', [
            'mahasiswa' => $mahasiswa,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nim' => 'required|string|max:20|unique:students,nim',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role' => 'mahasiswa',
                ]);

                Student::create([
                    'user_id' => $user->id,
                    'nim' => $validated['nim'],
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                ]);
            });

            return redirect()->back()->with('message', 'Mahasiswa berhasil ditambahkan');
        } catch (\Exception $e) {
            // Tulis error detail ke storage/logs/laravel.log
            Log::error('Gagal simpan mahasiswa: '.$e->getMessage());

            return redirect()->back()->withErrors([
                'database' => $e->getMessage(),
            ]);
        }
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $validated = $request->validate([
            'nim' => 'required|string|max:20|unique:students,nim,'.$student->id,
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$student->user_id,
        ]);

        DB::transaction(function () use ($student, $validated) {
            // Update data Student
            $student->update([
                'nim' => $validated['nim'],
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            // Update data User terkait
            if ($student->user) {
                $student->user->update([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                ]);
            }
        });

        return redirect()->back();
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);

        DB::transaction(function () use ($student) {
            // Hapus User (karena ada onDelete cascade, data student otomatis terhapus)
            if ($student->user) {
                $student->user->delete();
            } else {
                $student->delete();
            }
        });

        return redirect()->back();
    }
}
