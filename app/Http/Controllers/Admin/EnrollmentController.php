<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Courses;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\StreamedResponse;
use Illuminate\Support\Facades\DB;

class EnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $filters = $this->filters($request);
        $pageSize = min(max((int) $request->input('page_size', 10), 10), 100);
        $page = max((int) $request->input('page', 1), 1);
        $query = $this->filteredQuery($filters);

        $enrollments = $query
            ->paginate($pageSize, ['enrollments.*'], 'page', $page)
            ->withQueryString()
            ->through(fn ($row) => [
                'id' => $row->id,
                'student_id' => $row->student_id,
                'course_id' => $row->course_id,
                'academic_year' => $row->academic_year,
                'semester' => $row->semester,
                'status' => $row->status,
                'grade' => $row->grade,
                'student' => ['nim' => $row->student_nim, 'name' => $row->student_name],
                'course' => ['code' => $row->course_code, 'name' => $row->course_name],
            ]);

        return inertia('Admin/Enrollments/Index', [
            'enrollments' => $enrollments,
            'students' => Student::query()->orderBy('name')->get(['id', 'nim', 'name']),
            'courses' => Courses::query()->orderBy('code')->get(['id', 'code', 'name']),
            'filters' => [...$filters, 'page_size' => $pageSize],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = $this->filteredQuery($this->filters($request));
        $filename = 'enrollments-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($query): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['ID', 'NIM', 'Nama Mahasiswa', 'Kode MK', 'Nama MK', 'Tahun Akademik', 'Semester', 'Status', 'Nilai']);

            $query->orderBy('enrollments.id')->chunkById(5000, function ($rows) use ($output): void {
                foreach ($rows as $row) {
                    fputcsv($output, [$row->id, $row->student_nim, $row->student_name, $row->course_code, $row->course_name, $row->academic_year, $row->semester, $row->status, $row->grade]);
                }
            }, 'enrollments.id', 'id');

            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function store(Request $request)
    {
        Enrollment::create($this->validateEnrollment($request));

        return back()->with('success', 'Enrollment ditambahkan.');
    }

    public function update(Request $request, Enrollment $enrollment)
    {
        $enrollment->update($this->validateEnrollment($request));

        return back()->with('success', 'Enrollment diperbarui.');
    }

    public function destroy(Enrollment $enrollment)
    {
        $enrollment->delete();

        return back()->with('success', 'Enrollment dihapus.');
    }

    private function validateEnrollment(Request $request): array
    {
        return $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'course_id' => ['required', 'exists:courses,id'],
            'academic_year' => ['required', 'regex:/^\d{4}\/\d{4}$/'],
            'semester' => ['required', 'in:GANJIL,GENAP'],
            'status' => ['required', 'in:DRAFT,SUBMITTED,APPROVED,REJECTED'],
            'grade' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);
    }

    private function filters(Request $request): array
    {
        return [
            'search' => trim((string) $request->input('search', '')),
            'nim' => trim((string) $request->input('nim', '')),
            'student_name' => trim((string) $request->input('student_name', '')),
            'course_code' => trim((string) $request->input('course_code', '')),
            'academic_year' => trim((string) $request->input('academic_year', '')),
            'semester' => $request->input('semester', ''),
            'status' => $request->input('status', ''),
            'filter_logic' => strtoupper($request->input('filter_logic', 'AND')) === 'OR' ? 'OR' : 'AND',
            'sort_by' => $request->input('sort_by', 'id'),
            'sort_direction' => strtolower($request->input('sort_direction', 'desc')) === 'asc' ? 'asc' : 'desc',
        ];
    }

    private function filteredQuery(array $filters)
    {
        $sortColumns = [
            'id' => 'enrollments.id',
            'nim' => 'students.nim',
            'student_name' => 'students.name',
            'course_code' => 'courses.code',
            'academic_year' => 'enrollments.academic_year',
            'semester' => 'enrollments.semester',
            'status' => 'enrollments.status',
            'grade' => 'enrollments.grade',
        ];
        $query = DB::table('enrollments')
            ->join('students', 'students.id', '=', 'enrollments.student_id')
            ->join('courses', 'courses.id', '=', 'enrollments.course_id')
            ->select('enrollments.*', 'students.nim as student_nim', 'students.name as student_name', 'courses.code as course_code', 'courses.name as course_name');

        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($query) use ($search): void {
                $query->where('students.nim', 'like', "%{$search}%")
                    ->orWhere('students.name', 'like', "%{$search}%")
                    ->orWhere('courses.code', 'like', "%{$search}%");
            });
        }

        $advanced = [
            ['students.nim', $filters['nim']],
            ['students.name', $filters['student_name']],
            ['courses.code', $filters['course_code']],
            ['enrollments.academic_year', $filters['academic_year']],
            ['enrollments.semester', $filters['semester']],
            ['enrollments.status', $filters['status']],
        ];
        $advanced = array_values(array_filter($advanced, fn (array $filter): bool => $filter[1] !== ''));

        if ($advanced !== []) {
            $method = $filters['filter_logic'] === 'OR' ? 'where' : 'where';
            $query->{$method}(function ($query) use ($advanced, $filters): void {
                foreach ($advanced as $index => [$column, $value]) {
                    $operator = $index === 0 ? 'where' : ($filters['filter_logic'] === 'OR' ? 'orWhere' : 'where');
                    $query->{$operator}($column, 'like', "%{$value}%");
                }
            });
        }

        return $query->orderBy($sortColumns[$filters['sort_by']] ?? $sortColumns['id'], $filters['sort_direction']);
    }
}
