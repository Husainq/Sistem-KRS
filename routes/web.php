<?php

use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\EnrollmentController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Mahasiswa\DashboardController;
use App\Http\Controllers\Mahasiswa\EnrollmentController as MahasiswaEnrollmentController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Halaman utama
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Shared Dashboard (Diakses oleh Admin & Mahasiswa)
Route::middleware(['auth'])->group(function () {
    // Single entry point: mengarahkan user ke dashboard masing-masing sesuai role
    Route::get('/dashboard', function () {
        $user = Auth::user();

        if ($user && $user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('mahasiswa.dashboard');
    })->name('dashboard');
});

// Route Khusus Aksi ADMIN
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    // Admin dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])
        ->name('admin.dashboard');

    // Admin: manage mahasiswa
    Route::get('/mahasiswa', [StudentController::class, 'index'])
        ->name('admin.mahasiswa.index');
    Route::post('/mahasiswa', [StudentController::class, 'store'])
        ->name('admin.mahasiswa.store');
    Route::delete('/mahasiswa/{student}', [StudentController::class, 'destroy'])
        ->name('admin.mahasiswa.destroy');
    Route::get('/mahasiswa/{student}/edit', [StudentController::class, 'edit'])
        ->name('admin.mahasiswa.edit');
    Route::put('/mahasiswa/{student}', [StudentController::class, 'update'])
        ->name('admin.mahasiswa.update');

    // Admin: manage courses
    Route::get('/courses', [CourseController::class, 'index'])
        ->name('admin.courses.index');
    Route::post('/courses', [CourseController::class, 'store'])
        ->name('admin.courses.store');
    Route::delete('/courses/{course}', [CourseController::class, 'destroy'])
        ->name('admin.courses.destroy');
    Route::get('/courses/{course}/edit', [CourseController::class, 'edit'])
        ->name('admin.courses.edit');
    Route::put('/courses/{course}', [CourseController::class, 'update'])
        ->name('admin.courses.update');

    // Admin: manage enrollments
    Route::get('/enrollments/export', [EnrollmentController::class, 'export'])
        ->name('admin.enrollments.export');
    Route::get('/enrollments', [EnrollmentController::class, 'index'])
        ->name('admin.enrollments.index');
    Route::post('/enrollments', [EnrollmentController::class, 'store'])
        ->name('admin.enrollments.store');
    Route::put('/enrollments/{enrollment}', [EnrollmentController::class, 'update'])
        ->name('admin.enrollments.update');
    Route::delete('/enrollments/{enrollment}', [EnrollmentController::class, 'destroy'])
        ->name('admin.enrollments.destroy');

});

// Route Khusus Mahasiswa
Route::middleware(['auth', 'role:mahasiswa'])->prefix('mahasiswa')->group(function () {
    // Mahasiswa dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('mahasiswa.dashboard');

    // Mahasiswa: view enrollments (KRS)
    Route::get('/enrollments', [MahasiswaEnrollmentController::class, 'index'])
        ->name('mahasiswa.enrollments.index');
    Route::post('/enrollments', [MahasiswaEnrollmentController::class, 'store'])
        ->name('mahasiswa.enrollments.store');
});
require __DIR__.'/auth.php';
